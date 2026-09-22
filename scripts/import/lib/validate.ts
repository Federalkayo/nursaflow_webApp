import { ImportRow } from './types';

const MAX_QUESTION_LEN = 2000;
const MAX_OPTION_LEN = 500;
const MAX_RATIONALE_LEN = 3000;

/**
 * Returns a rejection reason string if the row should NOT enter the
 * question bank, or null if it passes validation.
 *
 * This mirrors the "STEP 5 — QUESTION QUALITY" gate from the spec:
 * a question must not exist in a usable state if it has missing
 * text/answer, duplicate/invalid options, or no unambiguous correct answer.
 */
export function validateRow(row: ImportRow): string | null {
  if (!row.question || row.question.trim().length < 8) {
    return 'question_missing_or_too_short';
  }
  if (row.question.length > MAX_QUESTION_LEN) {
    return 'question_too_long';
  }
  if (!Array.isArray(row.options) || row.options.length < 2) {
    return 'insufficient_options';
  }
  if (row.options.length > 6) {
    return 'too_many_options';
  }
  if (row.options.some((o) => !o || !o.trim())) {
    return 'empty_option';
  }
  if (row.options.some((o) => o.length > MAX_OPTION_LEN)) {
    return 'option_too_long';
  }

  const normalizedOptions = row.options.map((o) => o.trim().toLowerCase());
  if (new Set(normalizedOptions).size !== normalizedOptions.length) {
    return 'duplicate_options';
  }

  if (!row.correct_answer || !row.correct_answer.trim()) {
    return 'missing_correct_answer';
  }

  const correctMatches = row.options.filter(
    (o) => o.trim().toLowerCase() === row.correct_answer.trim().toLowerCase()
  );
  if (correctMatches.length === 0) {
    return 'correct_answer_not_in_options';
  }
  if (correctMatches.length > 1) {
    return 'correct_answer_ambiguous_multiple_matches';
  }

  if (row.rationale && row.rationale.length > MAX_RATIONALE_LEN) {
    return 'rationale_too_long';
  }

  if (!row.topic_id) {
    return 'missing_topic';
  }
  if (!row.source || !row.source_id) {
    return 'missing_source_attribution';
  }
  if (!row.license) {
    return 'missing_license';
  }

  return null;
}
