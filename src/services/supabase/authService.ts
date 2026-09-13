import { supabase } from './supabaseClient';
import { StudentProfile } from '../../types';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { dbService } from './dbService';

export interface AuthState {
  user: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const authService = {
  /**
   * Supabase Auth: Sign Up with email, password, and metadata
   */
  async signUp(
    email: string,
    password: string,
    metadata?: { full_name?: string; school?: string; level?: string }
  ) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata?.full_name || email,
          school: metadata?.school || 'NursaFlow Nursing Academy',
          level: metadata?.level || '300 Level (BSN)',
        },
      },
    });

    if (error) throw error;

    // Application-side profile creation fallback
    if (data.user) {
      try {
        await dbService.upsertProfile({
          id: data.user.id,
          full_name: metadata?.full_name || email.split('@')[0],
          school: metadata?.school || 'NursaFlow Nursing Academy',
          level: metadata?.level || '300 Level (BSN)',
          target_gpa: 4.50,
          current_streak: 1,
        });
      } catch (err) {
        console.warn('[Supabase Auth Warning] Profile upsert on signup fallback:', err);
      }
    }

    return data;
  },

  /**
   * Supabase Auth: Sign In with email & password
   */
  async signIn(email: string, password: string) {
    console.log('[Supabase Auth Request] Attempting signInWithPassword for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    console.log('[Supabase Auth Response] signInWithPassword result:', { data, error });

    if (error) throw error;
    return data;
  },

  /**
   * Supabase Auth: Sign Out
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (e) {
      console.warn('[Supabase Auth Notice] Sign out completed:', e);
    }
  },

  /**
   * Supabase Auth: Get current session
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) return null;
      return data.session;
    } catch (e) {
      return null;
    }
  },

  /**
   * Supabase Auth: Listen to auth state changes
   */
  onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    const { data: subscription } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },

  /**
   * Convert Supabase User + Profile into StudentProfile format
   */
  async buildStudentProfile(user: User): Promise<StudentProfile> {
    const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'NursaFlow Student';
    const fallbackSchool = user.user_metadata?.school || 'NursaFlow Nursing Academy';
    const fallbackLevel = user.user_metadata?.level || '300 Level (BSN)';

    let localSaved: Partial<StudentProfile> = {};
    try {
      const savedStr = localStorage.getItem('nursaflow_student');
      if (savedStr) localSaved = JSON.parse(savedStr);
    } catch (e) {}

    try {
      let dbProfile = await dbService.getProfile(user.id);
      
      if (!dbProfile) {
        try {
          console.log('[Supabase Auth Auto-heal] Profiles row missing for user. Auto-healing profile row for:', user.id);
          await dbService.upsertProfile({
            id: user.id,
            full_name: fallbackName,
            school: fallbackSchool,
            level: fallbackLevel,
            target_gpa: 4.50,
            current_streak: 1,
          });
          dbProfile = await dbService.getProfile(user.id);
        } catch (healErr) {
          console.warn('[Supabase Auth Auto-heal Warning] Failed to auto-create missing profile:', healErr);
        }
      }

      const name = dbProfile?.full_name || fallbackName;

      return {
        id: user.id,
        email: user.email || '',
        name,
        school: dbProfile?.school || fallbackSchool,
        level: dbProfile?.level || fallbackLevel,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
        gpa: localSaved.gpa || 0.0,
        cgpa: localSaved.cgpa || 0.0,
        targetCgpa: dbProfile?.target_gpa ? Number(dbProfile.target_gpa) : (localSaved.targetCgpa ?? 4.50),
        studyStreakDays: dbProfile?.current_streak ?? localSaved.studyStreakDays ?? 1,
        studyHoursTotal: dbProfile?.total_study_hours ?? localSaved.studyHoursTotal ?? 0,
        completedCredits: localSaved.completedCredits || 0,
        totalRequiredCredits: 120,
        achievements: localSaved.achievements || [],
        lastStudyDate: dbProfile?.last_active_date || localSaved.lastStudyDate,
      };
    } catch (e) {
      console.warn('[Supabase Auth Warning] Failed to load DB profile, using user metadata:', e);
      return {
        id: user.id,
        email: user.email || '',
        name: fallbackName,
        school: fallbackSchool,
        level: fallbackLevel,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fallbackName)}`,
        gpa: localSaved.gpa || 0.0,
        cgpa: localSaved.cgpa || 0.0,
        targetCgpa: localSaved.targetCgpa ?? 4.50,
        studyStreakDays: localSaved.studyStreakDays ?? 1,
        studyHoursTotal: localSaved.studyHoursTotal ?? 0,
        completedCredits: localSaved.completedCredits || 0,
        totalRequiredCredits: 120,
        achievements: localSaved.achievements || [],
        lastStudyDate: localSaved.lastStudyDate,
      };
    }
  },

  /**
   * Sign in with email and password via Supabase Auth
   */
  async loginWithEmail(email: string, password: string): Promise<StudentProfile> {
    const data = await this.signIn(email, password);
    if (!data.user) {
      throw new Error('Sign in succeeded but no user details were returned.');
    }
    return await this.buildStudentProfile(data.user);
  },

  /**
   * Register new student via Supabase Auth
   */
  async registerStudent(
    name: string,
    email: string,
    school: string,
    level: string,
    password?: string
  ): Promise<{ profile: StudentProfile; session: Session | null }> {
    const defaultPass = password || 'Password123!';
    const data = await this.signUp(email, defaultPass, { full_name: name, school, level });
    
    let profile: StudentProfile = {
      id: data.user?.id || '',
      name,
      email,
      school,
      level,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      gpa: 0.0,
      cgpa: 0.0,
      targetCgpa: 4.50,
      studyStreakDays: 1,
      studyHoursTotal: 0,
      completedCredits: 0,
      totalRequiredCredits: 120,
      achievements: [],
    };

    if (data.user) {
      profile = await this.buildStudentProfile(data.user);
    }

    return {
      profile,
      session: data.session,
    };
  },

  /**
   * Legacy compatible logout method
   */
  async logout(): Promise<void> {
    await this.signOut();
  },

  /**
   * Legacy compatible auth state listener
   */
  subscribeAuthState(callback: (user: StudentProfile | null) => void): () => void {
    const subscription = this.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await this.buildStudentProfile(session.user);
        callback(profile);
      } else {
        callback(null);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }
};

// Backwards compatibility alias for components importing firebaseAuthService
export const firebaseAuthService = authService;
