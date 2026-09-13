-- Fixes: [Supabase DB Error] updateProfile — 400 error when saving study hours
--
-- Root cause: src/services/supabase/dbService.ts and src/context/AuthContext.tsx
-- write to a `profiles.total_study_hours` column that was never created by either
-- existing schema file:
--   - supabase/schema.sql              -> no study-hours column at all
--   - supabase/migrations/000_schema.sql -> has a column, but named `study_hours`
--
-- This migration is additive and safe to run regardless of which of the two
-- schema files was actually applied to the live database — it only adds the
-- column if it's missing, and backfills it from `study_hours` if that column
-- happens to already exist and hold real data.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS total_study_hours NUMERIC(6, 2) DEFAULT 0.00;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'study_hours'
  ) THEN
    UPDATE public.profiles
    SET total_study_hours = study_hours
    WHERE total_study_hours = 0.00 AND study_hours IS NOT NULL;
  END IF;
END $$;
