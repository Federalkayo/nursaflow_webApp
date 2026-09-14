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
  DirectMessage,
  GradeScaleConfig,
  GradeLetter,
} from '../types';
import { INITIAL_SEMESTERS, DEFAULT_GRADE_SCALE } from '../data/mockCourses';
import { INITIAL_SUBJECTS } from '../data/mockSubjects';
import { INITIAL_FLASHCARDS } from '../data/mockFlashcards';
import { INITIAL_QUIZZES } from '../data/mockQuizzes';
import { INITIAL_NOTES } from '../data/mockNotes';
import { INITIAL_STUDY_PLANS } from '../data/mockStudyPlans';
import { useAuth } from './AuthContext';
import { dbService } from '../services/supabase/dbService';
import { supabase } from '../services/supabase/supabaseClient';

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

  // Community State & Actions
  posts: CommunityPost[];
  groups: StudyGroup[];
  conversations: Conversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  selectConversation: (id: string | null) => void;
  isCommunityLoading: boolean;
  hasNewPosts: boolean;
  refreshPosts: () => Promise<void>;
  communityError: string | null;
  clearCommunityError: () => void;
  loadMorePosts: () => Promise<void>;
  createPost: (title: string, content: string, category: string, tags: string[], groupId?: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleBookmarkPost: (postId: string) => void;
  addCommentToPost: (postId: string, content: string) => Promise<void>;
  fetchCommentsForPost: (postId: string) => Promise<void>;
  toggleJoinGroup: (groupId: string) => Promise<void>;
  createGroup: (group: { name: string; category: string; description: string; avatarUrl?: string }) => Promise<void>;
  startConversation: (otherUserId: string) => Promise<string>;
  loadMessagesForConversation: (conversationId: string, page?: number) => Promise<boolean>;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
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

  // Community Backend State (No localStorage caching per requirement)
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isCommunityLoading, setIsCommunityLoading] = useState<boolean>(true);
  const [hasNewPosts, setHasNewPosts] = useState<boolean>(false);
  const [communityError, setCommunityError] = useState<string | null>(null);
  const [postsPage, setPostsPage] = useState<number>(0);

  const clearCommunityError = () => setCommunityError(null);

  // Academic & Study Persistence Effects (Non-community)
  useEffect(() => {
    const key = student?.id ? `nursaflow_semesters_${student.id}` : 'nursaflow_semesters_guest';
    localStorage.setItem(key, JSON.stringify(semesters));
  }, [semesters, student?.id]);
  useEffect(() => { localStorage.setItem('nursaflow_flashcards', JSON.stringify(flashcards)); }, [flashcards]);
  useEffect(() => { localStorage.setItem('nursaflow_plans', JSON.stringify(studyPlans)); }, [studyPlans]);
  useEffect(() => { localStorage.setItem('nursaflow_notes', JSON.stringify(notes)); }, [notes]);

  // Initial Fetch: Semesters, Subjects, Flashcards, Notes, Study Plans
  useEffect(() => {
    let isMounted = true;
    if (student?.id) {
      dbService.getSemesters(student.id).then((fetched) => {
        if (isMounted && fetched) setSemesters(fetched);
      }).catch((e) => {
        console.warn('[DataContext] getSemesters failed:', e);
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
      console.warn('[DataContext] getSubjects failed:', e);
    });
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    let isMounted = true;
    dbService.getFlashcards(student?.id).then((fetched) => {
      if (isMounted && fetched && fetched.length > 0) setFlashcards(fetched);
    }).catch((e) => {
      console.warn('[DataContext] getFlashcards failed:', e);
    });
    return () => { isMounted = false; };
  }, [student?.id]);

  useEffect(() => {
    let isMounted = true;
    if (student?.id) {
      dbService.getNotes(student.id).then((fetched) => {
        if (isMounted && fetched) setNotes(fetched);
      }).catch((e) => {
        console.warn('[DataContext] getNotes failed:', e);
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
        console.warn('[DataContext] getStudyPlans failed:', e);
      });
    } else {
      setStudyPlans(INITIAL_STUDY_PLANS);
    }
    return () => { isMounted = false; };
  }, [student?.id]);

  // ==========================================
  // COMMUNITY DATA FETCHING & REALTIME
  // ==========================================

  // Initial Fetch: Community Posts, Groups, Conversations with Loading State
  useEffect(() => {
    let isMounted = true;
    setIsCommunityLoading(true);

    Promise.all([
      dbService.getPosts(0, 10, undefined, student?.id),
      dbService.getGroups(student?.id),
      student?.id ? dbService.getConversations(student.id) : Promise.resolve([]),
    ])
      .then(([fetchedPosts, fetchedGroups, fetchedConvs]) => {
        if (isMounted) {
          setPosts(fetchedPosts);
          setGroups(fetchedGroups);
          setConversations(fetchedConvs);
          setPostsPage(0);
          setHasNewPosts(false);
          setIsCommunityLoading(false);
        }
      })
      .catch((err) => {
        console.error('[DataContext] Initial community fetch error:', err);
        if (isMounted) {
          setCommunityError('Failed to load community data.');
          setIsCommunityLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [student?.id]);

  // Explicit Refresh Posts (Resets Pagination & Clears hasNewPosts Banner)
  const refreshPosts = async () => {
    try {
      const freshPosts = await dbService.getPosts(0, 10, undefined, student?.id);
      setPosts(freshPosts);
      setPostsPage(0);
      setHasNewPosts(false);
    } catch (err: any) {
      console.error('[DataContext] Error refreshing posts:', err);
      setCommunityError('Failed to refresh posts.');
    }
  };

  // Load More Paginated Posts
  const loadMorePosts = async () => {
    const nextPage = postsPage + 1;
    try {
      const morePosts = await dbService.getPosts(nextPage, 10, undefined, student?.id);
      if (morePosts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newUnique = morePosts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newUnique];
        });
        setPostsPage(nextPage);
      }
    } catch (err: any) {
      console.error('[DataContext] Error loading more posts:', err);
      setCommunityError('Failed to load more posts.');
    }
  };

  // Explicit Conversation Selection: Sets Active Conv & Fetches History
  const selectConversation = (id: string | null) => {
    setActiveConversationId(id);
    if (id) {
      loadMessagesForConversation(id, 0);
    }
  };

  // Realtime Messages Subscription (Server-side filtered per active conversation)
  useEffect(() => {
    if (!activeConversationId) return;

    const channelName = `messages_conv_${activeConversationId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${activeConversationId}`,
        },
        (payload) => {
          const newMsgRow = payload.new as any;
          if (!newMsgRow) return;

          // SKIP sender's own message (handled optimistically & reconciled by sendMessage)
          if (newMsgRow.sender_id === student?.id) {
            return;
          }

          const formattedMsg: DirectMessage = {
            id: newMsgRow.id,
            senderId: newMsgRow.sender_id,
            senderName: 'Peer',
            text: newMsgRow.text,
            timestamp: new Date(newMsgRow.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: false,
          };

          setConversations((prev) =>
            prev.map((c) => {
              if (c.id === activeConversationId) {
                const alreadyExists = (c.messages || []).some((m) => m.id === formattedMsg.id);
                if (alreadyExists) return c;

                return {
                  ...c,
                  lastMessage: formattedMsg.text,
                  lastMessageTime: formattedMsg.timestamp,
                  messages: [...(c.messages || []), formattedMsg],
                };
              }
              return c;
            })
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeConversationId, student?.id]);

  // Realtime Posts & Comments Listener (INSERT & UPDATE)
  // - On INSERT by stranger: sets hasNewPosts = true without wiping user's current pagination
  // - On UPDATE by triggers (likes/comments count changes): updates counts live on screen
  useEffect(() => {
    const postsChannel = supabase
      .channel('realtime_community_posts_and_comments')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'community_posts' },
        (payload) => {
          const newPost = payload.new as any;
          if (newPost && newPost.author_id !== student?.id) {
            setHasNewPosts(true);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'community_posts' },
        (payload) => {
          const updatedPost = payload.new as any;
          if (!updatedPost) return;

          setPosts((prev) =>
            prev.map((p) => {
              if (p.id === updatedPost.id) {
                return {
                  ...p,
                  likesCount: updatedPost.likes_count ?? p.likesCount,
                  commentsCount: updatedPost.comments_count ?? p.commentsCount,
                };
              }
              return p;
            })
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'post_comments' },
        async (payload) => {
          const newComment = payload.new as any;
          if (!newComment) return;

          // The current user's own comments are already added via the optimistic
          // path in addCommentToPost — skip those to avoid a duplicate entry.
          if (newComment.author_id === student?.id) return;

          // Re-fetch the authoritative comment list for this post (with joined
          // author profile info) so other users' comment content actually shows
          // up live, not just the commentsCount ticking up via the UPDATE handler
          // above.
          try {
            const freshComments = await dbService.getComments(newComment.post_id);
            setPosts((prev) =>
              prev.map((p) => (p.id === newComment.post_id ? { ...p, comments: freshComments } : p))
            );
          } catch (err) {
            console.error('[DataContext] Failed to refresh comments after realtime insert:', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsChannel);
    };
  }, [student?.id]);

  // ==========================================
  // ACADEMIC & GPA CALCULATIONS
  // ==========================================

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

  // ==========================================
  // ACADEMIC & STUDY ACTIONS
  // ==========================================

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

  // ==========================================
  // COMMUNITY ACTIONS WITH OPTIMISTIC UPDATES & ROLLBACKS
  // ==========================================

  // Create Post Optimistically
  const createPost = async (title: string, content: string, category: string, tags: string[], groupId?: string) => {
    if (!student?.id) {
      setCommunityError('You must be logged in to create a post.');
      return;
    }

    const tempId = `temp_post_${Date.now()}`;
    const optimisticPost: CommunityPost = {
      id: tempId,
      authorName: student.name || 'Nurse',
      authorAvatar: student.avatarUrl || '',
      authorLevel: student.level || 'BSN Student',
      authorSchool: student.school || 'Nursing School',
      title,
      content,
      category: category || 'General',
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      isLiked: false,
      isBookmarked: false,
      comments: [],
      tags: tags || [],
    };

    // Optimistic Update
    setPosts((prev) => [optimisticPost, ...prev]);

    try {
      const realPost = await dbService.createCommunityPost({
        authorId: student.id,
        title,
        content,
        category,
        tags,
        groupId,
      });

      // Reconcile with real DB row
      setPosts((prev) => prev.map((p) => (p.id === tempId ? realPost : p)));
    } catch (err: any) {
      console.error('[DataContext] createPost failed:', err);
      // Rollback optimistic creation
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
      setCommunityError(err?.message || 'Failed to create post. Please try again.');
    }
  };

  // Toggle Like Post Optimistically via Atomic RPC
  const toggleLikePost = async (postId: string) => {
    if (!student?.id) {
      setCommunityError('You must be logged in to like posts.');
      return;
    }

    let priorLikedState = false;
    let priorLikesCount = 0;

    // Capture exact prior state from functional updater to prevent race condition bugs
    setPosts((prev) => {
      const target = prev.find((p) => p.id === postId);
      if (!target) return prev;
      priorLikedState = !!target.isLiked;
      priorLikesCount = target.likesCount;

      const nextLikedState = !priorLikedState;
      const nextLikesCount = nextLikedState ? priorLikesCount + 1 : Math.max(0, priorLikesCount - 1);

      return prev.map((p) => (p.id === postId ? { ...p, isLiked: nextLikedState, likesCount: nextLikesCount } : p));
    });

    try {
      const isNowLiked = await dbService.toggleLikePost(postId);
      // Reconcile with exact atomic server response
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              isLiked: isNowLiked,
              likesCount: isNowLiked ? Math.max(p.likesCount, priorLikesCount + 1) : Math.max(0, priorLikesCount - 1),
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      console.error('[DataContext] toggleLikePost failed:', err);
      // Rollback to prior exact captured state
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              isLiked: priorLikedState,
              likesCount: priorLikesCount,
            };
          }
          return p;
        })
      );
      setCommunityError(err?.message || 'Failed to update like status.');
    }
  };

  const toggleBookmarkPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p))
    );
  };

  // Fetch Comments for Post
  const fetchCommentsForPost = async (postId: string) => {
    try {
      const comments = await dbService.getComments(postId);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, comments } : p))
      );
    } catch (err: any) {
      console.error('[DataContext] fetchCommentsForPost failed:', err);
    }
  };

  // Add Comment Optimistically
  const addCommentToPost = async (postId: string, content: string) => {
    if (!student?.id) {
      setCommunityError('You must be logged in to add a comment.');
      return;
    }

    const tempCommentId = `temp_c_${Date.now()}`;
    const optimisticComment = {
      id: tempCommentId,
      postId,
      authorName: student.name || 'Nurse',
      authorAvatar: student.avatarUrl || '',
      authorLevel: student.level || 'BSN Student',
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
    };

    // Optimistic Update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...(p.comments || []), optimisticComment],
          };
        }
        return p;
      })
    );

    try {
      const realComment = await dbService.addComment(postId, student.id, content);
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: (p.comments || []).map((c) => (c.id === tempCommentId ? realComment : c)),
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      console.error('[DataContext] addCommentToPost failed:', err);
      // Rollback optimistic comment addition
      setPosts((prev) =>
        prev.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              commentsCount: Math.max(0, p.commentsCount - 1),
              comments: (p.comments || []).filter((c) => c.id !== tempCommentId),
            };
          }
          return p;
        })
      );
      setCommunityError(err?.message || 'Failed to post comment.');
    }
  };

  // Join/Leave Group Optimistically
  const toggleJoinGroup = async (groupId: string) => {
    if (!student?.id) {
      setCommunityError('You must be logged in to join groups.');
      return;
    }

    let priorMemberState = false;
    let priorMembersCount = 0;

    setGroups((prev) => {
      const target = prev.find((g) => g.id === groupId);
      if (!target) return prev;
      priorMemberState = !!target.isMember;
      priorMembersCount = target.membersCount;

      const nextMemberState = !priorMemberState;
      const nextMembersCount = nextMemberState ? priorMembersCount + 1 : Math.max(0, priorMembersCount - 1);

      return prev.map((g) => (g.id === groupId ? { ...g, isMember: nextMemberState, membersCount: nextMembersCount } : g));
    });

    try {
      if (priorMemberState) {
        await dbService.leaveGroup(groupId, student.id);
      } else {
        await dbService.joinGroup(groupId, student.id);
      }
    } catch (err: any) {
      console.error('[DataContext] toggleJoinGroup failed:', err);
      // Rollback
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === groupId) {
            return {
              ...g,
              isMember: priorMemberState,
              membersCount: priorMembersCount,
            };
          }
          return g;
        })
      );
      setCommunityError(err?.message || 'Failed to update group membership.');
    }
  };

  // Create Group
  const createGroup = async (groupData: { name: string; category: string; description: string; avatarUrl?: string }) => {
    if (!student?.id) {
      setCommunityError('You must be logged in to create a group.');
      return;
    }

    try {
      const newGroup = await dbService.createGroup({
        ...groupData,
        createdBy: student.id,
      });
      setGroups((prev) => [newGroup, ...prev]);
    } catch (err: any) {
      console.error('[DataContext] createGroup failed:', err);
      setCommunityError(err?.message || 'Failed to create group.');
      throw err;
    }
  };

  // Start 1-to-1 Conversation via start_conversation RPC & fetch history
  const startConversation = async (otherUserId: string): Promise<string> => {
    if (!student?.id) {
      setCommunityError('You must be logged in to message users.');
      throw new Error('Unauthenticated user');
    }

    try {
      const convId = await dbService.startConversation(otherUserId);
      const updatedConvs = await dbService.getConversations(student.id);
      setConversations(updatedConvs);
      selectConversation(convId);
      return convId;
    } catch (err: any) {
      console.error('[DataContext] startConversation failed:', err);
      setCommunityError(err?.message || 'Failed to start conversation.');
      throw err;
    }
  };

  // Fetch Message History for a Conversation (Paginated)
  const loadMessagesForConversation = async (conversationId: string, page = 0): Promise<boolean> => {
    if (!student?.id) return false;
    const pageSize = 30;
    try {
      const fetchedMsgs = await dbService.getMessages(conversationId, student.id, page, pageSize);
      const hasMore = fetchedMsgs.length === pageSize;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            if (page === 0) {
              return { ...c, messages: fetchedMsgs, hasMoreMessages: hasMore };
            } else {
              const existingIds = new Set((c.messages || []).map((m) => m.id));
              const newOlder = fetchedMsgs.filter((m) => !existingIds.has(m.id));
              return { ...c, messages: [...newOlder, ...(c.messages || [])], hasMoreMessages: hasMore };
            }
          }
          return c;
        })
      );
      return hasMore;
    } catch (err: any) {
      console.error('[DataContext] loadMessagesForConversation error:', err);
      return false;
    }
  };

  // Send Direct Message Optimistically
  const sendMessage = async (conversationId: string, text: string) => {
    if (!student?.id) {
      setCommunityError('You must be logged in to send messages.');
      return;
    }

    const tempMsgId = `temp_m_${Date.now()}`;
    const optimisticMsg: DirectMessage = {
      id: tempMsgId,
      senderId: student.id,
      senderName: student.name || 'You',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    // Optimistic Update
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: optimisticMsg.timestamp,
            messages: [...(c.messages || []), optimisticMsg],
          };
        }
        return c;
      })
    );

    try {
      const realMsg = await dbService.sendMessage(conversationId, student.id, text);
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: (c.messages || []).map((m) => (m.id === tempMsgId ? realMsg : m)),
            };
          }
          return c;
        })
      );
    } catch (err: any) {
      console.error('[DataContext] sendMessage failed:', err);
      // Rollback
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              messages: (c.messages || []).filter((m) => m.id !== tempMsgId),
            };
          }
          return c;
        })
      );
      setCommunityError(err?.message || 'Failed to send message.');
    }
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
        activeConversationId,
        setActiveConversationId,
        selectConversation,
        isCommunityLoading,
        hasNewPosts,
        refreshPosts,
        communityError,
        clearCommunityError,
        loadMorePosts,
        createPost,
        toggleLikePost,
        toggleBookmarkPost,
        addCommentToPost,
        fetchCommentsForPost,
        toggleJoinGroup,
        createGroup,
        startConversation,
        loadMessagesForConversation,
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
