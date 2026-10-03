-- 012_afrimedqa_difficulty_spread.sql
-- AfriMed-QA's tier field (Expert/Crowdsourced) mapped almost everything to
-- 'hard', leaving 0 'easy' questions per topic — which breaks the leveled
-- practice system entirely (Easy requires 15 questions to even start).
-- Same fix as migrations 009/010 for MedNurse-QA: a deterministic
-- pseudo-random 20/40/40 spread. NOT a real difficulty assessment — a
-- placeholder so every topic has enough questions at every level.
UPDATE public.quiz_questions
SET difficulty = CASE
  WHEN abs((('x' || md5(id::text || 'diff-salt'))::bit(32)::int)::bigint) % 100 < 20 THEN 'easy'
  WHEN abs((('x' || md5(id::text || 'diff-salt'))::bit(32)::int)::bigint) % 100 < 60 THEN 'medium'
  ELSE 'hard'
END
WHERE source = 'AfriMed-QA';
