import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { INITIAL_STUDENT_PROFILE } from '../data/mockStudents';
import { firebaseAuthService } from '../services/firebase/authService';

interface AuthContextType {
  student: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, school: string, level: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<StudentProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<StudentProfile | null>(() => {
    const saved = localStorage.getItem('nursaflow_student');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved student state', e);
      }
    }
    return INITIAL_STUDENT_PROFILE;
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (student) {
      localStorage.setItem('nursaflow_student', JSON.stringify(student));
    } else {
      localStorage.removeItem('nursaflow_student');
    }
  }, [student]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await firebaseAuthService.loginWithEmail(email, pass);
      setStudent(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, school: string, level: string) => {
    setIsLoading(true);
    try {
      const newUser = await firebaseAuthService.registerStudent(name, email, school, level);
      setStudent(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await firebaseAuthService.logout();
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
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
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
