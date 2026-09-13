import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StudentProfile } from '../types';
import { authService } from '../services/supabase/authService';
import { dbService } from '../services/supabase/dbService';
import { Session } from '@supabase/supabase-js';

const IS_UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface AuthContextType {
  student: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, pass: string) => Promise<StudentProfile>;
  register: (name: string, email: string, school: string, level: string, pass?: string) => Promise<{ profile: StudentProfile; session: Session | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => void;
  recordStudyActivity: () => void;
  addStudyTime: (amount: number, isHours?: boolean) => void;

  // Global Live Session Timer & Visibility
  isTimerRunning: boolean;
  timerSeconds: number;
  isTabActive: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
  formatTimer: (totalSec: number) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize student from localStorage only if it contains a valid Supabase UUID
  const [student, setStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem('nursaflow_student');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.id) {
          if (IS_UUID_REGEX.test(parsed.id)) {
            return parsed;
          } else {
            console.warn(`[AuthContext Warning] Rejected cached student profile with invalid non-UUID id: "${parsed.id}"`);
            localStorage.removeItem('nursaflow_student');
          }
        }
      }
    } catch (e) {}
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Global Live Study Session Timer State
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);

  // Tab & Window Focus State Detector
  const [isTabActive, setIsTabActive] = useState<boolean>(() => {
    return typeof document !== 'undefined' ? !document.hidden && document.hasFocus() : true;
  });

  // Track window focus and tab visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden && document.hasFocus());
    };

    const handleFocus = () => setIsTabActive(true);
    const handleBlur = () => setIsTabActive(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Synchronize valid student profile to localStorage
  useEffect(() => {
    if (student && IS_UUID_REGEX.test(student.id)) {
      localStorage.setItem('nursaflow_student', JSON.stringify(student));
    } else {
      localStorage.removeItem('nursaflow_student');
    }
  }, [student]);

  // Record study activity & manage study streak
  const recordStudyActivity = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    
    setStudent((prev) => {
      if (!prev || !IS_UUID_REGEX.test(prev.id)) return prev;
      if (prev.lastStudyDate === today) {
        return prev;
      }

      let newStreak = prev.studyStreakDays || 1;
      if (prev.lastStudyDate) {
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toISOString().split('T')[0];

        if (prev.lastStudyDate === yesterday) {
          newStreak = (prev.studyStreakDays || 0) + 1;
        } else {
          newStreak = 1;
        }
      } else {
        newStreak = prev.studyStreakDays || 1;
      }

      const updated: StudentProfile = {
        ...prev,
        studyStreakDays: newStreak,
        lastStudyDate: today,
      };

      if (prev.id && IS_UUID_REGEX.test(prev.id)) {
        dbService.updateProfile(prev.id, {
          current_streak: newStreak,
          last_active_date: today,
        }).catch((err) => {
          console.warn('[AuthContext] Failed to persist streak to Supabase:', err);
        });
      }

      return updated;
    });
  }, []);

  // Add accumulated study time
  const addStudyTime = useCallback((amount: number, isHours = false) => {
    const hoursToAdd = isHours ? amount : amount / 60;
    if (hoursToAdd <= 0) return;

    setStudent((prev) => {
      if (!prev || !IS_UUID_REGEX.test(prev.id)) return prev;
      const currentHours = prev.studyHoursTotal || 0;
      const updatedHours = Number((currentHours + hoursToAdd).toFixed(2));

      const updated: StudentProfile = {
        ...prev,
        studyHoursTotal: updatedHours,
      };

      if (prev.id && IS_UUID_REGEX.test(prev.id)) {
        dbService.updateProfile(prev.id, {
          total_study_hours: updatedHours,
        }).catch((err) => {
          console.warn('[AuthContext] Failed to persist study hours to Supabase:', err);
        });
      }

      return updated;
    });

    recordStudyActivity();
  }, [recordStudyActivity]);

  // Global Timer Ticking Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTimerRunning && isTabActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev + 1;
          if (next % 60 === 0) {
            addStudyTime(1, false);
          }
          return next;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, isTabActive, addStudyTime]);

  // Global Active Session Auto Timer
  useEffect(() => {
    if (!isTabActive) return;

    const interval = setInterval(() => {
      if (!isTimerRunning && student && IS_UUID_REGEX.test(student.id)) {
        addStudyTime(1, false);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isTabActive, isTimerRunning, addStudyTime, student]);

  const toggleTimer = useCallback(() => {
    setIsTimerRunning((prev) => {
      const next = !prev;
      if (next) {
        recordStudyActivity();
      }
      return next;
    });
  }, [recordStudyActivity]);

  const resetTimer = useCallback(() => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  }, []);

  const formatTimer = useCallback((totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Restore session on app load and listen for auth state changes
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const session = await authService.getSession();
        if (session?.user && isMounted) {
          const profile = await authService.buildStudentProfile(session.user);
          setStudent(profile);
        } else if (isMounted) {
          setStudent(null);
          localStorage.removeItem('nursaflow_student');
        }
      } catch (e) {
        console.warn('[AuthContext Warning] Failed to check Supabase session:', e);
        if (isMounted) {
          setStudent(null);
          localStorage.removeItem('nursaflow_student');
        }
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    };

    initSession();

    // Subscribe to auth state changes from Supabase
    const { subscription } = authService.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session?.user) {
          const profile = await authService.buildStudentProfile(session.user);
          setStudent(profile);
        }
      } else if (event === 'SIGNED_OUT') {
        setStudent(null);
        localStorage.removeItem('nursaflow_student');
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, pass: string): Promise<StudentProfile> => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.loginWithEmail(email, pass);
      setStudent(loggedUser);
      return loggedUser;
    } catch (err) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    school: string,
    level: string,
    pass?: string
  ): Promise<{ profile: StudentProfile; session: Session | null }> => {
    setIsLoading(true);
    try {
      const result = await authService.registerStudent(name, email, school, level, pass);
      if (result.session) {
        setStudent(result.profile);
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setStudent(null);
      localStorage.removeItem('nursaflow_student');
      setIsTimerRunning(false);
      setTimerSeconds(0);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setStudent((prev) => {
      if (!prev || !IS_UUID_REGEX.test(prev.id)) return prev;
      const updated: StudentProfile = { ...prev, ...updates };

      const payload: Record<string, any> = {};
      if (updates.name !== undefined) payload.full_name = updates.name;
      if (updates.school !== undefined) payload.school = updates.school;
      if (updates.level !== undefined) payload.level = updates.level;
      if (updates.targetCgpa !== undefined) payload.target_gpa = updates.targetCgpa;
      if (updates.studyStreakDays !== undefined) payload.current_streak = updates.studyStreakDays;
      if (updates.studyHoursTotal !== undefined) payload.total_study_hours = updates.studyHoursTotal;
      if (updates.lastStudyDate !== undefined) payload.last_active_date = updates.lastStudyDate;

      if (Object.keys(payload).length > 0) {
        dbService.updateProfile(prev.id, payload).catch((err: unknown) => {
          console.warn('[AuthContext] Failed to persist profile update to Supabase:', err);
        });
      }

      return updated;
    });
  };

  const isAuthenticated = !!student && IS_UUID_REGEX.test(student.id);

  return (
    <AuthContext.Provider
      value={{
        student,
        isAuthenticated,
        isLoading,
        isInitializing,
        login,
        register,
        logout,
        updateProfile,
        recordStudyActivity,
        addStudyTime,
        isTimerRunning,
        timerSeconds,
        isTabActive,
        toggleTimer,
        resetTimer,
        formatTimer,
      }}
    >
      {isInitializing ? (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading NursaFlow Session...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
