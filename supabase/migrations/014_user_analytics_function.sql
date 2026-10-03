-- 014_user_analytics_function.sql
-- Computes all quiz analytics server-side in one query, so the frontend
-- never downloads raw attempt rows to calculate aggregates. Returns a
-- single JSON blob.
CREATE OR REPLACE FUNCTION public.get_user_analytics(p_user_id UUID)
RETURNS JSON
LANGUAGE sql
STABLE
AS $$
  WITH attempt_data AS (
    SELECT qa.is_correct, qa.created_at, qq.topic_id
    FROM public.quiz_attempts qa
    JOIN public.quiz_questions qq ON qq.id = qa.question_id
    WHERE qa.user_id = p_user_id
  ),
  topic_stats AS (
    SELECT
      ad.topic_id,
      t.name AS topic_name,
      count(*) AS attempted,
      count(*) FILTER (WHERE ad.is_correct) AS correct,
      round(100.0 * count(*) FILTER (WHERE ad.is_correct) / count(*)) AS accuracy
    FROM attempt_data ad
    JOIN public.topics t ON t.id = ad.topic_id
    GROUP BY ad.topic_id, t.name
  ),
  overall AS (
    SELECT count(*) AS total_attempted, count(*) FILTER (WHERE is_correct) AS total_correct
    FROM attempt_data
  ),
  recent_7d AS (
    SELECT count(*) AS attempted, count(*) FILTER (WHERE is_correct) AS correct
    FROM attempt_data WHERE created_at >= now() - interval '7 days'
  ),
  previous_7d AS (
    SELECT count(*) AS attempted, count(*) FILTER (WHERE is_correct) AS correct
    FROM attempt_data
    WHERE created_at >= now() - interval '14 days' AND created_at < now() - interval '7 days'
  ),
  daily_trend AS (
    SELECT
      date_trunc('day', created_at)::date AS day,
      count(*) AS attempted,
      count(*) FILTER (WHERE is_correct) AS correct
    FROM attempt_data
    WHERE created_at >= now() - interval '14 days'
    GROUP BY 1
    ORDER BY 1
  )
  SELECT json_build_object(
    'totalAttempted', (SELECT total_attempted FROM overall),
    'totalCorrect', (SELECT total_correct FROM overall),
    'overallAccuracy', CASE WHEN (SELECT total_attempted FROM overall) > 0
      THEN round(100.0 * (SELECT total_correct FROM overall) / (SELECT total_attempted FROM overall))
      ELSE 0 END,
    'topicStats', (SELECT coalesce(json_agg(topic_stats.* ORDER BY accuracy DESC), '[]'::json) FROM topic_stats),
    'recent7d', (SELECT row_to_json(recent_7d.*) FROM recent_7d),
    'previous7d', (SELECT row_to_json(previous_7d.*) FROM previous_7d),
    'dailyTrend', (SELECT coalesce(json_agg(daily_trend.* ORDER BY day), '[]'::json) FROM daily_trend)
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_user_analytics(UUID) TO authenticated;
