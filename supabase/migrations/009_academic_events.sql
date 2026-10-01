-- 009_academic_events.sql
-- Powers the dashboard's "Upcoming Exams & Deadlines" card.
-- Each student keeps their own exams, assignments, clinical sessions, etc.
-- Safe to re-run.

CREATE TABLE IF NOT EXISTS public.academic_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL CHECK (char_length(btrim(title)) > 0 AND char_length(title) <= 120),
    event_type TEXT NOT NULL DEFAULT 'Exam'
        CHECK (event_type IN ('Exam', 'Assignment', 'Clinical', 'Other')),
    event_at TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT CHECK (location IS NULL OR char_length(location) <= 120),
    is_done BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academic_events_user_date
    ON public.academic_events(user_id, event_at);

ALTER TABLE public.academic_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own academic events" ON public.academic_events;
DROP POLICY IF EXISTS "Users can insert own academic events" ON public.academic_events;
DROP POLICY IF EXISTS "Users can update own academic events" ON public.academic_events;
DROP POLICY IF EXISTS "Users can delete own academic events" ON public.academic_events;

CREATE POLICY "Users can view own academic events"
    ON public.academic_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own academic events"
    ON public.academic_events FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own academic events"
    ON public.academic_events FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own academic events"
    ON public.academic_events FOR DELETE USING (auth.uid() = user_id);
