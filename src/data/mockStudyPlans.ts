import { StudyPlan } from '../types';

export const INITIAL_STUDY_PLANS: StudyPlan[] = [
  {
    id: 'plan_1',
    title: 'Pharmacology Midterm Sprint Plan',
    subjectId: 'subj_pharm',
    startDate: '2026-09-08',
    targetEndDate: '2026-09-14',
    tasks: [
      { id: 't_1', day: 'Monday', taskTitle: 'Review Cardiac Glycosides & Antihypertensives', taskType: 'Notes', isCompleted: true },
      { id: 't_2', day: 'Tuesday', taskTitle: 'Solve 20 Pharmacology NCLEX Practice Questions', taskType: 'Questions', isCompleted: true },
      { id: 't_3', day: 'Wednesday', taskTitle: 'Flip 30 Pharmacology Flashcards', taskType: 'Flashcards', isCompleted: true },
      { id: 't_4', day: 'Thursday', taskTitle: 'Practice Drug Dosage Calculations (IV Flow & Oral)', taskType: 'Clinical Practice', isCompleted: false },
      { id: 't_5', day: 'Friday', taskTitle: 'Take 10-Minute High-Yield Pharm Practice Quiz', taskType: 'Review', isCompleted: false },
      { id: 't_6', day: 'Saturday', taskTitle: 'Review Incorrect Quiz Answers with AI Tutor', taskType: 'Review', isCompleted: false },
    ],
  },
  {
    id: 'plan_2',
    title: 'Med-Surg Cardiovascular System Intensive',
    subjectId: 'subj_medsurg',
    startDate: '2026-09-10',
    targetEndDate: '2026-09-17',
    tasks: [
      { id: 't_7', day: 'Monday', taskTitle: 'Read Heart Failure & ECG Rhythm Notes', taskType: 'Notes', isCompleted: true },
      { id: 't_8', day: 'Tuesday', taskTitle: 'Complete Med-Surg Flashcards Deck', taskType: 'Flashcards', isCompleted: false },
      { id: 't_9', day: 'Wednesday', taskTitle: 'Group Discussion on Acute Coronary Syndrome', taskType: 'Review', isCompleted: false },
      { id: 't_10', day: 'Thursday', taskTitle: 'Take Cardiovascular Mastery Quiz', taskType: 'Questions', isCompleted: false },
    ],
  },
];
