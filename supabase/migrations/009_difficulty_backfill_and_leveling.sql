-- 009_difficulty_backfill_and_leveling.sql
-- MedNurse-QA has no real difficulty signal in the source data, so every
-- imported row was set to 'medium'. This assigns a deterministic
-- pseudo-random spread (20% easy / 40% medium / 40% hard) purely so
-- the leveled-practice feature has enough questions per bucket to work.
-- THIS IS NOT A REAL DIFFICULTY ASSESSMENT — it's a placeholder until
-- questions are tagged by content/expert review or a proper heuristic.
--
-- NOTE: the hash-to-int CASE expression below has a known sign-bit bug
-- (any negative hash value is always < 20, skewing results toward
-- 'easy'). It is fixed in migration 010. Kept here unmodified to match
-- exactly what was applied live, for an accurate history.
UPDATE public.quiz_questions
SET difficulty = CASE
  WHEN (('x' || md5(id::text || 'diff-salt'))::bit(32)::int % 100) < 20 THEN 'easy'
  WHEN (('x' || md5(id::text || 'diff-salt'))::bit(32)::int % 100) < 60 THEN 'medium'
  ELSE 'hard'
END
WHERE source = 'MedNurse-QA';

-- Efficient server-side random sampling for starting a leveled session —
-- avoids loading an entire topic/difficulty bucket into the browser just to
-- pick N of them client-side.
CREATE OR REPLACE FUNCTION public.random_published_questions(
  p_topic_id TEXT,
  p_difficulty TEXT,
  p_limit INT
)
RETURNS SETOF public.quiz_questions
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.quiz_questions
  WHERE topic_id = p_topic_id
    AND difficulty = p_difficulty
    AND status = 'published'
  ORDER BY random()
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.random_published_questions(TEXT, TEXT, INT) TO anon, authenticated;
