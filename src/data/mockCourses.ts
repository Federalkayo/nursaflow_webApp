import { Semester, GradeScaleConfig } from '../types';

export const DEFAULT_GRADE_SCALE: GradeScaleConfig = {
  scaleName: '5.0 Standard Scale',
  maxPoints: 5.0,
  gradePoints: {
    A: 5.0,
    B: 4.0,
    C: 3.0,
    D: 2.0,
    F: 0.0,
  },
};

export const INITIAL_SEMESTERS: Semester[] = [
  {
    id: 'sem_100_1',
    name: '100 Level - First Semester',
    academicYear: '2024/2025',
    isCompleted: true,
    gpa: 4.50,
    totalCredits: 18,
    courses: [
      { id: 'c_1', code: 'ANA 101', title: 'Human Anatomy I', creditUnits: 4, grade: 'A', gradePoints: 5.0, semesterId: 'sem_100_1' },
      { id: 'c_2', code: 'PHS 101', title: 'Human Physiology I', creditUnits: 4, grade: 'A', gradePoints: 5.0, semesterId: 'sem_100_1' },
      { id: 'c_3', code: 'CHM 101', title: 'General Chemistry for Health Sciences', creditUnits: 3, grade: 'B', gradePoints: 4.0, semesterId: 'sem_100_1' },
      { id: 'c_4', code: 'NUR 101', title: 'Introduction to Professional Nursing', creditUnits: 3, grade: 'A', gradePoints: 5.0, semesterId: 'sem_100_1' },
      { id: 'c_5', code: 'BIO 101', title: 'Cellular Biology', creditUnits: 4, grade: 'A', gradePoints: 5.0, semesterId: 'sem_100_1' },
    ],
  },
  {
    id: 'sem_100_2',
    name: '100 Level - Second Semester',
    academicYear: '2024/2025',
    isCompleted: true,
    gpa: 4.25,
    totalCredits: 20,
    courses: [
      { id: 'c_6', code: 'ANA 102', title: 'Human Anatomy II', creditUnits: 4, grade: 'A', gradePoints: 5.0, semesterId: 'sem_100_2' },
      { id: 'c_7', code: 'PHS 102', title: 'Human Physiology II', creditUnits: 4, grade: 'B', gradePoints: 4.0, semesterId: 'sem_100_2' },
      { id: 'c_8', code: 'BCH 102', title: 'Medical Biochemistry', creditUnits: 3, grade: 'B', gradePoints: 4.0, semesterId: 'sem_100_2' },
      { id: 'c_9', code: 'MCB 102', title: 'Microbiology for Nursing', creditUnits: 3, grade: 'A', gradePoints: 5.0, semesterId: 'sem_100_2' },
      { id: 'c_10', code: 'NUR 102', title: 'Fundamentals of Nursing Science I', creditUnits: 6, grade: 'A', gradePoints: 5.0, semesterId: 'sem_100_2' },
    ],
  },
  {
    id: 'sem_200_1',
    name: '200 Level - First Semester',
    academicYear: '2025/2026',
    isCompleted: true,
    gpa: 4.10,
    totalCredits: 21,
    courses: [
      { id: 'c_11', code: 'NUR 201', title: 'Medical-Surgical Nursing I', creditUnits: 6, grade: 'B', gradePoints: 4.0, semesterId: 'sem_200_1' },
      { id: 'c_12', code: 'PHA 201', title: 'Pharmacology in Nursing I', creditUnits: 4, grade: 'B', gradePoints: 4.0, semesterId: 'sem_200_1' },
      { id: 'c_13', code: 'PTH 201', title: 'Pathophysiology', creditUnits: 4, grade: 'A', gradePoints: 5.0, semesterId: 'sem_200_1' },
      { id: 'c_14', code: 'NUT 201', title: 'Clinical Nutrition & Dietetics', creditUnits: 3, grade: 'A', gradePoints: 5.0, semesterId: 'sem_200_1' },
      { id: 'c_15', code: 'PSY 201', title: 'Psychology for Healthcare', creditUnits: 4, grade: 'B', gradePoints: 4.0, semesterId: 'sem_200_1' },
    ],
  },
  {
    id: 'sem_300_1',
    name: '300 Level - First Semester (Current)',
    academicYear: '2026/2027',
    isCompleted: false,
    gpa: 4.32,
    totalCredits: 19,
    courses: [
      { id: 'c_16', code: 'NUR 301', title: 'Maternal & Child Health Nursing', creditUnits: 6, grade: 'A', gradePoints: 5.0, semesterId: 'sem_300_1' },
      { id: 'c_17', code: 'NUR 303', title: 'Mental Health Nursing', creditUnits: 4, grade: 'A', gradePoints: 5.0, semesterId: 'sem_300_1' },
      { id: 'c_18', code: 'PHA 301', title: 'Advanced Pharmacology & Therapeutics', creditUnits: 3, grade: 'B', gradePoints: 4.0, semesterId: 'sem_300_1' },
      { id: 'c_19', code: 'NUR 305', title: 'Community Health Nursing I', creditUnits: 4, grade: 'A', gradePoints: 5.0, semesterId: 'sem_300_1' },
      { id: 'c_20', code: 'STA 301', title: 'Health Biostatistics', creditUnits: 2, grade: 'B', gradePoints: 4.0, semesterId: 'sem_300_1' },
    ],
  },
];
