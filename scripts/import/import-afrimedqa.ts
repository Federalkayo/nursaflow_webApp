// Imports the MCQ subset of afrimedqa/afrimedqa_v2 into quiz_questions.
//
// Source: https://huggingface.co/datasets/afrimedqa/afrimedqa_v2
//   (an UNGATED mirror of intronhealth/afrimedqa_v2 — same 15,275 rows,
//   same authors/content, no access-approval step needed)
// License: CC-BY-4.0 (plain attribution — simpler than the gated mirror's
//   CC-BY-SA-4.0; still cite AfriMed-QA, Olatunji et al. 2024/2025,
//   arXiv:2411.15640 if you publish content derived from it)
// Format: real MCQ options + correct answer + rationale already exist —
//   no AI-generated distractors needed. Every row still lands at
//   status = 'review' because this is pan-African (not nursing-specific)
//   clinical content that should get a human pass before nursing students
//   see it, per Rule 5 (accuracy over quantity).
//
// This importer only takes question_type === 'MCQ' rows with a single
// resolvable correct answer and (when the field is present) quality !== false.
// correct_answer in the source is sometimes the full option text and
// sometimes a short label (e.g. a letter) — handled defensively below,
// see resolveCorrectAnswer().
//
// Usage: npm run import:afrimedqa -- [--limit=200] [--tier=Expert]

import { fetchParquetRows } from './lib/parquetClient';
import { mapAfriMedQaTopic } from './lib/topicMap';
import { validateRow } from './lib/validate';
import { upsertBatch } from './lib/supabaseAdmin';
import { newReport, rejectRow, ImportRow } from './lib/types';
import { printAndSaveReport } from './lib/report';

const DATASET = 'afrimedqa/afrimedqa_v2';
const LICENSE = 'CC-BY-4.0';

interface AfriMedQaRow {
  sample_id: string;
  question_type: string; // 'MCQ' | 'SAQ' | 'consumer_queries'
  question: string;
  question_clean?: string;
  answer_options: string | string[] | null;
  correct_answer: string | string[] | null;
  answer_rationale: string | null;
  specialty: string | null;
  tier: string; // 'Expert' | 'crowdsourced' (casing varies)
  quality?: boolean | null;
}

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  const tierArg = process.argv.find((a) => a.startsWith('--tier='));
  return {
    limit: limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined,
    tierFilter: tierArg ? tierArg.split('=')[1].toLowerCase() : undefined,
  };
}

/**
 * The source's answer_options is a JSON OBJECT keyed "option1".."option5"
 * (confirmed against a real row — NOT a JSON array, despite how similar
 * fields look in other datasets). Returns an ordered {key, text} list,
 * ordered by the numeric suffix in the key so option1 comes first.
 */
function parseAnswerOptionsObject(value: string | string[] | null): { key: string; text: string }[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return Object.entries(parsed)
        .map(([key, text]) => ({ key, text: String(text).trim() }))
        .filter((o) => o.text)
        .sort((a, b) => {
          const na = parseInt(a.key.replace(/[^0-9]/g, ''), 10) || 0;
          const nb = parseInt(b.key.replace(/[^0-9]/g, ''), 10) || 0;
          return na - nb;
        });
    }
    if (Array.isArray(parsed)) {
      return parsed.map((v, i) => ({ key: String(i), text: String(v).trim() })).filter((o) => o.text);
    }
  } catch {
    // Not JSON — fall through to treating it as a single option (rejected downstream, too few options).
  }
  return [{ key: '0', text: raw.trim() }];
}

/**
 * The source's correct_answer is the OBJECT KEY (e.g. "option4"), matched
 * directly against parseAnswerOptionsObject()'s keys — confirmed against a
 * real row. Falls back to matching option text directly, or a bare letter/
 * number, in case other rows use a different convention. Returns the
 * resolved full option TEXT (what actually gets stored/shown), or null if
 * unresolvable — callers should skip the row rather than guess.
 */
