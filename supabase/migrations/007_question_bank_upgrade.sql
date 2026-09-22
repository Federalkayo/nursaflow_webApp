-- 007_question_bank_upgrade.sql
-- Extends the quiz_questions/quiz_attempts system for production-scale
-- question bank support: source tracking, licensing, moderation status,
-- bookmarks, and study sessions (practice/exam mode).
--
-- Applied directly to the NursaFlow Supabase project (dnwozxhtbgbpkdvknajh)
-- on 2026-09-14 via the Supabase MCP connector. This file mirrors that
-- migration for version control / local dev parity.

-- 1. Extend quiz_questions with provenance + moderation fields
ALTER TABLE public.quiz_questions
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'mcq',
  ADD COLUMN IF NOT EXISTS subtopic TEXT,
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_id TEXT,
  ADD COLUMN IF NOT EXISTS license TEXT,
  ADD COLUMN IF NOT EXISTS ai_generated_options BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.quiz_questions
  DROP CONSTRAINT IF EXISTS quiz_questions_status_check;
ALTER TABLE public.quiz_questions
  ADD CONSTRAINT quiz_questions_status_check
  CHECK (status IN ('draft', 'review', 'published', 'rejected'));

-- Prevent obviously broken rows from ever reaching production
ALTER TABLE public.quiz_questions
  DROP CONSTRAINT IF EXISTS quiz_questions_options_not_empty;
ALTER TABLE public.quiz_questions
  ADD CONSTRAINT quiz_questions_options_not_empty
  CHECK (jsonb_typeof(options) = 'array' AND jsonb_array_length(options) >= 2);

-- Dedup source records on repeat imports
CREATE UNIQUE INDEX IF NOT EXISTS idx_quiz_questions_source_unique
  ON public.quiz_questions (source, source_id)
  WHERE source IS NOT NULL AND source_id IS NOT NULL;

-- 2. Extend quiz_attempts with timing + session linkage
ALTER TABLE public.quiz_attempts
  ADD COLUMN IF NOT EXISTS time_taken INTEGER, -- seconds
  ADD COLUMN IF NOT EXISTS session_id UUID;

-- 3. Study sessions (practice / exam mode)
CREATE TABLE IF NOT EXISTS public.study_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL DEFAULT 'practice' CHECK (mode IN ('practice', 'exam')),
    topic_id TEXT REFERENCES public.topics(id) ON DELETE SET NULL,
    difficulty TEXT,
    question_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    num_questions INTEGER NOT NULL DEFAULT 0,
    score INTEGER,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.quiz_attempts
  DROP CONSTRAINT IF EXISTS quiz_attempts_session_id_fkey;
ALTER TABLE public.quiz_attempts
  ADD CONSTRAINT quiz_attempts_session_id_fkey
  FOREIGN KEY (session_id) REFERENCES public.study_sessions(id) ON DELETE SET NULL;

-- 4. Bookmarks for quiz questions
CREATE TABLE IF NOT EXISTS public.question_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_question_bookmark UNIQUE (user_id, question_id)
);

-- 5. Indexes for performance at scale
CREATE INDEX IF NOT EXISTS idx_quiz_questions_status ON public.quiz_questions(status);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic_status ON public.quiz_questions(topic_id, status);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic_diff_status ON public.quiz_questions(topic_id, difficulty, status);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_source ON public.quiz_questions(source);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_session_id ON public.quiz_attempts(session_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_question_bookmarks_user_id ON public.question_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_question_bookmarks_question_id ON public.question_bookmarks(question_id);

-- 6. RLS: replace "readable by everyone" with "published only"
DROP POLICY IF EXISTS "Quiz questions are readable by everyone" ON public.quiz_questions;
CREATE POLICY "Published quiz questions are readable by everyone"
  ON public.quiz_questions FOR SELECT
  USING (status = 'published');

-- No INSERT/UPDATE/DELETE policy for quiz_questions is intentional:
-- question management happens via service-role import scripts / edge
-- functions only, never directly from the client.

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own study sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE public.question_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own question bookmarks" ON public.question_bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own question bookmarks" ON public.question_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own question bookmarks" ON public.question_bookmarks FOR DELETE USING (auth.uid() = user_id);
