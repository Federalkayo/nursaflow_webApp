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

/** answer_options / correct_answer may come through as a JSON-encoded string or a real array. */
function asStringArray(value: string | string[] | null): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  const trimmed = value.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((v) => String(v).trim()).filter(Boolean);
    } catch {
      // fall through to delimiter split below
    }
  }
  return trimmed
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * The source's correct_answer is sometimes the full option text, sometimes
 * a short label (a bare letter like "A", or a 1-based index like "2").
 * Returns the resolved full-text answer, or null if it can't be matched to
 * any option — callers should skip the row rather than guess.
 */
function resolveCorrectAnswer(rawCorrect: string, options: string[]): string | null {
  const trimmed = rawCorrect.trim();
  if (!trimmed || options.length === 0) return null;

  // Case 1: exact (case-insensitive) match against option text.
  const directMatch = options.find((o) => o.toLowerCase() === trimmed.toLowerCase());
  if (directMatch) return directMatch;

  // Case 2: a bare letter label (A/B/C/D/E), optionally with a trailing
  // period/paren, e.g. "A", "A.", "(A)".
  const letterMatch = trimmed.match(/^\(?([A-Ea-e])\)?\.?$/);
  if (letterMatch) {
    const idx = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
    if (idx >= 0 && idx < options.length) return options[idx];
  }

  // Case 3: a bare 1-based number.
  const numMatch = trimmed.match(/^(\d+)\.?$/);
  if (numMatch) {
    const idx = parseInt(numMatch[1], 10) - 1;
    if (idx >= 0 && idx < options.length) return options[idx];
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

    if (!loggedSampleMcq) {
      console.log('Sample MCQ row (for verifying field shapes):', JSON.stringify(raw).slice(0, 500));
      loggedSampleMcq = true;
    }

    const question = (raw.question_clean || raw.question || '').trim();
    const options = asStringArray(raw.answer_options);
    const rawCorrectValues = asStringArray(raw.correct_answer);

    if (rawCorrectValues.length !== 1) {
      // Multiple-correct-answer MCQs don't fit the single-answer schema
      // quiz_questions uses today — skip rather than guess which one "counts".
      rejectRow(report, 'multiple_or_zero_correct_answers_unsupported');
      continue;
    }

    const resolvedCorrect = resolveCorrectAnswer(rawCorrectValues[0], options);
    if (!resolvedCorrect) {
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
