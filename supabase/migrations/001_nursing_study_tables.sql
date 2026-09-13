-- NursaFlow Nursing Study System Tables & RLS Policies
-- Migration: 001_nursing_study_tables.sql

-- 1. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT,
    category TEXT DEFAULT 'Nursing',
    description TEXT,
    icon TEXT,
    color TEXT,
    flashcards_count INTEGER DEFAULT 0,
    quizzes_count INTEGER DEFAULT 0,
    topics JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Flashcards Table (Shared content)
CREATE TABLE IF NOT EXISTS public.flashcards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE CASCADE,
    category TEXT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Flashcard Progress Table (Per-user state)
CREATE TABLE IF NOT EXISTS public.user_flashcard_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES public.flashcards(id) ON DELETE CASCADE,
    is_known BOOLEAN DEFAULT false,
    is_bookmarked BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_flashcard UNIQUE (user_id, flashcard_id)
);

-- 4. Notes Table (Private per user)
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    is_bookmarked BOOLEAN DEFAULT false,
    tags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Study Plans Table (Private per user)
CREATE TABLE IF NOT EXISTS public.study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    subject_id TEXT REFERENCES public.subjects(id) ON DELETE SET NULL,
    start_date DATE,
    target_end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Study Plan Tasks Table
CREATE TABLE IF NOT EXISTS public.study_plan_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES public.study_plans(id) ON DELETE CASCADE,
    day TEXT NOT NULL,
    task_title TEXT NOT NULL,
    task_type TEXT NOT NULL,
    is_completed BOOLEAN DEFAULT false
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flashcards_subject_id ON public.flashcards(subject_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_user_id ON public.user_flashcard_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_flashcard_progress_flashcard_id ON public.user_flashcard_progress(flashcard_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_subject_id ON public.notes(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON public.study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_plans_subject_id ON public.study_plans(subject_id);
CREATE INDEX IF NOT EXISTS idx_study_plan_tasks_plan_id ON public.study_plan_tasks(plan_id);

-- Enable RLS
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flashcard_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_plan_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Subjects are readable by everyone" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Flashcards are readable by everyone" ON public.flashcards FOR SELECT USING (true);

CREATE POLICY "Users can view own flashcard progress" ON public.user_flashcard_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own flashcard progress" ON public.user_flashcard_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own flashcard progress" ON public.user_flashcard_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own flashcard progress" ON public.user_flashcard_progress FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own study plans" ON public.study_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own study plans" ON public.study_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own study plans" ON public.study_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own study plans" ON public.study_plans FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own study plan tasks" ON public.study_plan_tasks FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.study_plans WHERE study_plans.id = study_plan_tasks.plan_id AND study_plans.user_id = auth.uid())
);
CREATE POLICY "Users can insert own study plan tasks" ON public.study_plan_tasks FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.study_plans WHERE study_plans.id = study_plan_tasks.plan_id AND study_plans.user_id = auth.uid())
);
CREATE POLICY "Users can update own study plan tasks" ON public.study_plan_tasks FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.study_plans WHERE study_plans.id = study_plan_tasks.plan_id AND study_plans.user_id = auth.uid())
);
CREATE POLICY "Users can delete own study plan tasks" ON public.study_plan_tasks FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.study_plans WHERE study_plans.id = study_plan_tasks.plan_id AND study_plans.user_id = auth.uid())
);

