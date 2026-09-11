import { supabase } from './supabaseClient';
import { Semester, Course, NursingNote, CommunityPost, Comment } from '../../types';

export interface ProfileData {
  id: string;
  full_name?: string;
  school?: string;
  level?: string;
  target_gpa?: number;
  current_streak?: number;
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
  // 7. LEGACY FIRESTORE COMPATIBILITY METHODS
  // ==========================================
  async fetchSemesters(studentId: string): Promise<Semester[]> {
    console.log(`[Supabase DB] Fetching semesters for studentId: ${studentId}`);
    return [];
  },

  async saveCourse(studentId: string, course: Partial<Course>): Promise<string> {
    console.log(`[Supabase DB] Saving course for studentId ${studentId}:`, course);
    return `crs_${Date.now()}`;
  },

  async saveNote(studentId: string, note: Partial<NursingNote>): Promise<string> {
    console.log(`[Supabase DB] Saving nursing note:`, note);
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
