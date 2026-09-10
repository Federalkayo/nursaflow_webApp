import { CommunityPost } from '../types';

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post_1',
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    authorLevel: '400 Level (Senior BSN)',
    authorSchool: 'University of Washington School of Nursing',
    title: 'What is the absolute easiest way you remember Cranial Nerves?',
    content: 'Hey future nurses! I used to struggle so much during lab practicals until I memorized the "Oh Oh Oh To Touch And Feel..." rhyme. How do you guys memorize cranial nerve functions vs names?',
    category: 'Anatomy Tips',
    createdAt: '2 hours ago',
    likesCount: 34,
    commentsCount: 12,
    isLiked: false,
    isBookmarked: true,
    tags: ['Anatomy', 'NCLEX', 'StudyHacks'],
    comments: [
      {
        id: 'c_1',
        postId: 'post_1',
        authorName: 'Marcus Vance',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        authorLevel: '300 Level BSN',
        content: 'For sensory vs motor vs both, "Some Say Marry Money But My Brother Says Big Brains Matter More" saved my grade!',
        createdAt: '1 hour ago',
        likesCount: 8,
        isLiked: true
      },
      {
        id: 'c_2',
        postId: 'post_1',
        authorName: 'Aisha Bello',
        authorAvatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&auto=format&fit=crop&q=80',
        authorLevel: '200 Level BSN',
        content: 'I draw faces with numbers! Like eyes made out of "2" for Optic Nerve. Super visual!',
        createdAt: '30 mins ago',
        likesCount: 5,
        isLiked: false
      }
    ]
  },
  {
    id: 'post_2',
    authorName: 'David Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    authorLevel: '300 Level BSN',
    authorSchool: 'Emory University Nell Hodgson Woodruff School',
    title: 'Dosage Calculations Tip: Desired Over Have Times Volume formula works 95% of the time!',
    content: 'Whenever you get stuck in pediatric or adult drug dosage questions, write down: (Desired Dose / Dose on Hand) × Volume. Always make sure your units match (convert mg to g or mcg to mg FIRST)!',
    category: 'Pharmacology Tips',
    createdAt: '5 hours ago',
    likesCount: 56,
    commentsCount: 8,
    isLiked: true,
    isBookmarked: true,
    tags: ['ClinicalTools', 'DosageCalc', 'NursingMath'],
    comments: [
      {
        id: 'c_3',
        postId: 'post_2',
        authorName: 'Maya Nightingale',
        authorAvatar: 'https://images.unsplash.com/photo-1594824813571-28a62617b9d2?w=120&auto=format&fit=crop&q=80',
        authorLevel: '300 Level BSN',
        content: 'This saved me on my Pharm exam yesterday! NursaFlow dosage calculator also lets you verify instantly.',
        createdAt: '4 hours ago',
        likesCount: 12,
        isLiked: false
      }
    ]
  },
  {
    id: 'post_3',
    authorName: 'Elena Rostova',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    authorLevel: '400 Level BSN',
    authorSchool: 'Penn Nursing',
    title: 'NCLEX-RN Next Gen Study Group starting this weekend!',
    content: 'We are hosting live study rooms on NursaFlow to solve Next Gen Case Studies (NCSBN Clinical Judgment Measurement Model). Comment below or join the group to get notified!',
    category: 'Study Groups',
    createdAt: '1 day ago',
    likesCount: 89,
    commentsCount: 24,
    isLiked: false,
    isBookmarked: false,
    tags: ['NCLEXNextGen', 'StudyRoom', 'ClinicalJudgment'],
    comments: []
  }
];
