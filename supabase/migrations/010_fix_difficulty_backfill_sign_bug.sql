-- 010_fix_difficulty_backfill_sign_bug.sql
-- The 009 migration's hash-to-int cast produced signed 32-bit values
-- (-2^31..2^31-1). Since CASE WHEN x < 20 is true for every negative
-- number, ~50% of rows were incorrectly forced to 'easy'. Fix: take abs()
-- (via bigint to avoid int4 overflow on the -2147483648 edge case) before
-- the modulo, then re-run the same 20/40/40 split.
UPDATE public.quiz_questions
SET difficulty = CASE
  WHEN abs((('x' || md5(id::text || 'diff-salt'))::bit(32)::int)::bigint) % 100 < 20 THEN 'easy'
  WHEN abs((('x' || md5(id::text || 'diff-salt'))::bit(32)::int)::bigint) % 100 < 60 THEN 'medium'
  ELSE 'hard'
END
WHERE source = 'MedNurse-QA';
