import { supabase } from './supabaseClient';
import { StudentProfile } from '../../types';
import { INITIAL_STUDENT_PROFILE } from '../../data/mockStudents';
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
    try {
      const dbProfile = await dbService.getProfile(user.id);
      return {
        ...INITIAL_STUDENT_PROFILE,
        id: user.id,
        email: user.email || INITIAL_STUDENT_PROFILE.email,
        name: dbProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || INITIAL_STUDENT_PROFILE.name,
        school: dbProfile?.school || user.user_metadata?.school || INITIAL_STUDENT_PROFILE.school,
        level: dbProfile?.level || user.user_metadata?.level || INITIAL_STUDENT_PROFILE.level,
        targetCgpa: dbProfile?.target_gpa ? Number(dbProfile.target_gpa) : INITIAL_STUDENT_PROFILE.targetCgpa,
        studyStreakDays: dbProfile?.current_streak || INITIAL_STUDENT_PROFILE.studyStreakDays,
      };
    } catch (e) {
      console.warn('[Supabase Auth Warning] Failed to load DB profile, using user metadata:', e);
      return {
        ...INITIAL_STUDENT_PROFILE,
        id: user.id,
        email: user.email || INITIAL_STUDENT_PROFILE.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || INITIAL_STUDENT_PROFILE.name,
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
      ...INITIAL_STUDENT_PROFILE,
      id: data.user?.id || `std_${Date.now()}`,
      name,
      email,
      school,
      level,
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
