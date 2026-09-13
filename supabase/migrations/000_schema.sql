-- NursaFlow Database Schema & RLS Policies for Supabase
-- Migration: 000_schema.sql

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    school TEXT,
    level TEXT,
    target_gpa NUMERIC(3, 2) DEFAULT 4.50,
    current_streak INTEGER DEFAULT 1,
    study_hours NUMERIC(6, 2) DEFAULT 0.00,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Topics Table
CREATE TABLE IF NOT EXISTS public.topics (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic_id TEXT NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    rationale TEXT,
    difficulty TEXT DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE SET NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Study Streaks Table
CREATE TABLE IF NOT EXISTS public.study_streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    streak_count INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'inactive',
    paystack_reference TEXT UNIQUE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Indexes for High Performance Queries
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic_id ON public.quiz_questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_difficulty ON public.quiz_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_topic_diff ON public.quiz_questions(topic_id, difficulty);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies: Topics & Questions (Publicly readable)
CREATE POLICY "Topics are readable by everyone" ON public.topics FOR SELECT USING (true);
CREATE POLICY "Quiz questions are readable by everyone" ON public.quiz_questions FOR SELECT USING (true);

-- RLS Policies: Quiz Attempts
CREATE POLICY "Users can view own quiz attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies: Study Streaks
CREATE POLICY "Users can view own study streaks" ON public.study_streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study streaks" ON public.study_streaks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study streaks" ON public.study_streaks FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies: Subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Postgres Trigger for Automatic Profile Creation on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, school, level, target_gpa, current_streak, study_hours)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'school', 'NursaFlow Nursing Academy'),
    COALESCE(NEW.raw_user_meta_data->>'level', '300 Level (BSN)'),
    4.50,
    1,
    0.00
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed Topics
INSERT INTO public.topics (id, name, category, description) VALUES
('fundamentals', 'Fundamentals of Nursing', 'Clinical Practice', 'Core nursing concepts, vital signs, infection control, and patient safety.'),
('pharmacology', 'Pharmacology & Drug Admin', 'Pharmacology', 'Dosage calculations, cardiac glycosides, antibiotics, and medication safety.'),
('medsurg', 'Medical-Surgical Nursing', 'Adult Health', 'Cardiovascular, respiratory, endocrine, and perioperative care.'),
('maternal', 'Maternal-Newborn Nursing', 'Obstetrics', 'Antepartum care, labor & delivery stages, APGAR scoring, and postpartum care.'),
('pediatrics', 'Pediatric Nursing', 'Pediatrics', 'Growth & development milestones, pediatric dosage, and pediatric emergencies.'),
('mentalhealth', 'Psychiatric & Mental Health', 'Mental Health', 'Therapeutic communication, mood disorders, and psychotropic medications.'),
('fluids', 'Fluid & Electrolytes', 'Pathophysiology', 'ABG interpretation, IV fluids, hyperkalemia, and DKA protocols.'),
('anatomy', 'Anatomy & Physiology', 'Basic Sciences', 'Systemic anatomy, cardiovascular physiology, and organ functions.')
ON CONFLICT (id) DO NOTHING;
