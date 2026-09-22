import fs from 'fs';
import path from 'path';
import { ImportReport } from './types';

export function printAndSaveReport(report: ImportReport) {
  report.finishedAt = new Date().toISOString();

  const lines = [
    `\n=== Import Report: ${report.source} ===`,
    `Started:            ${report.startedAt}`,
    `Finished:           ${report.finishedAt}`,
    `Total fetched:      ${report.totalFetched}`,
    `Imported (review):  ${report.imported}`,
    `Skipped duplicates: ${report.skippedDuplicate}`,
    `Skipped invalid:    ${report.skippedInvalid}`,
    `Distractor gen failures: ${report.distractorGenFailures}`,
  ];

  if (Object.keys(report.rejectedReasons).length > 0) {
    lines.push('Rejection reasons:');
    for (const [reason, count] of Object.entries(report.rejectedReasons)) {
      lines.push(`  - ${reason}: ${count}`);
    }
  }

  lines.push(
    '',
    'NOTE: all imported rows have status = "review". None are visible to',
    'students yet. Review them (spot-check distractors and topic mapping',
    'especially) then publish with:',
    '',
    `  UPDATE public.quiz_questions SET status = 'published'`,
    `  WHERE source = '${report.source}' AND status = 'review';`,
    ''
  );

  const output = lines.join('\n');
  console.log(output);

  const reportsDir = path.join(process.cwd(), 'supabase', 'import-reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const filename = `${report.source.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.json`;
  fs.writeFileSync(path.join(reportsDir, filename), JSON.stringify(report, null, 2));
  console.log(`Full report saved to supabase/import-reports/${filename}`);
}