-- Seed Data: 10 Nursing Subjects
INSERT INTO public.subjects (id, title, code, category, description, icon, color, flashcards_count, quizzes_count, topics) VALUES
('subj_ana_phs', 'Anatomy & Physiology', 'ANA-PHS', 'Basic Sciences', 'Structure and function of human organ systems, tissues, cellular biomechanics, and homeostasis.', 'Activity', 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800', 45, 8, '["Cardiovascular System", "Respiratory Tract", "Renal Physiology", "Nervous System & Synapses", "Endocrine Glands"]'::jsonb),
('subj_pharm', 'Pharmacology', 'PHA-201', 'Pharmacology', 'Drug classifications, pharmacokinetics, pharmacodynamics, adverse effects, dosage calculations, and drug administration.', 'Pill', 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800', 60, 12, '["Cardiac Glycosides", "Antibiotics & Antifungals", "Analgesics & NSAIDs", "Antihypertensives", "Insulin & Oral Antidiabetics"]'::jsonb),
('subj_medsurg', 'Medical-Surgical Nursing', 'NUR-301', 'Adult Health', 'Adult patient care in acute and chronic clinical settings, surgical interventions, pre-op/post-op management.', 'Stethoscope', 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800', 50, 10, '["Pre-operative Nursing Care", "Fluid & Electrolyte Imbalances", "Heart Failure Management", "Diabetes Care", "Wound Management"]'::jsonb),
('subj_fund', 'Fundamentals of Nursing', 'NUR-102', 'Clinical Practice', 'Core concepts of patient care, nursing process (ADPIE), infection control, vital signs, and safety protocols.', 'HeartPulse', 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800', 38, 6, '["Nursing Process (ADPIE)", "Hand Hygiene & Sterile Technique", "Vital Signs Assessment", "Patient Mobility & Positioning"]'::jsonb),
('subj_comm', 'Community Health Nursing', 'NUR-305', 'Community Health', 'Epidemiology, public health interventions, disease prevention, environmental hygiene, and community care.', 'Users', 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800', 30, 5, '["Epidemiological Triad", "Immunization Schedules", "Primary Healthcare Principles", "Outbreak Containment"]'::jsonb),
('subj_mch', 'Maternal & Child Health', 'NUR-302', 'Obstetrics', 'Obstetric nursing, prenatal care, labor and delivery, postpartum assessment, neonatal and pediatric care.', 'Baby', 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800', 42, 7, '["Stages of Labor", "APGAR Scoring System", "Preeclampsia Management", "Pediatric Growth Milestones", "Postpartum Hemorrhage"]'::jsonb),
('subj_psych', 'Mental Health Nursing', 'NUR-303', 'Mental Health', 'Psychiatric disorders, therapeutic communication, psychopharmacology, crisis intervention, and mental state assessment.', 'Brain', 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800', 35, 6, '["Therapeutic Communication Techniques", "Schizophrenia & Antipsychotics", "Mood Disorders & SSRIs", "Defense Mechanisms"]'::jsonb),
('subj_patho', 'Pathophysiology', 'PTH-201', 'Pathophysiology', 'Mechanisms of disease, cellular injury, inflammation, immune responses, and organ system dysfunction.', 'Microscope', 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800', 40, 7, '["Cellular Injury & Necrosis", "Acute & Chronic Inflammation", "Neoplasia & Tumor Markers", "Hypersensitivity Reactions"]'::jsonb),
('subj_nutr', 'Nutrition & Dietetics', 'NUT-201', 'Nutrition', 'Nutritional requirements across the lifespan, therapeutic diets, enteral/parenteral nutrition, and metabolic pathways.', 'Apple', 'bg-lime-500/10 text-lime-600 dark:text-lime-400 border-lime-200 dark:border-lime-800', 25, 4, '["Therapeutic Renal Diets", "Total Parenteral Nutrition (TPN)", "Vitamin & Mineral Deficiencies", "Diabetic Carbohydrate Counting"]'::jsonb),
('subj_micro', 'Microbiology for Nursing', 'MCB-102', 'Basic Sciences', 'Pathogenic bacteria, viruses, fungi, parasites, antimicrobial resistance, and hospital-acquired infections (HAIs).', 'Dna', 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800', 32, 5, '["Gram Positive vs Gram Negative Bacteria", "Nosocomial Infection Prevention", "Sterilization & Disinfection", "Viral Replication"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
