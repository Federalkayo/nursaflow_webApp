-- NursaFlow Database Schema & RLS Policies for Supabase

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    school TEXT,
    level TEXT,
    target_gpa NUMERIC(3, 2) DEFAULT 4.50,
    current_streak INTEGER DEFAULT 1,
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
  INSERT INTO public.profiles (id, full_name, school, level, target_gpa, current_streak)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'school', 'NursaFlow Nursing Academy'),
    COALESCE(NEW.raw_user_meta_data->>'level', '300 Level (BSN)'),
    4.50,
    1
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- SEED DATA FOR TESTING (NURSING TOPICS & MCQS)
-- ==========================================

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

-- Seed Sample Nursing Quiz Questions (15 High-Yield NCLEX MCQs)
INSERT INTO public.quiz_questions (topic_id, question, options, correct_answer, rationale, difficulty) VALUES
('pharmacology', 'A nurse is preparing to administer Digoxin to an adult patient. Which assessment is essential prior to administration?', '["Check respiratory rate for 1 full minute", "Assess apical pulse for 1 full minute", "Measure blood glucose level", "Check deep tendon reflexes"]'::jsonb, 'Assess apical pulse for 1 full minute', 'Digoxin is a cardiac glycoside that slows heart rate. Apical pulse must be assessed for 1 full minute; hold medication if HR is below 60 bpm.', 'medium'),
('pharmacology', 'Which antidote should the nurse have readily available for a patient receiving continuous IV Heparin infusion?', '["Vitamin K", "Protamine sulfate", "Naloxone", "Calcium gluconate"]'::jsonb, 'Protamine sulfate', 'Protamine sulfate is the specific reversal agent for Heparin toxicity. Vitamin K reverses Warfarin.', 'easy'),
('fundamentals', 'Which action by the nurse represents the most effective method to break the chain of infection in a clinical setting?', '["Wearing clean gloves for all patient contact", "Performing hand hygiene before and after patient contact", "Recapping needles immediately after use", "Administering prophylactic antibiotics"]'::jsonb, 'Performing hand hygiene before and after patient contact', 'Hand hygiene is universally recognized as the single most effective intervention to prevent healthcare-associated infections.', 'easy'),
('fundamentals', 'When assessing a patient for suspected hypocalcemia, which clinical sign demonstrates Trousseau sign?', '["Facial twitching upon tapping the facial nerve", "Carpal spasm induced by inflating a blood pressure cuff", "Involuntary dorsiflexion of the big toe", "Numbness around the perioral area"]'::jsonb, 'Carpal spasm induced by inflating a blood pressure cuff', 'Trousseau sign is carpopedal spasm induced by inflating a blood pressure cuff above systolic pressure for 3 minutes, indicating hypocalcemia. Chvostek sign is facial twitching.', 'medium'),
('medsurg', 'A nurse is caring for a patient experiencing Diabetic Ketoacidosis (DKA). Which IV solution is initially administered?', '["5% Dextrose in Water (D5W)", "0.9% Normal Saline (0.9% NaCl)", "0.45% Normal Saline (0.45% NaCl)", "Dextrose 5% in 0.45% Saline"]'::jsonb, '0.9% Normal Saline (0.9% NaCl)', 'Initial DKA therapy requires rapid intravascular volume expansion using isotonic 0.9% Normal Saline before switching to dextrose-containing fluids.', 'hard'),
('medsurg', 'A patient with chronic kidney disease has a potassium level of 6.8 mEq/L and ECG changes. Which order should the nurse execute FIRST?', '["Administer IV Sodium Polystyrene Sulfonate (Kayexalate)", "Administer IV Calcium Gluconate", "Obtain a 12-lead ECG", "Place patient on a low-potassium diet"]'::jsonb, 'Administer IV Calcium Gluconate', 'Calcium gluconate stabilizes cardiac cell membranes to prevent lethal arrhythmias caused by severe hyperkalemia.', 'hard'),
('maternal', 'A nurse calculates an APGAR score for a newborn at 1 minute post-birth: HR 110, strong cry, active motion, pink body with blue extremities, vigorous grimace. What is the APGAR score?', '["7", "8", "9", "10"]'::jsonb, '9', 'Score: HR >100 (2), Cry (2), Motion (2), Acrocyanosis (1), Grimace (2) = 9 points.', 'medium'),
('maternal', 'Which medication is routinely administered to all newborns within 1-2 hours of birth to prevent hemorrhagic disease?', '["Erythromycin ointment", "Hepatitis B vaccine", "Vitamin K (Phytonadione) IM", "Ampicillin IV"]'::jsonb, 'Vitamin K (Phytonadione) IM', 'Newborns lack intestinal flora to synthesize Vitamin K; intramuscular Vitamin K prevents Vitamin K deficiency bleeding (VKDB).', 'easy'),
('pediatrics', 'A 2-year-old child presents with a barking cough and inspiratory stridor. Which condition does the nurse suspect?', '["Asthma exacerbation", "Croup (Laryngotracheobronchitis)", "Epiglottitis", "Bronchiolitis"]'::jsonb, 'Croup (Laryngotracheobronchitis)', 'Croup is characterized by subglottic airway edema causing a characteristic seal-like barking cough and inspiratory stridor.', 'medium'),
('pediatrics', 'At what age does an infant typically demonstrate the motor milestone of sitting unassisted?', '["2 to 3 months", "4 to 5 months", "6 to 8 months", "10 to 12 months"]'::jsonb, '6 to 8 months', 'Infants typically achieve independent unassisted sitting between 6 and 8 months of age.', 'easy'),
('fluids', 'A nurse reviews Arterial Blood Gas (ABG) results: pH 7.28, PaCO2 55 mmHg, HCO3- 24 mEq/L. How should the nurse interpret these findings?', '["Uncompensated Respiratory Acidosis", "Uncompensated Metabolic Acidosis", "Compensated Respiratory Alkalosis", "Fully Compensated Metabolic Alkalosis"]'::jsonb, 'Uncompensated Respiratory Acidosis', 'pH < 7.35 (Acidemia), PaCO2 > 45 (Respiratory etiology), HCO3- normal (Uncompensated).', 'hard'),
('fluids', 'Which IV fluid is considered hypertonic and used to treat severe hyponatremia under close monitoring?', '["0.45% Normal Saline", "0.9% Normal Saline", "3% Sodium Chloride", "Lactated Ringer solution"]'::jsonb, '3% Sodium Chloride', '3% NaCl is a hypertonic saline solution used in emergency settings to treat critical, symptomatic hyponatremia.', 'medium'),
('mentalhealth', 'A patient taking Monoamine Oxidase Inhibitors (MAOIs) must strictly avoid foods containing high levels of which substance?', '["Tyramine", "Purines", "Gluten", "Calcium"]'::jsonb, 'Tyramine', 'Tyramine in aged cheeses, cured meats, and red wine can precipitate a hypertensive crisis when combined with MAOIs.', 'medium'),
('anatomy', 'Which chamber of the human heart receives oxygenated blood directly from the pulmonary veins?', '["Right Atrium", "Right Ventricle", "Left Atrium", "Left Ventricle"]'::jsonb, 'Left Atrium', 'Oxygenated blood from pulmonary circulation enters the Left Atrium via four pulmonary veins.', 'easy'),
('anatomy', 'Which cranial nerve is tested when asking a patient to stick out their tongue and move it side to side?', '["Cranial Nerve IX (Glossopharyngeal)", "Cranial Nerve X (Vagus)", "Cranial Nerve XI (Accessory)", "Cranial Nerve XII (Hypoglossal)"]'::jsonb, 'Cranial Nerve XII (Hypoglossal)', 'CN XII (Hypoglossal nerve) controls tongue muscle movement and lingual motor function.', 'easy');
