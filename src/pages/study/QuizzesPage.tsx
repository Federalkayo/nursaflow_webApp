import React, { useState, useEffect } from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  RotateCcw,
  ArrowRight,
  Filter,
  Loader2,
  TrendingUp,
  Target,
  Gauge,
  Lock,
  Trophy,
  Bookmark,
  BookmarkCheck,
  FileText,
  Trash2,
  BarChart3,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  dbService,
  TopicData,
  QuizQuestionData,
  QuizLevel,
  LEVEL_QUESTION_COUNTS,
  LEVEL_ORDER,
  PASS_THRESHOLD_PERCENT,
  TopicLevelProgress,
  MIN_SESSION_QUESTIONS,
  UserAnalytics,
} from '../../services/supabase/dbService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';

export const QuizzesPage: React.FC = () => {
  const { student, updateProfile, addStudyTime, recordStudyActivity } = useAuth();

  const [topics, setTopics] = useState<TopicData[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageMode, setPageMode] = useState<'practice' | 'exam' | 'bookmarks' | 'analytics'>('practice');

  // Leveled practice state
  const [topicProgress, setTopicProgress] = useState<TopicLevelProgress | null>(null);
  const [topicQuestionCounts, setTopicQuestionCounts] = useState<Record<QuizLevel, number> | null>(null);
  const [isProgressLoading, setIsProgressLoading] = useState<boolean>(false);
  const [activeLevel, setActiveLevel] = useState<QuizLevel | null>(null);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSessionMode, setActiveSessionMode] = useState<'practice' | 'exam'>('practice');
  const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
  const [levelResult, setLevelResult] = useState<{ passed: boolean; percentage: number } | null>(null);
  const [examResult, setExamResult] = useState<{ percentage: number } | null>(null);

  // Exam mode config
  const [examQuestionCount, setExamQuestionCount] = useState<number>(25);
  const [examTopicId, setExamTopicId] = useState<string>(''); // '' = all topics

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [bookmarksList, setBookmarksList] = useState<QuizQuestionData[]>([]);
  const [isBookmarksLoading, setIsBookmarksLoading] = useState<boolean>(false);

  // Analytics
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null);
  const [isAnalyticsLoading, setIsAnalyticsLoading] = useState<boolean>(false);

  // Active Quiz State
  const [isActiveQuiz, setIsActiveQuiz] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600);
  const [isStarting, setIsStarting] = useState<boolean>(false);

  // User Attempts Stats
  const [quizStats, setQuizStats] = useState<{ totalAttempts: number; correctAttempts: number; accuracyPercentage: number }>({
    totalAttempts: 0,
    correctAttempts: 0,
    accuracyPercentage: 0,
  });

  // Load Topics and User Stats on mount; default to the first topic.
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [fetchedTopics, stats] = await Promise.all([
          dbService.getTopics(),
          student?.id ? dbService.getUserQuizStats(student.id) : Promise.resolve(null),
        ]);

        setTopics(fetchedTopics);
        if (fetchedTopics.length > 0) setSelectedTopicId(fetchedTopics[0].id);
        if (stats) setQuizStats(stats);
      } catch (err) {
        console.error('[QuizzesPage Error] Failed to load quiz data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [student?.id]);

  // Load this student's level progress + real question counts whenever the selected topic changes.
  useEffect(() => {
    const loadProgress = async () => {
      if (!selectedTopicId || !student?.id) {
        setTopicProgress(null);
        setTopicQuestionCounts(null);
        return;
      }
      setIsProgressLoading(true);
      try {
        const [progress, counts] = await Promise.all([
          dbService.getTopicLevelProgress(student.id, selectedTopicId),
          dbService.getTopicQuestionCounts(selectedTopicId),
        ]);
        setTopicProgress(progress);
        setTopicQuestionCounts(counts);
      } catch (err) {
        console.error('[QuizzesPage Error] Failed to load topic progress:', err);
        setTopicProgress(null);
        setTopicQuestionCounts(null);
      } finally {
        setIsProgressLoading(false);
      }
    };

    loadProgress();
  }, [selectedTopicId, student?.id]);

  // Load analytics when the Analytics tab is opened.
  useEffect(() => {
    const loadAnalytics = async () => {
      if (pageMode !== 'analytics' || !student?.id) return;
      setIsAnalyticsLoading(true);
      try {
        const data = await dbService.getUserAnalytics(student.id);
        setAnalytics(data);
      } catch (err) {
        console.error('[QuizzesPage Error] Failed to load analytics:', err);
      } finally {
        setIsAnalyticsLoading(false);
      }
    };

    loadAnalytics();
  }, [pageMode, student?.id]);

  // Load the full bookmarks list when the Bookmarks tab is opened.
  useEffect(() => {
    const loadBookmarksList = async () => {
      if (pageMode !== 'bookmarks' || !student?.id) return;
      setIsBookmarksLoading(true);
      try {
        const list = await dbService.getBookmarkedQuestions(student.id);
        setBookmarksList(list);
      } catch (err) {
        console.error('[QuizzesPage Error] Failed to load bookmarks:', err);
      } finally {
        setIsBookmarksLoading(false);
      }
    };

    loadBookmarksList();
  }, [pageMode, student?.id]);

  const handleRemoveBookmark = async (questionId: string | undefined) => {
    if (!student?.id || !questionId) return;
    await dbService.setBookmark(student.id, questionId, false);
    setBookmarksList((prev) => prev.filter((q) => q.id !== questionId));
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  };

  const handleToggleBookmark = async () => {
    const currentQ = questions[currentQuestionIdx];
    if (!student?.id || !currentQ?.id) return;
    const isCurrentlyBookmarked = bookmarkedIds.has(currentQ.id);

    // Optimistic update
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (isCurrentlyBookmarked) next.delete(currentQ.id!);
      else next.add(currentQ.id!);
      return next;
    });

    const ok = await dbService.setBookmark(student.id, currentQ.id, !isCurrentlyBookmarked);
    if (!ok) {
      // Revert on failure
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        if (isCurrentlyBookmarked) next.add(currentQ.id!);
        else next.delete(currentQ.id!);
        return next;
      });
    }
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
  };

  // Timer Effect for active quiz session
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActiveQuiz && !isSubmitted && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            handleCompleteQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isActiveQuiz, isSubmitted, timeLeftSeconds]);

  const handleStartLevel = async (level: QuizLevel) => {
    if (!student?.id || !selectedTopicId || isStarting) return;
    setIsStarting(true);
    try {
      const { sessionId, questions: fetchedQuestions } = await dbService.startLevelSession(
        student.id,
        selectedTopicId,
        level
      );

      if (fetchedQuestions.length === 0) {
        console.warn('[QuizzesPage] No published questions available for this topic/level yet.');
        setIsStarting(false);
        return;
      }

      setActiveSessionMode('practice');
      setActiveLevel(level);
      setActiveSessionId(sessionId);
      setQuestions(fetchedQuestions);
      setLevelResult(null);
      setExamResult(null);
      setIsActiveQuiz(true);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setTimeLeftSeconds(fetchedQuestions.length * 90); // 90 seconds per question
      dbService.getBookmarkedQuestionIds(student.id).then(setBookmarkedIds).catch(() => {});
    } catch (err) {
      console.error('[QuizzesPage Error] Failed to start level session:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStartExam = async () => {
    if (!student?.id || isStarting) return;
    setIsStarting(true);
    try {
      const { sessionId, questions: fetchedQuestions } = await dbService.startExamSession(
        student.id,
        examQuestionCount,
        examTopicId || null
      );

      if (fetchedQuestions.length === 0) {
        console.warn('[QuizzesPage] No published questions available for this exam configuration yet.');
        setIsStarting(false);
        return;
      }

      setActiveSessionMode('exam');
      setActiveLevel(null);
      setActiveSessionId(sessionId);
      setQuestions(fetchedQuestions);
      setLevelResult(null);
      setExamResult(null);
      setIsActiveQuiz(true);
      setCurrentQuestionIdx(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setTimeLeftSeconds(fetchedQuestions.length * 90);
      dbService.getBookmarkedQuestionIds(student.id).then(setBookmarkedIds).catch(() => {});
    } catch (err) {
      console.error('[QuizzesPage Error] Failed to start exam session:', err);
    } finally {
      setIsStarting(false);
    }
  };

  const handleSelectOption = async (optionIdx: number) => {
    if (isSubmitted) return;

    const currentQ = questions[currentQuestionIdx];
    const chosenOptionText = currentQ.options[optionIdx];
    const isCorrect = chosenOptionText === currentQ.correct_answer;

    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestionIdx]: optionIdx,
    }));

    // Record attempt in database
    if (student?.id) {
      try {
        await dbService.recordQuizAttempt(student.id, currentQ.id, chosenOptionText, isCorrect);
      } catch (err) {
        console.warn('[Quiz Attempt Record Error]:', err);
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = async () => {
    setIsSubmitted(true);

    // Record study time (15 mins) and study streak
    addStudyTime(15, false);
    recordStudyActivity();

    const correctCount = questions.filter(
      (q, idx) => selectedAnswers[idx] !== undefined && q.options[selectedAnswers[idx]] === q.correct_answer
    ).length;

    if (activeSessionMode === 'practice' && activeLevel) {
      try {
        const result = await dbService.completeLevelSession(activeSessionId, correctCount, questions.length);
        setLevelResult(result);
      } catch (err) {
        console.warn('[Quiz Completion Level Error]:', err);
      }
    } else if (activeSessionMode === 'exam') {
      try {
        const result = await dbService.completeExamSession(activeSessionId, correctCount, questions.length);
        setExamResult(result);
      } catch (err) {
        console.warn('[Quiz Completion Exam Error]:', err);
      }
    }

    if (student?.id && !student.id.startsWith('std_guest')) {
      try {
        const updatedStreak = await dbService.updateStudyStreakOnActivity(student.id);
        updateProfile({ studyStreakDays: updatedStreak });

        const freshStats = await dbService.getUserQuizStats(student.id);
        setQuizStats(freshStats);

        // Refresh level progress in case this attempt unlocked the next level.
        if (selectedTopicId) {
          const progress = await dbService.getTopicLevelProgress(student.id, selectedTopicId);
          setTopicProgress(progress);
        }
      } catch (err) {
        console.warn('[Quiz Completion Streak Error]:', err);
      }
    }
  };

  // Calculate Score Results for current session
  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const chosenIdx = selectedAnswers[idx];
      if (chosenIdx !== undefined && q.options[chosenIdx] === q.correct_answer) {
        correctCount += 1;
      }
    });
    const percentage = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    return { correct: correctCount, total: questions.length, percentage };
  };

  const scoreResults = calculateScore();

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Zap className="w-8 h-8 text-amber-500" />
            <span>NCLEX Practice Quizzes</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Simulated NCLEX-RN multiple-choice drills with instant scoring & clinical rationales.
          </p>
        </div>

        {/* User Quiz Statistics Summary */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center gap-2">
            <Target className="w-4 h-4 text-brand-500" />
            <span>{quizStats.accuracyPercentage}% Accuracy</span>
          </div>
          <div className="px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <span>{quizStats.totalAttempts} Attempts</span>
          </div>
        </div>
      </div>

      {!isActiveQuiz && (
        <div className="relative">
          <div
            className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
              maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
            }}
          >
            {[
              { id: 'practice' as const, label: 'Practice', icon: Gauge },
              { id: 'exam' as const, label: 'Exam Mode', icon: FileText },
              { id: 'bookmarks' as const, label: 'Bookmarks', icon: Bookmark },
              { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPageMode(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 -mb-px transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                  pageMode === tab.id
                    ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
          {/* Scroll hint — only a visual cue, doesn't block taps on content beneath it */}
          <div className="sm:hidden pointer-events-none absolute right-0 top-0 bottom-0 flex items-center pr-0.5">
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
          </div>
        </div>
      )}

      {isActiveQuiz ? null : pageMode === 'practice' ? (
        /* Quiz Topic Selector & Leveled Practice Dashboard */
        <div className="space-y-6">
          {/* Topic Filter Pills */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Select Nursing Topic:</span>
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {topics.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTopic(t.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    selectedTopicId === t.id
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Leveled Practice: Easy -> Medium -> Hard, unlock next at 70%+ */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-amber-500" />
              <span>Levels — pass {PASS_THRESHOLD_PERCENT}%+ to unlock the next:</span>
            </div>

            {isLoading || isProgressLoading ? (
              <div className="py-8 flex items-center justify-center gap-3 text-slate-400 text-xs font-semibold">
                <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                <span>Loading levels...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LEVEL_ORDER.map((level, idx) => {
                  const unlockedIdx = topicProgress ? LEVEL_ORDER.indexOf(topicProgress.unlockedLevel) : 0;
                  const isPassed = topicProgress
                    ? (topicProgress.bestScores[level] ?? 0) >= PASS_THRESHOLD_PERCENT
                    : false;
                  const isLocked = idx > unlockedIdx && !isPassed;
                  const bestScore = topicProgress?.bestScores[level] ?? null;
                  const standardCount = LEVEL_QUESTION_COUNTS[level];
                  const availableCount = topicQuestionCounts?.[level] ?? 0;
                  const actualCount = Math.min(standardCount, availableCount);
                  const isInsufficientContent = availableCount < MIN_SESSION_QUESTIONS;

                  return (
                    <Card
                      key={level}
                      className={`p-5 space-y-4 relative overflow-hidden ${
                        isLocked || isInsufficientContent
                          ? 'opacity-60'
                          : 'bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 text-white border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant={isPassed ? 'success' : 'warning'} className="capitalize">
                          {level}
                        </Badge>
                        {isPassed && <Trophy className="w-4 h-4 text-amber-400" />}
                        {isLocked && <Lock className="w-4 h-4 text-slate-400" />}
                      </div>

                      <div>
                        <p className={`text-sm font-bold ${isLocked || isInsufficientContent ? 'text-slate-500 dark:text-slate-400' : 'text-white'}`}>
                          {isInsufficientContent
                            ? `Only ${availableCount} question${availableCount === 1 ? '' : 's'} so far`
                            : actualCount < standardCount
                            ? `${actualCount} Questions (fewer than usual)`
                            : `${actualCount} Questions`}
                        </p>
                        <p className={`text-xs ${isLocked || isInsufficientContent ? 'text-slate-500' : 'text-slate-300'}`}>
                          {bestScore !== null ? `Best score: ${bestScore}%` : 'Not attempted yet'}
                        </p>
                      </div>

                      <Button
                        variant={isLocked || isInsufficientContent ? 'outline' : 'primary'}
                        size="sm"
                        icon={isLocked ? Lock : Zap}
                        onClick={() => !isLocked && !isInsufficientContent && handleStartLevel(level)}
                        disabled={isLocked || isInsufficientContent || isStarting || !selectedTopicId}
                        className="w-full"
                      >
                        {isInsufficientContent
                          ? 'Not enough questions yet'
                          : isLocked
                          ? `Pass ${LEVEL_ORDER[idx - 1]} to unlock`
                          : bestScore !== null
                          ? 'Retake'
                          : 'Start'}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : pageMode === 'exam' ? (
        /* Exam Mode Config */
        <div className="space-y-6">
          <Card className="p-6 sm:p-8 space-y-6 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 text-white border-slate-800">
            <div>
              <Badge variant="brand">Exam Mode</Badge>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">Timed NCLEX-Style Exam</h3>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                A mixed-difficulty set with no answer reveal until you submit. Doesn't affect your practice level progress.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Topic</div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                <button
                  onClick={() => setExamTopicId('')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    examTopicId === ''
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  All Topics
                </button>
                {topics.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setExamTopicId(t.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      examTopicId === t.id
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Number of Questions</div>
              <div className="flex items-center gap-2">
                {[10, 25, 50, 75].map((count) => (
                  <button
                    key={count}
                    onClick={() => setExamQuestionCount(count)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      examQuestionCount === count
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 font-mono font-bold text-sm bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 w-fit">
              <Clock className="w-4 h-4 text-amber-400" />
              <span>~{Math.round(examQuestionCount * 1.5)} Mins</span>
            </div>

            <Button variant="primary" size="lg" icon={FileText} onClick={handleStartExam} disabled={isStarting} className="w-full sm:w-auto">
              {isStarting ? 'Starting...' : `Start Exam (${examQuestionCount} Questions)`}
            </Button>
          </Card>
        </div>
      ) : pageMode === 'bookmarks' ? (
        /* Bookmarked Questions Review */
        <div className="space-y-4">
          {isBookmarksLoading ? (
            <div className="py-8 flex items-center justify-center gap-3 text-slate-400 text-xs font-semibold">
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
              <span>Loading bookmarks...</span>
            </div>
          ) : bookmarksList.length === 0 ? (
            <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-sm text-center">
              No bookmarked questions yet. Tap the bookmark icon on any question during a quiz to save it here.
            </div>
          ) : (
            bookmarksList.map((q) => (
              <Card key={q.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Badge variant="brand" className="capitalize">{q.topic_id}</Badge>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{q.question}</h4>
                  </div>
                  <button
                    onClick={() => handleRemoveBookmark(q.id)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 cursor-pointer shrink-0"
                    aria-label="Remove bookmark"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  {q.correct_answer}
                </div>
                {q.rationale && (
                  <p className="text-xs text-slate-600 dark:text-slate-400">{q.rationale}</p>
                )}
              </Card>
            ))
          )}
        </div>
      ) : (
        /* Analytics Dashboard */
        <div className="space-y-6">
          {isAnalyticsLoading ? (
            <div className="py-8 flex items-center justify-center gap-3 text-slate-400 text-xs font-semibold">
              <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
              <span>Loading analytics...</span>
            </div>
          ) : !analytics || analytics.totalAttempted === 0 ? (
            <div className="p-6 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-sm text-center">
              No quiz attempts yet. Start a practice level or exam to see your analytics here.
            </div>
          ) : (
            <>
              {/* Overall summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Overall Accuracy</p>
                  <p className="text-3xl font-black text-brand-600 dark:text-brand-400">{analytics.overallAccuracy}%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {analytics.totalCorrect} / {analytics.totalAttempted} correct
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Last 7 Days</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">
                    {analytics.recent7d?.attempted ?? 0}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    questions attempted
                    {analytics.previous7d && analytics.previous7d.attempted > 0 && (
                      <>
                        {' '}
                        ({analytics.recent7d && analytics.recent7d.attempted >= analytics.previous7d.attempted ? '+' : ''}
                        {(analytics.recent7d?.attempted ?? 0) - analytics.previous7d.attempted} vs prior week)
                      </>
                    )}
                  </p>
                </Card>

                <Card className="p-5 space-y-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Strongest Topic</p>
                  {analytics.topicStats.length > 0 ? (
                    <>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {analytics.topicStats[0].topic_name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{analytics.topicStats[0].accuracy}% accuracy</p>
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">Not enough data yet</p>
                  )}
                </Card>
              </div>

              {/* Per-topic accuracy breakdown */}
              <Card className="p-5 sm:p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Accuracy by Topic</span>
                </div>
                <div className="space-y-4">
                  {analytics.topicStats.map((stat) => (
                    <div key={stat.topic_id} className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-bold text-slate-700 dark:text-slate-200 truncate min-w-0">{stat.topic_name}</span>
                        <span className="text-slate-500 dark:text-slate-400 shrink-0">
                          {stat.correct}/{stat.attempted} ({stat.accuracy}%)
                        </span>
                      </div>
                      <ProgressBar
                        value={stat.accuracy}
                        color={stat.accuracy >= 70 ? 'emerald' : stat.accuracy >= 40 ? 'amber' : 'rose'}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              {/* Weakest topics callout */}
              {analytics.topicStats.length > 1 && (
                <Card className="p-5 space-y-2 border-amber-200 dark:border-amber-900/40 bg-amber-50 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    <Target className="w-3.5 h-3.5" />
                    <span>Focus Area</span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    Your lowest accuracy is in{' '}
                    <span className="font-bold">{analytics.topicStats[analytics.topicStats.length - 1].topic_name}</span> at{' '}
                    {analytics.topicStats[analytics.topicStats.length - 1].accuracy}%. Consider practicing this topic next.
                  </p>
                </Card>
              )}

              {/* Daily trend (last 14 days with activity) */}
              {analytics.dailyTrend.length > 0 && (
                <Card className="p-5 sm:p-6 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Recent Activity</span>
                  </div>
                  <div className="space-y-2">
                    {analytics.dailyTrend.map((d) => {
                      const dayAccuracy = d.attempted > 0 ? Math.round((d.correct / d.attempted) * 100) : 0;
                      return (
                        <div key={d.day} className="flex items-center gap-3 text-xs">
                          <span className="w-20 shrink-0 text-slate-500 dark:text-slate-400">
                            {new Date(d.day).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex-1">
                            <ProgressBar
                              value={dayAccuracy}
                              color={dayAccuracy >= 70 ? 'emerald' : dayAccuracy >= 40 ? 'amber' : 'rose'}
                            />
                          </div>
                          <span className="w-24 shrink-0 text-right text-slate-500 dark:text-slate-400">
                            {d.correct}/{d.attempted}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {isActiveQuiz && !isSubmitted && (
        /* Active Quiz Question Interface */
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="brand">
                Topic: {questions[currentQuestionIdx]?.topic_id || 'NCLEX'}
              </Badge>
              {questions[currentQuestionIdx]?.difficulty && (
                <Badge variant="warning" className="capitalize">
                  {questions[currentQuestionIdx].difficulty}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 font-mono font-bold text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-900 dark:text-white">
                <Clock className="w-4 h-4 text-amber-500" />
                <span>{formatTime(timeLeftSeconds)}</span>
              </div>
              <button
                onClick={handleToggleBookmark}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  bookmarkedIds.has(questions[currentQuestionIdx]?.id || '')
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 hover:text-amber-500'
                }`}
                aria-label="Bookmark this question"
              >
                {bookmarkedIds.has(questions[currentQuestionIdx]?.id || '') ? (
                  <BookmarkCheck className="w-4 h-4" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <ProgressBar
            value={currentQuestionIdx + 1}
            max={questions.length}
            label={`Question ${currentQuestionIdx + 1} of ${questions.length}`}
            showPercentage
            color="brand"
          />

          <Card className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
              {questions[currentQuestionIdx]?.question}
            </h2>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {questions[currentQuestionIdx]?.options.map((optText, optIdx) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === optIdx;
                return (
                  <button
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-brand-500/10 border-brand-500 text-brand-700 dark:text-brand-300 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{optText}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setIsActiveQuiz(false)}
              >
                Quit Quiz
              </Button>

              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                onClick={handleNextQuestion}
                disabled={selectedAnswers[currentQuestionIdx] === undefined}
              >
                {currentQuestionIdx === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {isActiveQuiz && isSubmitted && (
        /* Quiz Completed Score & Answer Review Screen */
        <div className="space-y-6">
          <Card className="text-center p-8 sm:p-10 space-y-4 bg-gradient-to-br from-slate-900 to-brand-950 text-white">
            <div className="inline-flex p-4 rounded-3xl bg-brand-500/20 text-brand-300 ring-8 ring-brand-500/10">
              <Award className="w-12 h-12" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold">Quiz Completed!</h2>

            <div className="text-4xl sm:text-5xl font-black text-brand-300">
              {scoreResults.percentage}%
            </div>

            <p className="text-sm text-slate-300">
              You answered <span className="font-bold text-white">{scoreResults.correct}</span> out of{' '}
              <span className="font-bold text-white">{scoreResults.total}</span> questions correctly.
            </p>

            {levelResult && activeLevel && (
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold ${
                  levelResult.passed
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                {levelResult.passed ? (
                  <>
                    <Trophy className="w-4 h-4" />
                    <span>
                      {activeLevel} passed! {LEVEL_ORDER.indexOf(activeLevel) < 2
                        ? `${LEVEL_ORDER[LEVEL_ORDER.indexOf(activeLevel) + 1]} is now unlocked.`
                        : "You've completed all levels for this topic."}
                    </span>
                  </>
                ) : (
                  <span>
                    Not quite — you need {PASS_THRESHOLD_PERCENT}%+ to pass {activeLevel}. Try again with a fresh set of questions.
                  </span>
                )}
              </div>
            )}

            {examResult && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-brand-500/20 text-brand-300">
                <FileText className="w-4 h-4" />
                <span>Exam complete — this attempt is saved to your history, no level was affected.</span>
              </div>
            )}

            <div className="pt-2 flex justify-center gap-4">
              <Button
                variant="glass"
                icon={RotateCcw}
                onClick={() => (activeSessionMode === 'exam' ? handleStartExam() : activeLevel && handleStartLevel(activeLevel))}
              >
                {activeSessionMode === 'exam' ? 'Retake Exam' : 'Retake This Level'}
              </Button>
              <Button variant="primary" onClick={() => setIsActiveQuiz(false)}>
                Back to Topics
              </Button>
            </div>
          </Card>

          {/* Detailed Question Review & Rationales */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Detailed Question Review & NCLEX Rationales
            </h3>

            {questions.map((q, idx) => {
              const userOptIdx = selectedAnswers[idx];
              const userOptText = userOptIdx !== undefined ? q.options[userOptIdx] : null;
              const isCorrect = userOptText === q.correct_answer;

              return (
                <Card key={q.id || idx} className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </h4>
                    <Badge variant={isCorrect ? 'success' : 'danger'}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {q.options.map((optText, optIdx) => {
                      const isChosen = userOptIdx === optIdx;
                      const isTargetCorrect = optText === q.correct_answer;

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between ${
                            isTargetCorrect
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30'
                              : isChosen && !isCorrect
                              ? 'bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold border border-rose-500/30'
                              : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <span>
                            {String.fromCharCode(65 + optIdx)}. {optText}
                          </span>
                          {isTargetCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
                        </div>
                      );
                    })}
                  </div>

                  {q.rationale && (
                    <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-brand-600 dark:text-brand-400 block">
                        NCLEX Clinical Rationale:
                      </span>
                      <p>{q.rationale}</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
