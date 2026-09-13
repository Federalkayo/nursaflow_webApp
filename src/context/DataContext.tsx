import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Semester,
  Course,
  NursingSubject,
  Flashcard,
  Quiz,
  StudyPlan,
  NursingNote,
  CommunityPost,
  StudyGroup,
  Conversation,
  GradeScaleConfig,
  GradeLetter,
} from '../types';
import { INITIAL_SEMESTERS, DEFAULT_GRADE_SCALE } from '../data/mockCourses';
import { INITIAL_SUBJECTS } from '../data/mockSubjects';
import { INITIAL_FLASHCARDS } from '../data/mockFlashcards';
import { INITIAL_QUIZZES } from '../data/mockQuizzes';
import { INITIAL_NOTES } from '../data/mockNotes';
import { INITIAL_STUDY_PLANS } from '../data/mockStudyPlans';
import { INITIAL_COMMUNITY_POSTS } from '../data/mockPosts';
import { INITIAL_STUDY_GROUPS, INITIAL_CONVERSATIONS } from '../data/mockGroups';
import { useAuth } from './AuthContext';
import { dbService } from '../services/supabase/dbService';

interface DataContextType {
  // Academic Tracker
  semesters: Semester[];
  gradeScale: GradeScaleConfig;
  currentGpa: number;
  cgpa: number;
  totalCompletedCredits: number;
  addSemester: (name: string, academicYear: string) => void;
  addCourse: (semesterId: string, course: Omit<Course, 'id' | 'gradePoints' | 'semesterId'>) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;
  deleteSemester: (semesterId: string) => void;
  calculateGpaForCourses: (courses: Array<{ creditUnits: number; grade: GradeLetter }>) => number;

