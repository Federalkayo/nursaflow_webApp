import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { INITIAL_STUDENT_PROFILE } from '../data/mockStudents';
import { authService } from '../services/supabase/authService';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  student: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  login: (email: string, pass: string) => Promise<StudentProfile>;
  register: (name: string, email: string, school: string, level: string, pass?: string) => Promise<{ profile: StudentProfile; session: Session | null }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

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

  useEffect(() => {
    if (student) {
      localStorage.setItem('nursaflow_student', JSON.stringify(student));
    } else {
      localStorage.removeItem('nursaflow_student');
    }
  }, [student]);

  const login = async (email: string, pass: string): Promise<StudentProfile> => {
    setIsLoading(true);
    try {
      const loggedUser = await authService.loginWithEmail(email, pass);
      setStudent(loggedUser);
      return loggedUser;
    } catch (err) {
      setStudent(null);
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    setStudent((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        student,
        isAuthenticated: !!student,
        isLoading,
        isInitializing,
        login,
        register,
        logout,
        updateProfile,
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