function resolveCorrectAnswer(rawCorrect: string, parsedOptions: { key: string; text: string }[]): string | null {
  const trimmed = rawCorrect.trim();
  if (!trimmed || parsedOptions.length === 0) return null;

  const byKey = parsedOptions.find((o) => o.key.toLowerCase() === trimmed.toLowerCase());
  if (byKey) return byKey.text;

  const byText = parsedOptions.find((o) => o.text.toLowerCase() === trimmed.toLowerCase());
  if (byText) return byText.text;

  const letterMatch = trimmed.match(/^\(?([A-Ea-e])\)?\.?$/);
  if (letterMatch) {
    const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
    if (idx >= 0 && idx < parsedOptions.length) return parsedOptions[idx].text;
  }

  const numMatch = trimmed.match(/^([0-9]+)\.?$/);
  if (numMatch) {
    const idx = parseInt(numMatch[1], 10) - 1;
    if (idx >= 0 && idx < parsedOptions.length) return parsedOptions[idx].text;
  }

  return null;
}

async function main() {
  const { limit, tierFilter } = parseArgs();
  const hfToken = process.env.HF_TOKEN; // optional — this mirror is ungated

  const report = newReport('AfriMed-QA');
  const toImport: ImportRow[] = [];

  console.log(
    `Fetching ${DATASET}${limit ? '' : ' (full dataset)'}${tierFilter ? `, tier=${tierFilter}` : ''}...`
  );

  const rows = await fetchParquetRows<AfriMedQaRow>({ dataset: DATASET, hfToken });
  if (rows.length > 0) {
    console.log('Sample row fields:', Object.keys(rows[0] as object));
  }

  let loggedSampleMcq = false;

  for (const raw of rows) {
    report.totalFetched += 1;
    if (limit && report.totalFetched > limit) break;

    if ((raw.question_type || '').toUpperCase() !== 'MCQ') {
      rejectRow(report, 'not_mcq_type');
      continue;
    }
    if (tierFilter && (raw.tier || '').toLowerCase() !== tierFilter) {
      rejectRow(report, 'tier_filtered_out');
      continue;
    }
    if (raw.quality === false) {
      rejectRow(report, 'flagged_low_quality_by_reviewer');
      continue;
    }

    const question = (raw.question_clean || raw.question || '').trim();
    const parsedOptions = parseAnswerOptionsObject(raw.answer_options);
    const options = parsedOptions.map((o) => o.text);
    const rawCorrect = Array.isArray(raw.correct_answer) ? raw.correct_answer[0] : raw.correct_answer;

    if (!loggedSampleMcq) {
      console.log('--- Sample MCQ row (raw field values, for debugging) ---');
      console.log('answer_options (parsed):', JSON.stringify(parsedOptions));
      console.log('correct_answer (raw):', JSON.stringify(raw.correct_answer));
      console.log('---------------------------------------------------------');
      loggedSampleMcq = true;
    }

    if (!rawCorrect) {
      rejectRow(report, 'multiple_or_zero_correct_answers_unsupported');
      continue;
    }

    const resolvedCorrect = resolveCorrectAnswer(rawCorrect, parsedOptions);
    if (!resolvedCorrect) {
      if (report.rejectedReasons['correct_answer_unresolvable'] === undefined) {
        console.log('[unresolvable example] options:', JSON.stringify(parsedOptions), 'correct_answer:', JSON.stringify(rawCorrect));
      }
      rejectRow(report, 'correct_answer_unresolvable');
      continue;
    }

    const row: ImportRow = {
      topic_id: mapAfriMedQaTopic(raw.specialty || ''),
      subtopic: raw.specialty?.replace(/_/g, ' ') || null,
      question,
      question_type: 'mcq',
      options,
      correct_answer: resolvedCorrect,
      rationale: raw.answer_rationale?.trim() || null,
      difficulty: (raw.tier || '').toLowerCase() === 'expert' ? 'hard' : 'medium',
      source: 'AfriMed-QA',
      source_id: raw.sample_id,
      license: LICENSE,
      ai_generated_options: false,
      status: 'review',
    };

    const rejection = validateRow(row);
    if (rejection) {
      rejectRow(report, rejection);
      continue;
    }

    toImport.push(row);
  }

  console.log(`Validated ${toImport.length} rows. Writing to Supabase...`);
  const { inserted, duplicates, errors } = await upsertBatch(toImport);
  report.imported = inserted;
  report.skippedDuplicate += duplicates;

  if (errors.length > 0) {
    console.error(`${errors.length} rows failed to insert:`);
    errors.slice(0, 10).forEach((e) => console.error(`  - ${e.row.source_id}: ${e.error}`));
  }

  printAndSaveReport(report);
}

main().catch((err) => {
  console.error('Import failed:', err);
  process.exit(1);
});
