-- 016_fix_function_overload_ambiguity.sql
-- Migration 015 added an optional body_system parameter to
-- random_published_questions and topic_question_counts via CREATE OR
-- REPLACE, but Postgres treats a different parameter LIST as a different
-- function, not a replacement. This left TWO overloaded versions of each
-- function (old signature + new signature), which made every call from
-- the frontend ambiguous and caused it to silently fail — breaking
-- question loading for ALL topics, not just Med-Surg, for a period live.
--
-- Fix: explicitly drop the old-signature overloads, leaving only the
-- correct new ones with the optional parameter. (015 has since been
-- rewritten in this repo to define the functions correctly from the
-- start, so a fresh database never hits this bug — this file is kept for
-- an accurate history of what was applied to the live project.)
DROP FUNCTION IF EXISTS public.random_published_questions(TEXT, TEXT, INT);
DROP FUNCTION IF EXISTS public.topic_question_counts(TEXT);

GRANT EXECUTE ON FUNCTION public.random_published_questions(TEXT, TEXT, INT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.topic_question_counts(TEXT, TEXT) TO anon, authenticated;
