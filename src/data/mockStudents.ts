import { StudentProfile } from '../types';

export const INITIAL_STUDENT_PROFILE: StudentProfile = {
  id: 'std_100928',
  name: 'Nightingale Maya',
  email: 'maya.nursing@nursaflow.edu',
  school: 'Johns Hopkins School of Nursing',
  level: '300 Level (Junior Year BSN)',
  avatarUrl: 'https://images.unsplash.com/photo-1594824813571-28a62617b9d2?w=150&auto=format&fit=crop&q=80',
  gpa: 4.32,
  cgpa: 4.18,
  targetCgpa: 4.50,
  studyStreakDays: 12,
  studyHoursTotal: 128.5,
  completedCredits: 78,
  totalRequiredCredits: 120,
  achievements: [
    {
      id: 'ach_1',
      title: '12-Day Study Streak',
      description: 'Logged in and studied for 12 consecutive days!',
      icon: 'Flame',
      unlockedAt: '2026-09-08',
      category: 'streak'
    },
    {
      id: 'ach_2',
      title: 'Pharm Quiz Master',
      description: 'Scored 100% on Pharmacology NCLEX Quiz.',
      icon: 'Award',
      unlockedAt: '2026-09-05',
      category: 'quiz'
    },
    {
      id: 'ach_3',
      title: 'Dosage Wizard',
      description: 'Calculated 25 drug dosage equations accurately.',
      icon: 'Calculator',
      unlockedAt: '2026-09-01',
      category: 'clinical'
    },
    {
      id: 'ach_4',
      title: '50 Hours Milestone',
      description: 'Completed over 50 hours of active study time.',
      icon: 'Clock',
      unlockedAt: '2026-08-20',
      category: 'study'
    }
  ]
};
