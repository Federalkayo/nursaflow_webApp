import { supabase } from './supabaseClient';
import { Semester, Course, NursingSubject, Flashcard, StudyPlan, StudyPlanTask, NursingNote, CommunityPost, Comment } from '../../types';
import { INITIAL_SUBJECTS } from '../../data/mockSubjects';
import { INITIAL_FLASHCARDS } from '../../data/mockFlashcards';
import { INITIAL_NOTES } from '../../data/mockNotes';
import { INITIAL_STUDY_PLANS } from '../../data/mockStudyPlans';
import { INITIAL_SEMESTERS } from '../../data/mockCourses';

export interface ProfileData {
  id: string;
  full_name?: string;
  school?: string;
  level?: string;
  target_gpa?: number;
  current_streak?: number;
  total_study_hours?: number;
  last_active_date?: string;
}

export interface TopicData {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface QuizQuestionData {
  id?: string;
  topic_id: string;
  question: string;
  options: string[];
  correct_answer: string;
  rationale?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizAttemptData {
  id?: string;
  user_id: string;
  question_id?: string;
  selected_answer: string;
  is_correct: boolean;
  created_at?: string;
}

export interface StudyStreakData {
  id?: string;
  user_id: string;
  streak_count: number;
  last_activity_date?: string;
}

export interface SubscriptionData {
  id?: string;
  user_id: string;
  plan: string;
  status: string;
  paystack_reference?: string;
  current_period_end?: string;
}

export interface SubjectData {
  id: string;
  title: string;
  code?: string;
  category?: string;
  description?: string;
  icon?: string;
  color?: string;
  flashcards_count?: number;
  quizzes_count?: number;
  topics?: string[];
}

export interface FlashcardData {
  id?: string;
  subject_id: string;
  category?: string;
  question: string;
  answer: string;
  explanation?: string;
  created_at?: string;
}

export interface UserFlashcardProgressData {
  id?: string;
  user_id: string;
  flashcard_id: string;
  is_known?: boolean;
  is_bookmarked?: boolean;
  updated_at?: string;
}

export interface NoteData {
  id?: string;
  user_id: string;
  subject_id?: string | null;
  title: string;
  content: string;
  category?: string;
  is_bookmarked?: boolean;
  tags?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface StudyPlanData {
  id?: string;
  user_id: string;
  title: string;
  subject_id?: string | null;
  start_date?: string;
  target_end_date?: string;
  created_at?: string;
}

export interface StudyPlanTaskData {
  id?: string;
  plan_id: string;
  day: string;
  task_title: string;
  task_type: string;
  is_completed?: boolean;
}

const FALLBACK_SUBJECTS: NursingSubject[] = INITIAL_SUBJECTS;
const FALLBACK_FLASHCARDS: Flashcard[] = INITIAL_FLASHCARDS;
const FALLBACK_NOTES: NursingNote[] = INITIAL_NOTES;
const FALLBACK_STUDY_PLANS: StudyPlan[] = INITIAL_STUDY_PLANS;
const FALLBACK_SEMESTERS: Semester[] = INITIAL_SEMESTERS;

const FALLBACK_TOPICS: TopicData[] = [
  { id: 'fundamentals', name: 'Fundamentals of Nursing', category: 'Clinical Practice', description: 'Core nursing concepts, vital signs, infection control, and patient safety.' },
  { id: 'pharmacology', name: 'Pharmacology & Drug Admin', category: 'Pharmacology', description: 'Dosage calculations, cardiac glycosides, antibiotics, and medication safety.' },
  { id: 'medsurg', name: 'Medical-Surgical Nursing', category: 'Adult Health', description: 'Cardiovascular, respiratory, endocrine, and perioperative care.' },
  { id: 'maternal', name: 'Maternal-Newborn Nursing', category: 'Obstetrics', description: 'Antepartum care, labor & delivery stages, APGAR scoring, and postpartum care.' },
  { id: 'pediatrics', name: 'Pediatric Nursing', category: 'Pediatrics', description: 'Growth & development milestones, pediatric dosage, and pediatric emergencies.' },
  { id: 'mentalhealth', name: 'Psychiatric & Mental Health', category: 'Mental Health', description: 'Therapeutic communication, mood disorders, and psychotropic medications.' },
  { id: 'fluids', name: 'Fluid & Electrolytes', category: 'Pathophysiology', description: 'ABG interpretation, IV fluids, hyperkalemia, and DKA protocols.' },
  { id: 'anatomy', name: 'Anatomy & Physiology', category: 'Basic Sciences', description: 'Systemic anatomy, cardiovascular physiology, and organ functions.' },
];

const FALLBACK_QUIZ_QUESTIONS: QuizQuestionData[] = [
  {
    id: 'q_pharm_1',
    topic_id: 'pharmacology',
    question: 'A nurse is preparing to administer Digoxin to an adult patient. Which assessment is essential prior to administration?',
    options: ['Check respiratory rate for 1 full minute', 'Assess apical pulse for 1 full minute', 'Measure blood glucose level', 'Check deep tendon reflexes'],
    correct_answer: 'Assess apical pulse for 1 full minute',
    rationale: 'Digoxin is a cardiac glycoside that slows heart rate. Apical pulse must be assessed for 1 full minute; hold medication if HR is below 60 bpm.',
    difficulty: 'medium',
  },
  {
    id: 'q_pharm_2',
    topic_id: 'pharmacology',
    question: 'Which antidote should the nurse have readily available for a patient receiving continuous IV Heparin infusion?',
    options: ['Vitamin K', 'Protamine sulfate', 'Naloxone', 'Calcium gluconate'],
    correct_answer: 'Protamine sulfate',
    rationale: 'Protamine sulfate is the specific reversal agent for Heparin toxicity. Vitamin K reverses Warfarin.',
    difficulty: 'easy',
  },
  {
    id: 'q_fund_1',
    topic_id: 'fundamentals',
    question: 'Which action by the nurse represents the most effective method to break the chain of infection in a clinical setting?',
    options: ['Wearing clean gloves for all patient contact', 'Performing hand hygiene before and after patient contact', 'Recapping needles immediately after use', 'Administering prophylactic antibiotics'],
    correct_answer: 'Performing hand hygiene before and after patient contact',
    rationale: 'Hand hygiene is universally recognized as the single most effective intervention to prevent healthcare-associated infections.',
    difficulty: 'easy',
  },
  {
    id: 'q_fund_2',
    topic_id: 'fundamentals',
    question: 'When assessing a patient for suspected hypocalcemia, which clinical sign demonstrates Trousseau sign?',
    options: ['Facial twitching upon tapping the facial nerve', 'Carpal spasm induced by inflating a blood pressure cuff', 'Involuntary dorsiflexion of the big toe', 'Numbness around the perioral area'],
    correct_answer: 'Carpal spasm induced by inflating a blood pressure cuff',
    rationale: 'Trousseau sign is carpopedal spasm induced by inflating a blood pressure cuff above systolic pressure for 3 minutes, indicating hypocalcemia. Chvostek sign is facial twitching.',
    difficulty: 'medium',
  },
  {
    id: 'q_medsurg_1',
    topic_id: 'medsurg',
    question: 'A nurse is caring for a patient experiencing Diabetic Ketoacidosis (DKA). Which IV solution is initially administered?',
    options: ['5% Dextrose in Water (D5W)', '0.9% Normal Saline (0.9% NaCl)', '0.45% Normal Saline (0.45% NaCl)', 'Dextrose 5% in 0.45% Saline'],
    correct_answer: '0.9% Normal Saline (0.9% NaCl)',
    rationale: 'Initial DKA therapy requires rapid intravascular volume expansion using isotonic 0.9% Normal Saline before switching to dextrose-containing fluids.',
    difficulty: 'hard',
  },
  {
    id: 'q_medsurg_2',
    topic_id: 'medsurg',
    question: 'A patient with chronic kidney disease has a potassium level of 6.8 mEq/L and ECG changes. Which order should the nurse execute FIRST?',
    options: ['Administer IV Sodium Polystyrene Sulfonate (Kayexalate)', 'Administer IV Calcium Gluconate', 'Obtain a 12-lead ECG', 'Place patient on a low-potassium diet'],
    correct_answer: 'Administer IV Calcium Gluconate',
    rationale: 'Calcium gluconate stabilizes cardiac cell membranes to prevent lethal arrhythmias caused by severe hyperkalemia.',
    difficulty: 'hard',
  },
  {
    id: 'q_maternal_1',
    topic_id: 'maternal',
    question: 'A nurse calculates an APGAR score for a newborn at 1 minute post-birth: HR 110, strong cry, active motion, pink body with blue extremities, vigorous grimace. What is the APGAR score?',
    options: ['7', '8', '9', '10'],
    correct_answer: '9',
    rationale: 'Score: HR >100 (2), Cry (2), Motion (2), Acrocyanosis (1), Grimace (2) = 9 points.',
    difficulty: 'medium',
  },
  {
    id: 'q_peds_1',
    topic_id: 'pediatrics',
    question: 'A 2-year-old child presents with a barking cough and inspiratory stridor. Which condition does the nurse suspect?',
    options: ['Asthma exacerbation', 'Croup (Laryngotracheobronchitis)', 'Epiglottitis', 'Bronchiolitis'],
    correct_answer: 'Croup (Laryngotracheobronchitis)',
    rationale: 'Croup is characterized by subglottic airway edema causing a characteristic seal-like barking cough and inspiratory stridor.',
    difficulty: 'medium',
  },
  {
    id: 'q_fluids_1',
    topic_id: 'fluids',
    question: 'A nurse reviews Arterial Blood Gas (ABG) results: pH 7.28, PaCO2 55 mmHg, HCO3- 24 mEq/L. How should the nurse interpret these findings?',
    options: ['Uncompensated Respiratory Acidosis', 'Uncompensated Metabolic Acidosis', 'Compensated Respiratory Alkalosis', 'Fully Compensated Metabolic Alkalosis'],
    correct_answer: 'Uncompensated Respiratory Acidosis',
    rationale: 'pH < 7.35 (Acidemia), PaCO2 > 45 (Respiratory etiology), HCO3- normal (Uncompensated).',
    difficulty: 'hard',
  }
];

export const dbService = {
  // ==========================================
  // 1. PROFILES CRUD
  // ==========================================
  async getProfile(userId: string): Promise<ProfileData | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Supabase DB Error] getProfile:', error);
      throw error;
    }
    return data;
  },

