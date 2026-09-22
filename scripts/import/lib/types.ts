// Shared types for the NursaFlow question bank importer.

export interface RawQuestionRecord {
  /** Stable id from the source dataset, used for dedup via (source, source_id). */
  sourceId: string;
  source: 'MedNurse-QA' | 'AfriMed-QA';
  license: string;
  question: string;
  /** MCQ options in display order. Empty if the source has no options yet (needs distractors). */
  options: string[];
  correctAnswer: string;
  rationale: string | null;
  /** Free-text topic hint from the source (book/chapter, specialty, etc). Mapped to a topic_id later. */
  topicHint: string;
  subtopic: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  aiGeneratedOptions: boolean;
}

export interface ImportRow {
  topic_id: string;
  subtopic: string | null;
  question: string;
  question_type: 'mcq';
  options: string[];
  correct_answer: string;
  rationale: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  source: string;
  source_id: string;
  license: string;
  ai_generated_options: boolean;
  status: 'review'; // importer never auto-publishes — see README
}

export interface ImportReport {
  source: string;
  totalFetched: number;
  imported: number;
  skippedDuplicate: number;
  skippedInvalid: number;
  rejectedReasons: Record<string, number>;
  distractorGenFailures: number;
  startedAt: string;
  finishedAt: string;
}

export function newReport(source: string): ImportReport {
  return {
    source,
    totalFetched: 0,
    imported: 0,
    skippedDuplicate: 0,
    skippedInvalid: 0,
    rejectedReasons: {},
    distractorGenFailures: 0,
    startedAt: new Date().toISOString(),
    finishedAt: '',
  };
}

export function rejectRow(report: ImportReport, reason: string) {
  report.skippedInvalid += 1;
  report.rejectedReasons[reason] = (report.rejectedReasons[reason] || 0) + 1;
}
