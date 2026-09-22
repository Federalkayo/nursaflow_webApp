// Service-role Supabase client for import scripts ONLY.
//
// This key bypasses RLS and must never be used in frontend code or
// committed to source control. It is read from SUPABASE_SERVICE_ROLE_KEY,
// which should be set as a local shell env var (see scripts/import/README.md),
// never as a VITE_ prefixed variable.

import { createClient } from '@supabase/supabase-js';
import { ImportRow } from './types';

export function getAdminClient() {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('VITE_SUPABASE_URL (or SUPABASE_URL) is required.');
  if (!serviceKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY is required to import questions (this bypasses RLS by design — ' +
        'question writes are never allowed from the anon/client key). Get it from ' +
        'Project Settings > API in the Supabase dashboard and export it in your shell, never commit it.'
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/**
 * Inserts a batch of already-validated rows, skipping any that already
 * exist for the same (source, source_id) — the unique index added in
 * migration 007 enforces this at the DB level too, this just avoids
 * noisy conflict errors for the common re-run case.
 */
export async function upsertBatch(
  rows: ImportRow[]
): Promise<{ inserted: number; duplicates: number; errors: { row: ImportRow; error: string }[] }> {
  const admin = getAdminClient();
  let inserted = 0;
  let duplicates = 0;
  const errors: { row: ImportRow; error: string }[] = [];

  const BATCH_SIZE = 50;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { data, error } = await admin
      .from('quiz_questions')
      .upsert(batch, { onConflict: 'source,source_id', ignoreDuplicates: true })
      .select('id');

    if (error) {
      // Fall back to per-row insert so one bad row doesn't fail the whole batch.
      for (const row of batch) {
        const { error: rowError } = await admin
          .from('quiz_questions')
          .upsert(row, { onConflict: 'source,source_id', ignoreDuplicates: true });
        if (rowError) {
          errors.push({ row, error: rowError.message });
        } else {
          inserted += 1;
        }
      }
      continue;
    }

    inserted += data?.length || 0;
    duplicates += batch.length - (data?.length || 0);
  }

  return { inserted, duplicates, errors };
}
