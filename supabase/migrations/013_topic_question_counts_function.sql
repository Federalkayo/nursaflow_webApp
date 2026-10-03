-- 013_topic_question_counts_function.sql
-- Lets the frontend show real per-level question counts and size a session
-- to whatever's actually available (e.g. Fluids Hard has 36 questions, not
-- the standard 60) instead of a topic being unstartable when a source is thin.
CREATE OR REPLACE FUNCTION public.topic_question_counts(p_topic_id TEXT)
RETURNS TABLE(difficulty TEXT, cnt BIGINT)
LANGUAGE sql
STABLE
AS $$
  SELECT difficulty, count(*) as cnt
  FROM public.quiz_questions
  WHERE topic_id = p_topic_id AND status = 'published'
  GROUP BY difficulty;
$$;

GRANT EXECUTE ON FUNCTION public.topic_question_counts(TEXT) TO anon, authenticated;