  async upsertProfile(profile: ProfileData): Promise<ProfileData> {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select()
      .single();

    if (error) {
      console.error('[Supabase DB Error] upsertProfile:', error);
      throw error;
    }
    return data;
  },

  async updateProfile(userId: string, updates: Partial<ProfileData>): Promise<ProfileData> {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Supabase DB Error] updateProfile:', error);
      throw error;
    }
    return data;
  },

  // ==========================================
  // 2. TOPICS & QUIZ QUESTIONS CRUD
  // ==========================================
  async getTopics(): Promise<TopicData[]> {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('name');

      if (error) throw error;
      if (data && data.length > 0) return data;
    } catch (e) {
      console.warn('[Supabase DB Warning] getTopics fallback:', e);
    }
    return FALLBACK_TOPICS;
  },

  async getQuizQuestions(topicId?: string, difficulty?: string, limit?: number): Promise<QuizQuestionData[]> {
    try {
      let query = supabase.from('quiz_questions').select('*');
      if (topicId) {
        query = query.eq('topic_id', topicId);
      }
      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }
      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        return data.map((q) => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
        }));
      }
    } catch (e) {
      console.warn('[Supabase DB Warning] getQuizQuestions fallback:', e);
    }

    // Filter fallback list
    let list = FALLBACK_QUIZ_QUESTIONS;
    if (topicId) {
      list = list.filter((q) => q.topic_id === topicId);
    }
    if (difficulty) {
      list = list.filter((q) => q.difficulty === difficulty);
    }
    if (limit) {
      list = list.slice(0, limit);
    }
    return list;
  },

  async createQuizQuestion(questionData: QuizQuestionData): Promise<QuizQuestionData> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(questionData)
      .select()
      .single();

    if (error) {
      console.error('[Supabase DB Error] createQuizQuestion:', error);
      throw error;
    }
    return data;
  },

  async updateQuizQuestion(id: string, updates: Partial<QuizQuestionData>): Promise<QuizQuestionData> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[Supabase DB Error] updateQuizQuestion:', error);
      throw error;
    }
    return data;
  },

  async deleteQuizQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('quiz_questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Supabase DB Error] deleteQuizQuestion:', error);
      throw error;
    }
  },

  // ==========================================
  // 3. QUIZ ATTEMPTS CRUD & STATS
  // ==========================================
  async recordQuizAttempt(
    userId: string,
    questionId: string | undefined,
    selectedAnswer: string,
    isCorrect: boolean
  ): Promise<QuizAttemptData> {
    const payload = {
      user_id: userId,
      question_id: questionId || null,
      selected_answer: selectedAnswer,
      is_correct: isCorrect,
    };

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('[Supabase DB Error] recordQuizAttempt:', error);
      // Fallback return for offline mode
      return {
        id: `att_${Date.now()}`,
        user_id: userId,
        question_id: questionId,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        created_at: new Date().toISOString(),
      };
    }
    return data;
  },

  async getUserQuizAttempts(userId: string): Promise<QuizAttemptData[]> {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Supabase DB Error] getUserQuizAttempts:', error);
      return [];
    }
    return data || [];
  },

  async getUserQuizStats(userId: string) {
    try {
      const attempts = await this.getUserQuizAttempts(userId);
      const totalAttempts = attempts.length;
      const correctAttempts = attempts.filter((a) => a.is_correct).length;
      const accuracyPercentage = totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0;

      return {
        totalAttempts,
        correctAttempts,
        accuracyPercentage,
      };
    } catch (e) {
      console.warn('[Supabase DB Warning] getUserQuizStats fallback:', e);
      return { totalAttempts: 0, correctAttempts: 0, accuracyPercentage: 0 };
    }
  },

  // ==========================================
  // 4. STUDY STREAKS TRACKING
  // ==========================================
  async getStudyStreak(userId: string): Promise<StudyStreakData | null> {
    const { data, error } = await supabase
      .from('study_streaks')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('[Supabase DB Error] getStudyStreak:', error);
      return null;
    }
    return data;
  },

  async updateStudyStreak(userId: string, streakCount: number, lastActivityDate?: string): Promise<StudyStreakData> {
    const payload = {
      user_id: userId,
      streak_count: streakCount,
      last_activity_date: lastActivityDate || new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('study_streaks')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('[Supabase DB Error] updateStudyStreak:', error);
      return {
        user_id: userId,
        streak_count: streakCount,
        last_activity_date: payload.last_activity_date,
      };
    }
    return data;
  },

  async updateStudyStreakOnActivity(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const streakData = await this.getStudyStreak(userId);
      let newStreak = 1;

      if (streakData && streakData.last_activity_date) {
        const lastDate = new Date(streakData.last_activity_date);
        const currentDate = new Date(today);
        const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          newStreak = streakData.streak_count || 1;
        } else if (diffDays === 1) {
          newStreak = (streakData.streak_count || 0) + 1;
        } else {
          newStreak = 1;
        }
      }

      await this.updateStudyStreak(userId, newStreak, today);

      try {
        await this.updateProfile(userId, { current_streak: newStreak, last_active_date: today });
      } catch (err) {
        // non-blocking
      }

      return newStreak;
    } catch (e) {
      console.warn('[Supabase DB Warning] updateStudyStreakOnActivity fallback:', e);
      return 1;
    }
  },

  // ==========================================
  // 5. SUBSCRIPTIONS STATUS & MANAGEMENT
  // ==========================================
  async getSubscriptionStatus(userId: string): Promise<SubscriptionData | null> {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116' && error.code !== 'PGRST205') {
      console.error('[Supabase DB Error] getSubscriptionStatus:', error);
      throw error;
    }
    return data;
  },

  async upsertSubscription(
    userId: string,
    plan: string,
    status: string,
    reference?: string,
    periodEnd?: string
  ): Promise<SubscriptionData> {
    const payload = {
      user_id: userId,
      plan,
      status,
      paystack_reference: reference,
      current_period_end: periodEnd,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('subscriptions')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('[Supabase DB Error] upsertSubscription:', error);
      throw error;
    }
    return data;
  },

  async hasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const sub = await this.getSubscriptionStatus(userId);
      if (!sub) return false;
      if (sub.status !== 'active') return false;
      if (!sub.current_period_end) return false;

      const expiryDate = new Date(sub.current_period_end);
      return expiryDate.getTime() > Date.now();
    } catch (e) {
      console.warn('[Supabase DB Warning] hasActiveSubscription check failed:', e);
      return false;
    }
  },

  // ==========================================
  // 6. REALTIME SUBSCRIPTIONS
  // ==========================================
  subscribeToTable<T>(
    tableName: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: (payload: T) => void
  ) {
    const channel = supabase
      .channel(`realtime_${tableName}`)
      .on(
        'postgres_changes' as never,
        { event, schema: 'public', table: tableName },
        (payload: { new: T }) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return channel;
  },

  // ==========================================
  // 7. NURSING STUDY SYSTEM CRUD
  // ==========================================
  async getSubjects(): Promise<NursingSubject[]> {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('title');

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map((s) => ({
          id: s.id,
          title: s.title,
          code: s.code || '',
          description: s.description || '',
          icon: s.icon || 'BookOpen',
          color: s.color || 'bg-blue-500/10 text-blue-600 border-blue-200',
          flashcardsCount: s.flashcards_count ?? 0,
          quizzesCount: s.quizzes_count ?? 0,
          topics: typeof s.topics === 'string' ? JSON.parse(s.topics) : (s.topics || []),
        }));
      }
    } catch (e) {
      console.warn('[Supabase DB Warning] getSubjects fallback:', e);
    }
    return FALLBACK_SUBJECTS;
  },

  async getFlashcards(userId?: string, subjectId?: string): Promise<Flashcard[]> {
    try {
      let query = supabase.from('flashcards').select('*');
      if (subjectId) {
        query = query.eq('subject_id', subjectId);
      }

      const { data: cards, error } = await query;
      if (error) throw error;

      if (cards && cards.length > 0) {
        const progressMap: Record<string, { is_known?: boolean; is_bookmarked?: boolean }> = {};

        if (userId) {
          const { data: progress } = await supabase
            .from('user_flashcard_progress')
            .select('*')
            .eq('user_id', userId);

          if (progress) {
            progress.forEach((p) => {
              progressMap[p.flashcard_id] = { is_known: p.is_known, is_bookmarked: p.is_bookmarked };
            });
          }
        }

        return cards.map((c) => ({
          id: c.id,
          subjectId: c.subject_id,
          category: c.category || 'General',
          question: c.question,
          answer: c.answer,
          explanation: c.explanation || '',
          isKnown: progressMap[c.id]?.is_known ?? false,
          isBookmarked: progressMap[c.id]?.is_bookmarked ?? false,
        }));
      }
    } catch (e) {
      console.warn('[Supabase DB Warning] getFlashcards fallback:', e);
    }

    let list = FALLBACK_FLASHCARDS;
    if (subjectId) {
      list = list.filter((f) => f.subjectId === subjectId);
    }
    return list;
  },

  async createFlashcard(card: Omit<Flashcard, 'id'>): Promise<Flashcard> {
    try {
      const payload = {
        subject_id: card.subjectId,
        category: card.category || 'General',
        question: card.question,
        answer: card.answer,
        explanation: card.explanation || null,
      };

      const { data, error } = await supabase
        .from('flashcards')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        subjectId: data.subject_id,
        category: data.category || 'General',
        question: data.question,
        answer: data.answer,
        explanation: data.explanation || '',
        isKnown: false,
        isBookmarked: false,
      };
    } catch (e) {
      console.warn('[Supabase DB Warning] createFlashcard fallback:', e);
      return {
        id: `fc_${Date.now()}`,
        ...card,
      };
    }
  },

  async updateFlashcardProgress(
    userId: string,
    flashcardId: string,
    updates: { isKnown?: boolean; isBookmarked?: boolean }
  ): Promise<void> {
    try {
      const payload: Partial<UserFlashcardProgressData> = {
        user_id: userId,
        flashcard_id: flashcardId,
        updated_at: new Date().toISOString(),
      };
      if (updates.isKnown !== undefined) payload.is_known = updates.isKnown;
      if (updates.isBookmarked !== undefined) payload.is_bookmarked = updates.isBookmarked;

      const { error } = await supabase
        .from('user_flashcard_progress')
        .upsert(payload, { onConflict: 'user_id,flashcard_id' });

      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase DB Warning] updateFlashcardProgress fallback:', e);
    }
  },

  async deleteFlashcard(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase DB Warning] deleteFlashcard fallback:', e);
    }
  },

  async getNotes(userId: string): Promise<NursingNote[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (data) {
        return data.map((n) => ({
          id: n.id,
          title: n.title,
          subjectId: n.subject_id || '',
          content: n.content,
          category: n.category || 'General',
          createdAt: n.created_at ? n.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
          updatedAt: n.updated_at ? n.updated_at.split('T')[0] : new Date().toISOString().split('T')[0],
          isBookmarked: n.is_bookmarked ?? false,
          tags: typeof n.tags === 'string' ? JSON.parse(n.tags) : (n.tags || []),
        }));
      }
    } catch (e) {
      console.warn('[Supabase DB Warning] getNotes fallback:', e);
    }
    return userId ? [] : FALLBACK_NOTES;
  },

  async createNote(userId: string, note: Omit<NursingNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<NursingNote> {
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      user_id: userId,
      subject_id: note.subjectId || null,
      title: note.title,
      content: note.content,
      category: note.category || 'General',
      is_bookmarked: note.isBookmarked ?? false,
      tags: note.tags || [],
    };

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        title: data.title,
        subjectId: data.subject_id || '',
        content: data.content,
        category: data.category || 'General',
        createdAt: data.created_at ? data.created_at.split('T')[0] : today,
        updatedAt: data.updated_at ? data.updated_at.split('T')[0] : today,
        isBookmarked: data.is_bookmarked ?? false,
        tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : (data.tags || []),
      };
    } catch (e) {
      console.warn('[Supabase DB Warning] createNote fallback:', e);
      return {
        id: `note_${Date.now()}`,
        ...note,
        createdAt: today,
        updatedAt: today,
      };
    }
  },

  async updateNote(id: string, updates: Partial<NursingNote>): Promise<void> {
    try {
      const dbUpdates: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.content !== undefined) dbUpdates.content = updates.content;
      if (updates.subjectId !== undefined) dbUpdates.subject_id = updates.subjectId || null;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.isBookmarked !== undefined) dbUpdates.is_bookmarked = updates.isBookmarked;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;

      const { error } = await supabase
        .from('notes')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase DB Warning] updateNote fallback:', e);
    }
  },

  async deleteNote(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase DB Warning] deleteNote fallback:', e);
    }
  },

  async getStudyPlans(userId: string): Promise<StudyPlan[]> {
    try {
      const { data: plans, error: planError } = await supabase
        .from('study_plans')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (planError) throw planError;

      if (plans) {
        if (plans.length === 0) return [];

        const planIds = plans.map((p) => p.id);
        const { data: tasks, error: taskError } = await supabase
          .from('study_plan_tasks')
          .select('*')
          .in('plan_id', planIds);

        if (taskError) throw taskError;

        const taskMap: Record<string, StudyPlanTask[]> = {};
        if (tasks) {
          tasks.forEach((t) => {
            if (!taskMap[t.plan_id]) taskMap[t.plan_id] = [];
            taskMap[t.plan_id].push({
              id: t.id,
              day: t.day as any,
              taskTitle: t.task_title,
              taskType: t.task_type as any,
              isCompleted: t.is_completed ?? false,
            });
          });
        }

        return plans.map((p) => ({
          id: p.id,
          title: p.title,
          subjectId: p.subject_id || '',
          startDate: p.start_date || new Date().toISOString().split('T')[0],
          targetEndDate: p.target_end_date || new Date().toISOString().split('T')[0],
          tasks: taskMap[p.id] || [],
        }));
      }
    } catch (e) {
      console.warn('[Supabase DB Warning] getStudyPlans fallback:', e);
    }
    return userId ? [] : FALLBACK_STUDY_PLANS;
  },

  async createStudyPlan(
    userId: string,
    title: string,
    subjectId: string,
    tasks: Array<{ day: any; taskTitle: string; taskType: any }>
  ): Promise<StudyPlan> {
    const startDate = new Date().toISOString().split('T')[0];
    const targetEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    try {
      const { data: planData, error: planError } = await supabase
        .from('study_plans')
        .insert({
          user_id: userId,
          title,
          subject_id: subjectId || null,
          start_date: startDate,
          target_end_date: targetEndDate,
        })
        .select()
        .single();

      if (planError) throw planError;

      const taskPayloads = tasks.map((t) => ({
        plan_id: planData.id,
        day: t.day,
        task_title: t.taskTitle,
        task_type: t.taskType,
        is_completed: false,
      }));

      const { data: createdTasks, error: taskError } = await supabase
        .from('study_plan_tasks')
        .insert(taskPayloads)
        .select();

      if (taskError) throw taskError;

      return {
        id: planData.id,
        title: planData.title,
        subjectId: planData.subject_id || '',
        startDate,
        targetEndDate,
        tasks: (createdTasks || []).map((t) => ({
          id: t.id,
          day: t.day as any,
          taskTitle: t.task_title,
          taskType: t.task_type as any,
          isCompleted: t.is_completed ?? false,
        })),
      };
    } catch (e) {
      console.warn('[Supabase DB Warning] createStudyPlan fallback:', e);
      return {
        id: `plan_${Date.now()}`,
        title,
        subjectId,
        startDate,
        targetEndDate,
        tasks: tasks.map((t, idx) => ({
          id: `t_${Date.now()}_${idx}`,
          day: t.day,
          taskTitle: t.taskTitle,
          taskType: t.taskType,
          isCompleted: false,
        })),
      };
    }
  },

  async toggleStudyPlanTask(taskId: string, isCompleted: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .from('study_plan_tasks')
        .update({ is_completed: isCompleted })
        .eq('id', taskId);

      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase DB Warning] toggleStudyPlanTask fallback:', e);
    }
  },

  // ==========================================
  // 8. ACADEMIC TRACKER CRUD
  // ==========================================
  async getSemesters(userId: string): Promise<Semester[]> {
    try {
      const { data: semData, error: semError } = await supabase
        .from('semesters')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (semError) throw semError;

      if (semData) {
        if (semData.length === 0) return [];

        const semIds = semData.map((s) => s.id);
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('*')
          .in('semester_id', semIds);

        if (courseError) throw courseError;

        const coursesBySem: Record<string, Course[]> = {};
        if (courseData) {
          courseData.forEach((c) => {
            if (!coursesBySem[c.semester_id]) coursesBySem[c.semester_id] = [];
            coursesBySem[c.semester_id].push({
              id: c.id,
              code: c.code,
              title: c.title,
              creditUnits: c.credit_units,
              grade: c.grade,
              gradePoints: Number(c.grade_points),
              semesterId: c.semester_id,
            });
          });
        }

        return semData.map((s) => ({
          id: s.id,
          name: s.name,
          academicYear: s.academic_year,
          isCompleted: s.is_completed ?? false,
          gpa: Number(s.gpa ?? 0),
          totalCredits: s.total_credits ?? 0,
          courses: coursesBySem[s.id] || [],
        }));
      }
    } catch (e) {
      console.warn('[Supabase DB Warning] getSemesters fallback:', e);
    }
    return userId ? [] : FALLBACK_SEMESTERS;
  },

  async createSemester(userId: string, name: string, academicYear: string): Promise<Semester> {
    try {
      const { data, error } = await supabase
        .from('semesters')
        .insert({
          user_id: userId,
          name,
          academic_year: academicYear,
          is_completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        name: data.name,
        academicYear: data.academic_year,
        isCompleted: data.is_completed ?? false,
        gpa: 0.0,
        totalCredits: 0,
        courses: [],
      };
    } catch (e) {
      console.warn('[Supabase DB Warning] createSemester fallback:', e);
      return {
        id: `sem_${Date.now()}`,
        name,
        academicYear,
        isCompleted: false,
        gpa: 0.0,
        totalCredits: 0,
        courses: [],
      };
    }
  },

  async deleteSemester(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('semesters').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase DB Warning] deleteSemester fallback:', e);
    }
  },

  async createCourse(
    userId: string,
    semesterId: string,
    courseData: Omit<Course, 'id' | 'semesterId'>
  ): Promise<Course> {
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert({
          user_id: userId,
          semester_id: semesterId,
          code: courseData.code,
          title: courseData.title,
          credit_units: courseData.creditUnits,
          grade: courseData.grade,
          grade_points: courseData.gradePoints,
        })
        .select()
        .single();

      if (error) throw error;
      return {
        id: data.id,
        code: data.code,
        title: data.title,
        creditUnits: data.credit_units,
        grade: data.grade as any,
        gradePoints: Number(data.grade_points),
        semesterId: data.semester_id,
      };
    } catch (e) {
      console.warn('[Supabase DB Warning] createCourse fallback:', e);
      return {
        id: `crs_${Date.now()}`,
        ...courseData,
        semesterId,
      };
    }
  },

  async updateCourse(id: string, updates: Partial<Course>): Promise<void> {
    try {
      const payload: Record<string, any> = {};
      if (updates.code !== undefined) payload.code = updates.code;
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.creditUnits !== undefined) payload.credit_units = updates.creditUnits;
      if (updates.grade !== undefined) payload.grade = updates.grade;
      if (updates.gradePoints !== undefined) payload.grade_points = updates.gradePoints;

      const { error } = await supabase.from('courses').update(payload).eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase DB Warning] updateCourse fallback:', e);
    }
  },

  async deleteCourse(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase DB Warning] deleteCourse fallback:', e);
    }
  },

  // ==========================================
  // 7. LEGACY FIRESTORE COMPATIBILITY METHODS
  // ==========================================
  async fetchSemesters(studentId: string): Promise<Semester[]> {
    return this.getSemesters(studentId);
  },

  async saveCourse(studentId: string, course: Partial<Course>): Promise<string> {
    if (course.semesterId && course.code && course.title && course.creditUnits && course.grade) {
      const created = await this.createCourse(studentId, course.semesterId, {
        code: course.code,
        title: course.title,
        creditUnits: course.creditUnits,
        grade: course.grade,
        gradePoints: course.gradePoints ?? 5.0,
      });
      return created.id;
    }
    return `crs_${Date.now()}`;
  },

  async saveNote(studentId: string, note: Partial<NursingNote>): Promise<string> {
    console.log(`[Supabase DB] Saving nursing note:`, note);
    if (note.title && note.content) {
      const created = await this.createNote(studentId, {
        title: note.title,
        subjectId: note.subjectId || '',
        content: note.content,
        category: note.category || 'General',
        isBookmarked: note.isBookmarked ?? false,
        tags: note.tags || [],
      });
      return created.id;
    }
    return `note_${Date.now()}`;
  },

  async createCommunityPost(post: Partial<CommunityPost>): Promise<string> {
    console.log(`[Supabase DB] Publishing community post:`, post);
    return `post_${Date.now()}`;
  },

  async toggleLikePost(postId: string, userId: string, currentlyLiked: boolean): Promise<void> {
    console.log(`[Supabase DB] Toggling post like. PostId: ${postId}, UserId: ${userId}, CurrentlyLiked: ${currentlyLiked}`);
  },

  async addComment(postId: string, comment: Partial<Comment>): Promise<string> {
    console.log(`[Supabase DB] Adding comment to post ${postId}:`, comment);
    return `c_${Date.now()}`;
  }
};

// Backwards compatibility export for components importing firestoreService
export const firestoreService = dbService;
