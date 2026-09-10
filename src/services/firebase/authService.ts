import { StudentProfile } from '../../types';
import { INITIAL_STUDENT_PROFILE } from '../../data/mockStudents';

/**
 * FIREBASE AUTHENTICATION SERVICE PLACEHOLDER
 * ==========================================
 * TODO: Replace this mock implementation with Firebase Authentication SDK:
 * 1. Initialize Firebase App (`initializeApp(firebaseConfig)`)
 * 2. Import `getAuth`, `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged` from 'firebase/auth'.
 * 3. Connect real user credentials and token management.
 */

export interface AuthState {
  user: StudentProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const firebaseAuthService = {
  // TODO: Replace with firebase/auth signInWithEmailAndPassword
  async loginWithEmail(email: string, password: string): Promise<StudentProfile> {
    console.log(`[Firebase Auth TODO] Authenticating user with email: ${email}`);
    // Simulate network latency for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    // Return mock profile
    return {
      ...INITIAL_STUDENT_PROFILE,
      email: email || INITIAL_STUDENT_PROFILE.email,
    };
  },

  // TODO: Replace with firebase/auth createUserWithEmailAndPassword & setDoc in Firestore
  async registerStudent(name: string, email: string, school: string, level: string): Promise<StudentProfile> {
    console.log(`[Firebase Auth TODO] Registering new student: ${name} (${email}) at ${school}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    return {
      ...INITIAL_STUDENT_PROFILE,
      id: `std_${Date.now()}`,
      name,
      email,
      school,
      level,
    };
  },

  // TODO: Replace with firebase/auth signOut(auth)
  async logout(): Promise<void> {
    console.log('[Firebase Auth TODO] User signed out');
    await new Promise((resolve) => setTimeout(resolve, 300));
  },

  // TODO: Replace with firebase/auth onAuthStateChanged observer listener
  subscribeAuthState(callback: (user: StudentProfile | null) => void): () => void {
    console.log('[Firebase Auth TODO] Subscribed to auth state listener');
    // Default mock user logged in
    callback(INITIAL_STUDENT_PROFILE);
    return () => console.log('[Firebase Auth TODO] Unsubscribed auth listener');
  }
};
