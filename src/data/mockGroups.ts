import { StudyGroup, Conversation } from '../types';

export const INITIAL_STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'grp_1',
    name: 'NCLEX-RN Next Gen Conquerors 2026',
    description: 'Focused study squad working through Next Generation NCLEX case studies, NGN item types, and clinical judgment models.',
    membersCount: 142,
    category: 'NCLEX Prep',
    isMember: true,
    avatarUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=150&auto=format&fit=crop&q=80',
    recentActivity: 'Elena started a discussion on Fluid & Electrolytes case study 15 mins ago.'
  },
  {
    id: 'grp_2',
    name: 'Pharmacology Drug Suffix Mastermind',
    description: 'Weekly drug flashcards sessions, dosage calculation drills, and high-yield pharmacology mnemonic sharing.',
    membersCount: 98,
    category: 'Pharmacology',
    isMember: true,
    avatarUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=150&auto=format&fit=crop&q=80',
    recentActivity: 'David uploaded a summary note for Beta-Blockers vs ACE Inhibitors.'
  },
  {
    id: 'grp_3',
    name: 'Pediatric & Maternal Health Nursing Squad',
    description: 'Dedicated group for OB/GYN, labor & delivery nursing, APGAR scoring drills, and pediatric growth milestones.',
    membersCount: 75,
    category: 'Maternal & Child',
    isMember: false,
    avatarUrl: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=150&auto=format&fit=crop&q=80',
    recentActivity: 'New quiz posted: Pediatric Vital Signs & Developmental Stages.'
  },
  {
    id: 'grp_4',
    name: 'Anatomy & Physiology Visual Learners',
    description: 'Diagrams, 3D anatomical models, organ cross-sections, and pathophysiology mechanisms discussion.',
    membersCount: 210,
    category: 'Anatomy',
    isMember: false,
    avatarUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=150&auto=format&fit=crop&q=80',
    recentActivity: '3D Heart Wall diagram uploaded.'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    peerName: 'Sarah Jenkins',
    peerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    peerLevel: '400 Level Senior',
    isOnline: true,
    lastMessage: 'Let me know if you need the PDF notes for Cardiovascular Pharmacology!',
    lastMessageTime: '10:42 AM',
    unreadCount: 2,
    messages: [
      { id: 'm_1', senderId: 'user_1', senderName: 'Nightingale Maya', text: 'Hi Sarah! Loved your post on cranial nerve mnemonics!', timestamp: '10:35 AM', isMe: true },
      { id: 'm_2', senderId: 'sarah_j', senderName: 'Sarah Jenkins', text: 'Thank you Maya! Glad it helped. Are you taking Pharm II this semester?', timestamp: '10:38 AM', isMe: false },
      { id: 'm_3', senderId: 'user_1', senderName: 'Nightingale Maya', text: 'Yes! Currently reviewing cardiac glycosides and diuretics.', timestamp: '10:40 AM', isMe: true },
      { id: 'm_4', senderId: 'sarah_j', senderName: 'Sarah Jenkins', text: 'Let me know if you need the PDF notes for Cardiovascular Pharmacology!', timestamp: '10:42 AM', isMe: false }
    ]
  },
  {
    id: 'conv_2',
    peerName: 'David Chen',
    peerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    peerLevel: '300 Level Junior',
    isOnline: false,
    lastMessage: 'Are we still hosting the study room session at 4 PM?',
    lastMessageTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: 'm_5', senderId: 'david_c', senderName: 'David Chen', text: 'Are we still hosting the study room session at 4 PM?', timestamp: 'Yesterday', isMe: false },
      { id: 'm_6', senderId: 'user_1', senderName: 'Nightingale Maya', text: 'Yes, absolutely! I am bringing the practice quiz questions.', timestamp: 'Yesterday', isMe: true }
    ]
  }
];
