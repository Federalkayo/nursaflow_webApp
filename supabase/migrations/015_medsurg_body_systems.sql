-- 015_medsurg_body_systems.sql
-- Adds body-system sub-navigation for Med-Surg, mapped from existing
-- AfriMed-QA specialty labels already stored in `subtopic`. Only ~44% of
-- Med-Surg content (Cardiology/Gastroenterology/Pulmonary/Endocrinology/
-- Hematology) maps to a single real body system; the rest (General Surgery,
-- Infectious Disease, Internal Medicine, Emergency Medicine, Geriatrics) is
-- genuinely cross-system in the source data and lands in 'general'.
-- This is a label rename, not a re-classification — safe, fast, no AI.

ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS body_system TEXT;

UPDATE public.quiz_questions
SET body_system = CASE subtopic
  WHEN 'Cardiology' THEN 'cardiovascular'
  WHEN 'Gastroenterology' THEN 'digestive'
  WHEN 'Pulmonary Medicine' THEN 'respiratory'
  WHEN 'Endocrinology' THEN 'endocrine'
  WHEN 'Hematology' THEN 'hematologic'
  ELSE 'general'
END
WHERE topic_id = 'medsurg';

CREATE INDEX IF NOT EXISTS idx_quiz_questions_medsurg_body_system
  ON public.quiz_questions(topic_id, body_system, difficulty)
  WHERE topic_id = 'medsurg';

-- NOTE: this migration originally extended random_published_questions and
-- topic_question_counts with an optional p_body_system parameter via
-- CREATE OR REPLACE FUNCTION. Because the parameter list changed, Postgres
-- created a second overloaded version of each function instead of
-- replacing it, which broke question loading for ALL topics (not just
-- Med-Surg) until migration 016 dropped the old-signature overloads. The
-- function definitions below are the CORRECTED final versions (as they
-- exist live after 016), consolidated here so a fresh database setup
-- doesn't reproduce the overload bug.
CREATE OR REPLACE FUNCTION public.random_published_questions(
  p_topic_id TEXT,
  p_difficulty TEXT,
  p_limit INT,
  p_body_system TEXT DEFAULT NULL
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
    AND (p_body_system IS NULL OR body_system = p_body_system)
  ORDER BY random()
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.topic_question_counts(
  p_topic_id TEXT,
  p_body_system TEXT DEFAULT NULL
)
RETURNS TABLE(difficulty TEXT, cnt BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT difficulty, count(*) as cnt
  FROM public.quiz_questions
  WHERE topic_id = p_topic_id
    AND status = 'published'
    AND (p_body_system IS NULL OR body_system = p_body_system)
  GROUP BY difficulty;
$$;

-- Counts per body system, for the Med-Surg sub-selector UI.
CREATE OR REPLACE FUNCTION public.medsurg_body_system_counts()
RETURNS TABLE(body_system TEXT, cnt BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT body_system, count(*) as cnt
  FROM public.quiz_questions
  WHERE topic_id = 'medsurg' AND status = 'published'
  GROUP BY body_system;
$$;

GRANT EXECUTE ON FUNCTION public.random_published_questions(TEXT, TEXT, INT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.topic_question_counts(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.medsurg_body_system_counts() TO anon, authenticated;
