// ==========================================
// STUDENT & AUTH TYPES
// ==========================================

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  school: string;
  level: string; // e.g. "300 Level (BSN)"
  avatarUrl: string;
  gpa: number;
  cgpa: number;
  targetCgpa: number;
  studyStreakDays: number;
  studyHoursTotal: number;
  completedCredits: number;
  totalRequiredCredits: number;
  achievements: Achievement[];
  lastStudyDate?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'streak' | 'quiz' | 'study' | 'clinical';
}

// ==========================================
// ACADEMIC TRACKER & GPA TYPES
// ==========================================

export type GradeLetter = 'A' | 'B' | 'C' | 'D' | 'F';

export interface GradeScaleConfig {
  scaleName: string;
  maxPoints: number;
  gradePoints: Record<GradeLetter, number>;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  creditUnits: number;
  grade: GradeLetter;
  gradePoints: number;
  semesterId: string;
}

export interface Semester {
  id: string;
  name: string; // e.g., "100 Level - First Semester"
  academicYear: string;
  isCompleted: boolean;
  courses: Course[];
  gpa: number;
  totalCredits: number;
}

// ==========================================
// STUDY SYSTEM TYPES
// ==========================================

export interface NursingSubject {
  id: string;
  title: string;
  code: string;
  description: string;
  icon: string;
  color: string;
  flashcardsCount: number;
  quizzesCount: number;
  topics: string[];
}

export interface Flashcard {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
  explanation?: string;
  isKnown?: boolean;
  isBookmarked?: boolean;
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  subjectId: string;
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  subjectTitle: string;
  durationMinutes: number;
  questions: QuizQuestion[];
}

export interface StudyPlanTask {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  taskTitle: string;
  taskType: 'Questions' | 'Flashcards' | 'Notes' | 'Clinical Practice' | 'Review';
  isCompleted: boolean;
}

export interface StudyPlan {
  id: string;
  title: string;
  subjectId: string;
  startDate: string;
  targetEndDate: string;
  tasks: StudyPlanTask[];
}

export interface NursingNote {
  id: string;
  title: string;
  subjectId: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  isBookmarked: boolean;
  tags: string[];
}

// ==========================================
// COMMUNITY & CHAT TYPES
// ==========================================

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: string;
  content: string;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: string;
  authorSchool: string;
  title: string;
  content: string;
  category: string; // e.g. "NCLEX-RN", "Pharmacology Tips", "Clinical Stories"
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  comments: Comment[];
  tags: string[];
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  category: string;
  isMember: boolean;
  avatarUrl: string;
  recentActivity: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  peerName: string;
  peerAvatar: string;
  peerLevel: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectMessage[];
}

// ==========================================
// AI TUTOR TYPES
// ==========================================

export interface ChatMessage {
  id: string;
  sender: 'user' | 'tutor';
  text: string;
  timestamp: string;
  isThinking?: boolean;
  isFallback?: boolean;
  fallbackReason?: string;
}

// ==========================================
// CLINICAL TOOL INPUT/OUTPUT TYPES
// ==========================================

export interface DosageCalcInput {
  requiredDose: number;
  availableDose: number;
  availableVolume: number;
  unit: string;
}

export interface DosageCalcResult {
  amountToAdminister: number;
  formula: string;
}

export interface IVFlowCalcInput {
  totalVolumeMl: number;
  timeHours: number;
  dropFactorGtt: number;
}

export interface IVFlowCalcResult {
  dropsPerMin: number;
  totalMinutes: number;
  flowRateMlPerHour: number;
}

export interface BmiCalcInput {
  weightKg: number;
  heightCm: number;
}

export interface BmiCalcResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obesity Class I' | 'Obesity Class II' | 'Obesity Class III';
  color: string;
}

export interface GcsCalcInput {
  eyeResponse: number; // 1-4
  verbalResponse: number; // 1-5
  motorResponse: number; // 1-6
}

export interface GcsCalcResult {
  totalScore: number;
  severity: 'Severe Head Injury (GCS 3-8)' | 'Moderate Head Injury (GCS 9-12)' | 'Minor Head Injury (GCS 13-15)';
}

export interface ApgarCalcInput {
  appearance: number; // 0-2
  pulse: number; // 0-2
  grimace: number; // 0-2
  activity: number; // 0-2
  respiration: number; // 0-2
}

export interface ApgarCalcResult {
  totalScore: number;
  interpretation: 'Severely Depressed (0-3)' | 'Moderately Depressed (4-6)' | 'Normal / Excellent (7-10)';
}

export type UnitType = 'mass' | 'volume' | 'temp';

export interface UnitConversionInput {
  value: number;
  fromUnit: string;
  toUnit: string;
  type: UnitType;
}