  // Nursing Study System
  subjects: NursingSubject[];
  flashcards: Flashcard[];
  quizzes: Quiz[];
  studyPlans: StudyPlan[];
  notes: NursingNote[];
  toggleFlashcardKnown: (id: string) => void;
  toggleFlashcardBookmark: (id: string) => void;
  addStudyPlan: (title: string, subjectId: string, tasks: Array<{ day: any; taskTitle: string; taskType: any }>) => void;
  toggleTaskCompletion: (planId: string, taskId: string) => void;
  addNote: (note: Omit<NursingNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (id: string, updates: Partial<NursingNote>) => void;
  deleteNote: (id: string) => void;

  // Community
  posts: CommunityPost[];
  groups: StudyGroup[];
  conversations: Conversation[];
  createPost: (title: string, content: string, category: string, tags: string[]) => void;
  toggleLikePost: (postId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  addCommentToPost: (postId: string, content: string) => void;
  toggleJoinGroup: (groupId: string) => void;
  sendMessage: (conversationId: string, text: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { updateProfile, student } = useAuth();
  const [gradeScale] = useState<GradeScaleConfig>(DEFAULT_GRADE_SCALE);

  // Semesters & Academic Data State
  const [semesters, setSemesters] = useState<Semester[]>(() => {
    const key = student?.id ? `nursaflow_semesters_${student.id}` : 'nursaflow_semesters_guest';
    const saved = localStorage.getItem(key);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return student?.id ? [] : INITIAL_SEMESTERS;
  });

  // Subjects & Study Data State
  const [subjects, setSubjects] = useState<NursingSubject[]>(INITIAL_SUBJECTS);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('nursaflow_flashcards');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_FLASHCARDS;
  });
  const [quizzes] = useState<Quiz[]>(INITIAL_QUIZZES);
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(() => {
    const saved = localStorage.getItem('nursaflow_plans');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_STUDY_PLANS;
  });
  const [notes, setNotes] = useState<NursingNote[]>(() => {
    const saved = localStorage.getItem('nursaflow_notes');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_NOTES;
  });

  // Community State
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem('nursaflow_posts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_COMMUNITY_POSTS;
  });
  const [groups, setGroups] = useState<StudyGroup[]>(() => {
    const saved = localStorage.getItem('nursaflow_groups');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_STUDY_GROUPS;
  });
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem('nursaflow_conversations');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_CONVERSATIONS;
  });

  // Persistence Effects
  useEffect(() => {
    const key = student?.id ? `nursaflow_semesters_${student.id}` : 'nursaflow_semesters_guest';
    localStorage.setItem(key, JSON.stringify(semesters));
  }, [semesters, student?.id]);
  useEffect(() => { localStorage.setItem('nursaflow_flashcards', JSON.stringify(flashcards)); }, [flashcards]);
  useEffect(() => { localStorage.setItem('nursaflow_plans', JSON.stringify(studyPlans)); }, [studyPlans]);
  useEffect(() => { localStorage.setItem('nursaflow_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('nursaflow_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('nursaflow_groups', JSON.stringify(groups)); }, [groups]);
  useEffect(() => { localStorage.setItem('nursaflow_conversations', JSON.stringify(conversations)); }, [conversations]);

  useEffect(() => {
    let isMounted = true;
    if (student?.id) {
      dbService.getSemesters(student.id).then((fetched) => {
        if (isMounted && fetched) setSemesters(fetched);
      }).catch((e) => {
        console.warn('[DataContext] getSemesters failed, using cached/mock:', e);
      });
    } else {
      setSemesters(INITIAL_SEMESTERS);
    }
    return () => { isMounted = false; };
  }, [student?.id]);

  useEffect(() => {
    let isMounted = true;
    dbService.getSubjects().then((fetched) => {
      if (isMounted && fetched && fetched.length > 0) setSubjects(fetched);
    }).catch((e) => {
      console.warn('[DataContext] getSubjects failed, using cached/mock:', e);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    dbService.getFlashcards(student?.id).then((fetched) => {
      if (isMounted && fetched && fetched.length > 0) setFlashcards(fetched);
    }).catch((e) => {
      console.warn('[DataContext] getFlashcards failed, using cached/mock:', e);
    });
    return () => { isMounted = false; };
  }, [student?.id]);

  useEffect(() => {
    let isMounted = true;
    if (student?.id) {
      dbService.getNotes(student.id).then((fetched) => {
        if (isMounted && fetched) setNotes(fetched);
      }).catch((e) => {
        console.warn('[DataContext] getNotes failed, using cached/mock:', e);
      });
    } else {
      setNotes(INITIAL_NOTES);
    }
    return () => { isMounted = false; };
  }, [student?.id]);

  useEffect(() => {
    let isMounted = true;
    if (student?.id) {
      dbService.getStudyPlans(student.id).then((fetched) => {
        if (isMounted && fetched) setStudyPlans(fetched);
      }).catch((e) => {
        console.warn('[DataContext] getStudyPlans failed, using cached/mock:', e);
      });
    } else {
      setStudyPlans(INITIAL_STUDY_PLANS);
    }
    return () => { isMounted = false; };
  }, [student?.id]);

  // GPA Calculation Helper function
  const calculateGpaForCourses = (courses: Array<{ creditUnits: number; grade: GradeLetter }>): number => {
    if (!courses || courses.length === 0) return 0.0;
    let totalQualityPoints = 0;
    let totalCredits = 0;

    courses.forEach((c) => {
      const points = gradeScale.gradePoints[c.grade] ?? 0.0;
      totalQualityPoints += c.creditUnits * points;
      totalCredits += c.creditUnits;
    });

    return totalCredits > 0 ? Number((totalQualityPoints / totalCredits).toFixed(2)) : 0.0;
  };

  // Recalculate semester GPAs, overall GPA & CGPA dynamically
  let totalQualityPointsAllSemesters = 0;
  let totalCreditsAllSemesters = 0;
  let currentSemesterGpa = 0.0;

  const recalculatedSemesters = semesters.map((sem) => {
    let semQualityPoints = 0;
    let semCredits = 0;

    sem.courses.forEach((crs) => {
      const pts = gradeScale.gradePoints[crs.grade] ?? 0.0;
      semQualityPoints += crs.creditUnits * pts;
      semCredits += crs.creditUnits;
    });

    const semGpa = semCredits > 0 ? Number((semQualityPoints / semCredits).toFixed(2)) : 0.0;
    if (!sem.isCompleted) {
      currentSemesterGpa = semGpa;
    }

    totalQualityPointsAllSemesters += semQualityPoints;
    totalCreditsAllSemesters += semCredits;

    return { ...sem, gpa: semGpa, totalCredits: semCredits };
  });

  const calculatedCgpa = totalCreditsAllSemesters > 0
    ? Number((totalQualityPointsAllSemesters / totalCreditsAllSemesters).toFixed(2))
    : 0.0;

  // Sync GPA/CGPA with student profile
  useEffect(() => {
    if (student) {
      if (student.gpa !== currentSemesterGpa || student.cgpa !== calculatedCgpa) {
        updateProfile({
          gpa: currentSemesterGpa,
          cgpa: calculatedCgpa,
          completedCredits: totalCreditsAllSemesters,
        });
      }
    }
  }, [semesters]);

  // Academic Actions
  const addSemester = (name: string, academicYear: string) => {
    const tempId = `sem_${Date.now()}`;
    const newSem: Semester = {
      id: tempId,
      name,
      academicYear,
      isCompleted: false,
      courses: [],
      gpa: 0.0,
      totalCredits: 0,
    };
    setSemesters((prev) => [...prev, newSem]);

    if (student?.id) {
      dbService.createSemester(student.id, name, academicYear).then((created) => {
        setSemesters((prev) => prev.map((s) => (s.id === tempId ? created : s)));
      }).catch((err) => {
        console.warn('[DataContext] Failed to create semester on Supabase:', err);
      });
    }
  };

  const addCourse = (semesterId: string, courseData: Omit<Course, 'id' | 'gradePoints' | 'semesterId'>) => {
    const points = gradeScale.gradePoints[courseData.grade] ?? 0.0;
    const tempId = `crs_${Date.now()}`;
    const newCourse: Course = {
      ...courseData,
      id: tempId,
      gradePoints: points,
      semesterId,
    };

    setSemesters((prev) =>
      prev.map((sem) => {
        if (sem.id === semesterId) {
          const updatedCourses = [...sem.courses, newCourse];
          return {
            ...sem,
            courses: updatedCourses,
          };
        }
        return sem;
      })
    );

    if (student?.id) {
      dbService.createCourse(student.id, semesterId, { ...courseData, gradePoints: points }).then((created) => {
        setSemesters((prev) =>
          prev.map((sem) =>
            sem.id === semesterId
              ? { ...sem, courses: sem.courses.map((c) => (c.id === tempId ? created : c)) }
              : sem
          )
        );
      }).catch((err) => {
        console.warn('[DataContext] Failed to create course on Supabase:', err);
      });
    }
  };

  const updateCourse = (courseId: string, updates: Partial<Course>) => {
    setSemesters((prev) =>
      prev.map((sem) => ({
        ...sem,
        courses: sem.courses.map((c) => {
          if (c.id === courseId) {
            const updated = { ...c, ...updates };
            if (updates.grade) {
              updated.gradePoints = gradeScale.gradePoints[updates.grade] ?? 0.0;
            }
            return updated;
          }
          return c;
        }),
      }))
    );
    dbService.updateCourse(courseId, updates).catch(() => {});
  };

  const deleteCourse = (courseId: string) => {
    setSemesters((prev) =>
      prev.map((sem) => ({
        ...sem,
        courses: sem.courses.filter((c) => c.id !== courseId),
      }))
    );
    dbService.deleteCourse(courseId).catch(() => {});
  };

  const deleteSemester = (semesterId: string) => {
    setSemesters((prev) => prev.filter((sem) => sem.id !== semesterId));
    dbService.deleteSemester(semesterId).catch(() => {});
  };

  // Study Actions
  const toggleFlashcardKnown = (id: string) => {
    let updatedVal = false;
    setFlashcards((prev) =>
      prev.map((fc) => {
        if (fc.id === id) {
          updatedVal = !fc.isKnown;
          return { ...fc, isKnown: updatedVal };
        }
        return fc;
      })
    );
    if (student?.id) {
      dbService.updateFlashcardProgress(student.id, id, { isKnown: updatedVal }).catch(() => {});
    }
  };

  const toggleFlashcardBookmark = (id: string) => {
    let updatedVal = false;
    setFlashcards((prev) =>
      prev.map((fc) => {
        if (fc.id === id) {
          updatedVal = !fc.isBookmarked;
          return { ...fc, isBookmarked: updatedVal };
        }
        return fc;
      })
    );
    if (student?.id) {
      dbService.updateFlashcardProgress(student.id, id, { isBookmarked: updatedVal }).catch(() => {});
    }
  };

  const addStudyPlan = (title: string, subjectId: string, tasksData: Array<{ day: any; taskTitle: string; taskType: any }>) => {
    const startDate = new Date().toISOString().split('T')[0];
    const targetEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const tempId = `plan_${Date.now()}`;
    const newPlan: StudyPlan = {
      id: tempId,
      title,
      subjectId,
      startDate,
      targetEndDate,
      tasks: tasksData.map((t, idx) => ({
        id: `t_${Date.now()}_${idx}`,
        day: t.day,
        taskTitle: t.taskTitle,
        taskType: t.taskType,
        isCompleted: false,
      })),
    };
    setStudyPlans((prev) => [newPlan, ...prev]);

    if (student?.id) {
      dbService.createStudyPlan(student.id, title, subjectId, tasksData).then((persistedPlan) => {
        setStudyPlans((prev) => prev.map((p) => (p.id === tempId ? persistedPlan : p)));
      }).catch((err) => {
        console.warn('[DataContext] Failed to create study plan on Supabase:', err);
      });
    }
  };

  const toggleTaskCompletion = (planId: string, taskId: string) => {
    let isCompleted = false;
    setStudyPlans((prev) =>
      prev.map((p) => {
        if (p.id === planId) {
          return {
            ...p,
            tasks: p.tasks.map((t) => {
              if (t.id === taskId) {
                isCompleted = !t.isCompleted;
                return { ...t, isCompleted };
              }
              return t;
            }),
          };
        }
        return p;
      })
    );
    dbService.toggleStudyPlanTask(taskId, isCompleted).catch(() => {});
  };

  const addNote = (noteData: Omit<NursingNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const today = new Date().toISOString().split('T')[0];
    const tempId = `note_${Date.now()}`;
    const newNote: NursingNote = {
      ...noteData,
      id: tempId,
      createdAt: today,
      updatedAt: today,
    };
    setNotes((prev) => [newNote, ...prev]);

    if (student?.id) {
      dbService.createNote(student.id, noteData).then((persistedNote) => {
        setNotes((prev) => prev.map((n) => (n.id === tempId ? persistedNote : n)));
      }).catch((err) => {
        console.warn('[DataContext] Failed to create note on Supabase:', err);
      });
    }
  };

  const updateNote = (id: string, updates: Partial<NursingNote>) => {
    const today = new Date().toISOString().split('T')[0];
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: today } : n))
    );
    dbService.updateNote(id, updates).catch(() => {});
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    dbService.deleteNote(id).catch(() => {});
  };

  // Community Actions
  const createPost = (title: string, content: string, category: string, tags: string[]) => {
    const newPost: CommunityPost = {
      id: `post_${Date.now()}`,
      authorName: student?.name || 'Nightingale Maya',
      authorAvatar: student?.avatarUrl || 'https://images.unsplash.com/photo-1594824813571-28a62617b9d2?w=150&auto=format&fit=crop&q=80',
      authorLevel: student?.level || '300 Level BSN',
      authorSchool: student?.school || 'Johns Hopkins Nursing',
      title,
      content,
      category,
      createdAt: 'Just now',
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isBookmarked: false,
      tags,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const toggleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likesCount: isLiked ? p.likesCount + 1 : p.likesCount - 1,
          };
        }
        return p;
      })
    );
  };

  const toggleBookmarkPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  };

  const addCommentToPost = (postId: string, content: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c_${Date.now()}`,
            postId,
            authorName: student?.name || 'Nightingale Maya',
            authorAvatar: student?.avatarUrl || 'https://images.unsplash.com/photo-1594824813571-28a62617b9d2?w=150&auto=format&fit=crop&q=80',
            authorLevel: student?.level || '300 Level BSN',
            content,
            createdAt: 'Just now',
            likesCount: 0,
            isLiked: false,
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );
  };

  const toggleJoinGroup = (groupId: string) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const isMember = !g.isMember;
          return {
            ...g,
            isMember,
            membersCount: isMember ? g.membersCount + 1 : g.membersCount - 1,
          };
        }
        return g;
      })
    );
  };

  const sendMessage = (conversationId: string, text: string) => {
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id === conversationId) {
          const newMsg = {
            id: `m_${Date.now()}`,
            senderId: student?.id || 'user_1',
            senderName: student?.name || 'Nightingale Maya',
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
          };
          return {
            ...conv,
            lastMessage: text,
            lastMessageTime: newMsg.timestamp,
            messages: [...conv.messages, newMsg],
          };
        }
        return conv;
      })
    );
  };

  return (
    <DataContext.Provider
      value={{
        semesters: recalculatedSemesters,
        gradeScale,
        currentGpa: currentSemesterGpa,
        cgpa: calculatedCgpa,
        totalCompletedCredits: totalCreditsAllSemesters,
        addSemester,
        addCourse,
        updateCourse,
        deleteCourse,
        deleteSemester,
        calculateGpaForCourses,
        subjects,
        flashcards,
        quizzes,
        studyPlans,
        notes,
        toggleFlashcardKnown,
        toggleFlashcardBookmark,
        addStudyPlan,
        toggleTaskCompletion,
        addNote,
        updateNote,
        deleteNote,
        posts,
        groups,
        conversations,
        createPost,
        toggleLikePost,
        toggleBookmarkPost,
        addCommentToPost,
        toggleJoinGroup,
        sendMessage,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
