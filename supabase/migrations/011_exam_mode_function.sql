-- 011_exam_mode_function.sql
-- Random sampling for exam mode: unlike practice mode (one topic, one
-- difficulty, fixed 15/30/60 count), an exam pulls a mixed set across
-- difficulties and, optionally, across all topics.
CREATE OR REPLACE FUNCTION public.random_exam_questions(
  p_topic_id TEXT,   -- NULL means all topics
  p_limit INT
)
RETURNS SETOF public.quiz_questions
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM public.quiz_questions
  WHERE status = 'published'
    AND (p_topic_id IS NULL OR topic_id = p_topic_id)
  ORDER BY random()
  LIMIT p_limit;
$$;

GRANT EXECUTE ON FUNCTION public.random_exam_questions(TEXT, INT) TO anon, authenticated;
