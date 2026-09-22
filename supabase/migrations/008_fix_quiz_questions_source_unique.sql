-- 008_fix_quiz_questions_source_unique.sql
-- The partial unique index from 007 can't be used as an ON CONFLICT arbiter
-- by Supabase's upsert() unless the query repeats its WHERE clause, which
-- the JS client doesn't support. Replace it with a plain unique constraint.
-- Safe because the importer already rejects any row missing source/source_id
-- before it reaches the DB (see scripts/import/lib/validate.ts).
--
-- Applied directly to the NursaFlow Supabase project (dnwozxhtbgbpkdvknajh)
-- via the Supabase MCP connector. This file mirrors that migration for
-- version control / local dev parity.

DROP INDEX IF EXISTS public.idx_quiz_questions_source_unique;

ALTER TABLE public.quiz_questions
  DROP CONSTRAINT IF EXISTS quiz_questions_source_source_id_key;
ALTER TABLE public.quiz_questions
  ADD CONSTRAINT quiz_questions_source_source_id_key UNIQUE (source, source_id);
