// Imports NevenaD/MedNurse-QA into quiz_questions.
//
// Source: https://huggingface.co/datasets/NevenaD/MedNurse-QA
// License: dataset card states CC-BY 4.0, attributing Open RN textbooks
//   (https://www.cvtc.edu/grants/open-rn); the HF metadata badge on the
//   same page says apache-2.0. We record both and follow the stricter
//   requirement (attribution) either way — see README for how that
//   attribution should surface in the product.
// Format: question/answer pairs only, NO multiple-choice options.
//
// Distractor strategy (default: FREE, no API key needed):
//   Wrong-answer options are sampled from OTHER real answers in the same
//   chapter, rather than asking an AI to invent them. This costs nothing
//   and has no rate limits. Pass --ai to use Groq-based generation instead
//   (slower, costs money, hits Groq's daily token cap on free tiers — see
//   README before choosing this).
// Either way, every row lands at status = 'review' — nothing is visible to
// students until a human approves it.
//
// Usage:
//   npm run import:mednurse -- [--limit=200] [--ai]

import { fetchParquetRows } from './lib/parquetClient';
import { generateDistractors } from './lib/groqDistractors';
import { buildAnswerPool, sampleDistractors, shuffleWithCorrect } from './lib/sampleDistractors';
import { mapMedNurseTopic } from './lib/topicMap';
import { validateRow } from './lib/validate';
import { upsertBatch } from './lib/supabaseAdmin';
import { newReport, rejectRow, ImportRow } from './lib/types';
import { printAndSaveReport } from './lib/report';

const DATASET = 'NevenaD/MedNurse-QA';
const LICENSE = 'CC-BY-4.0 (per dataset card; HF badge shows apache-2.0 — see README)';

interface MedNurseRow {
  question: string;
  answer: string;
  'sub-chapter': string;
  chapter: string;
  book: string;
}

function parseArgs() {
  const limitArg = process.argv.find((a) => a.startsWith('--limit='));
  return {
    limit: limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined,
    useAi: process.argv.includes('--ai'),
  };
}

async function main() {
  const { limit, useAi } = parseArgs();
  const report = newReport('MedNurse-QA');

  console.log(
    `Fetching ${DATASET}${limit ? ` (limit ${limit})` : ' (full dataset)'} — ` +
      `distractor mode: ${useAi ? 'Groq AI (costs money, rate-limited)' : 'free sampling (no API needed)'}...`
  );

  // Pass 1: download the whole split as one Parquet file and collect rows.
  const rawRows: { question: string; answer: string; chapter: string; subChapter: string; book: string }[] = [];
  const parquetRows = await fetchParquetRows<MedNurseRow>({ dataset: DATASET, maxRows: limit });
  for (const raw of parquetRows) {
    report.totalFetched += 1;
    const question = (raw.question || '').trim();
    const answer = (raw.answer || '').trim();
    if (!question || !answer) {
      rejectRow(report, 'missing_question_or_answer');
      continue;
    }
    rawRows.push({
      question,
      answer,
      chapter: raw.chapter || '',
      subChapter: raw['sub-chapter'] || '',
      book: raw.book || '',
    });
  }

  if (parquetRows.length > 0) {
    console.log('Sample row fields:', Object.keys(parquetRows[0] as object));
  }
  console.log(`Fetched ${rawRows.length} usable rows. Building answer pool for free distractor sampling...`);
  // Group by `sub-chapter` (subChapter), not `book` or `chapter` — sub-chapter
  // is granular and well-populated (e.g. "antidiabetics", "respiratory assessment"),
  // giving topically-tight distractors. Falls back to book when a row has no
  // sub-chapter, and sampleDistractors() itself falls back further to the
  // global pool when a group is too small to sample 3 distinct answers from.
  const pool = buildAnswerPool(
    rawRows.map((r) => ({ groupKey: (r.subChapter || r.book).toLowerCase(), answer: r.answer }))
  );

  // Pass 2: dedupe by question text, generate options, validate.
  const toImport: ImportRow[] = [];
  const seenQuestions = new Set<string>();
  let rowIdx = 0;

  for (const r of rawRows) {
    rowIdx += 1;
    const dedupeKey = r.question.toLowerCase();
    if (seenQuestions.has(dedupeKey)) {
      report.skippedDuplicate += 1;
      continue;
    }
    seenQuestions.add(dedupeKey);

    let options: string[] | null = null;
    let aiGenerated = false;

    if (useAi) {
      const result = await generateDistractors(r.question, r.answer);
      if (result) options = result.options;
      else report.distractorGenFailures += 1;
      aiGenerated = true;
      await new Promise((res) => setTimeout(res, 250)); // pace Groq calls
    } else {
      const distractors = sampleDistractors(pool, (r.subChapter || r.book).toLowerCase(), r.answer);
      if (distractors) options = shuffleWithCorrect(r.answer, distractors);
      else report.distractorGenFailures += 1;
    }

    if (!options) {
      rejectRow(report, 'distractor_generation_failed');
      continue;
    }

    const row: ImportRow = {
      topic_id: mapMedNurseTopic(r.book, r.chapter),
      subtopic: r.subChapter?.trim() || null,
      question: r.question,
      question_type: 'mcq',
      options,
      correct_answer: r.answer,
      rationale: r.chapter
        ? `Source: ${r.book || 'Open RN textbook'}, chapter "${r.chapter}".`
        : `Source: ${r.book || 'Open RN textbook'}.`,
      difficulty: 'medium', // source has no difficulty signal; default until reviewed
      source: 'MedNurse-QA',
      source_id: `mednurse-${rowIdx}`,
      license: LICENSE,
      ai_generated_options: aiGenerated,
      status: 'review',
    };

    const rejection = validateRow(row);
    if (rejection) {
      rejectRow(report, rejection);
      continue;
    }

    toImport.push(row);

    if (toImport.length % 500 === 0) {
      console.log(`  ...validated ${toImport.length} so far (of ${rawRows.length} fetched)`);
    }
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
