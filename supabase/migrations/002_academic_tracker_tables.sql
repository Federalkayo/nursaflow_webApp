-- NursaFlow Academic Tracker System Tables & RLS Policies
-- Migration: 002_academic_tracker_tables.sql

-- 1. Semesters Table
CREATE TABLE IF NOT EXISTS public.semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false,
    gpa NUMERIC(3,2) DEFAULT 0.00,
    total_credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    semester_id UUID NOT NULL REFERENCES public.semesters(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    credit_units INTEGER NOT NULL DEFAULT 3,
    grade TEXT NOT NULL DEFAULT 'A',
    grade_points NUMERIC(3,2) DEFAULT 5.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_semesters_user_id ON public.semesters(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_semester_id ON public.courses(semester_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);

-- Enable RLS
ALTER TABLE public.semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Semesters
CREATE POLICY "Users can view own semesters" ON public.semesters FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own semesters" ON public.semesters FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own semesters" ON public.semesters FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own semesters" ON public.semesters FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies: Courses
CREATE POLICY "Users can view own courses" ON public.courses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own courses" ON public.courses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own courses" ON public.courses FOR DELETE USING (auth.uid() = user_id);
