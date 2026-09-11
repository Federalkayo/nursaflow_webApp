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
  Gauge
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { dbService, TopicData, QuizQuestionData } from '../../services/supabase/dbService';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';

export const QuizzesPage: React.FC = () => {
  const { student, updateProfile } = useAuth();

  const [topics, setTopics] = useState<TopicData[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [allQuestions, setAllQuestions] = useState<QuizQuestionData[]>([]);
  const [questions, setQuestions] = useState<QuizQuestionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Active Quiz State
  const [isActiveQuiz, setIsActiveQuiz] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(600);

  // User Attempts Stats
  const [quizStats, setQuizStats] = useState<{ totalAttempts: number; correctAttempts: number; accuracyPercentage: number }>({
    totalAttempts: 0,
    correctAttempts: 0,
    accuracyPercentage: 0,
  });

  // Load Topics, All Questions, and User Stats in parallel on mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const [fetchedTopics, fetchedAllQuestions, stats] = await Promise.all([
          dbService.getTopics(),
          dbService.getQuizQuestions(),
          student?.id ? dbService.getUserQuizStats(student.id) : Promise.resolve(null),
        ]);

        setTopics(fetchedTopics);
        setAllQuestions(fetchedAllQuestions);
        setQuestions(fetchedAllQuestions);
        if (stats) setQuizStats(stats);
      } catch (err) {
        console.error('[QuizzesPage Error] Failed to load quiz data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [student?.id]);

  // Fast Questions Filtering by Topic and Difficulty
  const filterQuestions = (topicId: string, difficulty: string) => {
    let filtered = allQuestions;

    if (topicId !== 'all') {
      filtered = filtered.filter((q) => q.topic_id === topicId);
    }
    if (difficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === difficulty);
    }

    setQuestions(filtered);
  };

  const handleSelectTopic = (topicId: string) => {
    setSelectedTopicId(topicId);
    filterQuestions(topicId, selectedDifficulty);
  };

  const handleSelectDifficulty = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    filterQuestions(selectedTopicId, difficulty);
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

  const handleStartQuiz = () => {
    if (questions.length === 0) return;
    setIsActiveQuiz(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setTimeLeftSeconds(questions.length * 90); // 90 seconds per question
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

    if (student?.id) {
      try {
        // Update Study Streak for today's activity
        const updatedStreak = await dbService.updateStudyStreakOnActivity(student.id);
        updateProfile({ studyStreakDays: updatedStreak });

        // Refresh stats
        const freshStats = await dbService.getUserQuizStats(student.id);
        setQuizStats(freshStats);
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

      {!isActiveQuiz ? (
        /* Quiz Topic Selector & Dashboard */
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
              <button
                onClick={() => handleSelectTopic('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedTopicId === 'all'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All Topics ({allQuestions.length})
              </button>

              {topics.map((t) => {
                const topicCount = allQuestions.filter((q) => q.topic_id === t.id).length;
                return (
                  <button
                    key={t.id}
                    onClick={() => handleSelectTopic(t.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                      selectedTopicId === t.id
                        ? 'bg-brand-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {t.name} ({topicCount})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Difficulty Filter Pills */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Gauge className="w-3.5 h-3.5 text-amber-500" />
              <span>Select Difficulty Level:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'All Difficulties' },
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard' },
              ].map((diff) => (
                <button
                  key={diff.id}
                  onClick={() => handleSelectDifficulty(diff.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer whitespace-nowrap capitalize ${
                    selectedDifficulty === diff.id
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Active Quiz Preset Overview Card */}
          <Card className="p-6 sm:p-8 space-y-6 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 text-white border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="brand">
                    {selectedTopicId === 'all'
                      ? 'NCLEX Comprehensive Drill'
                      : topics.find((t) => t.id === selectedTopicId)?.name || 'Nursing Drill'}
                  </Badge>
                  {selectedDifficulty !== 'all' && (
                    <Badge variant="warning" className="capitalize">
                      {selectedDifficulty} Difficulty
                    </Badge>
                  )}
                </div>

                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  NCLEX-RN Practice Quiz Session
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  {questions.length} NCLEX-style questions with instant attempt logging, clinical rationales, and streak tracking.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono font-bold text-sm bg-white/10 px-3.5 py-2 rounded-xl border border-white/10 shrink-0">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>{questions.length * 1.5} Mins</span>
              </div>
            </div>

            {isLoading ? (
              <div className="py-8 flex items-center justify-center gap-3 text-slate-400 text-xs font-semibold">
                <Loader2 className="w-5 h-5 animate-spin text-brand-500" />
                <span>Loading quiz questions...</span>
              </div>
            ) : questions.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/60 text-slate-300 text-xs text-center">
                No quiz questions found matching the selected topic and difficulty filter.
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                icon={Zap}
                onClick={handleStartQuiz}
                className="w-full sm:w-auto"
              >
                Start Quiz Session ({questions.length} Questions)
              </Button>
            )}
          </Card>
        </div>
      ) : !isSubmitted ? (
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

            <div className="flex items-center gap-2 font-mono font-bold text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl text-slate-900 dark:text-white">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{formatTime(timeLeftSeconds)}</span>
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
      ) : (
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

            <div className="pt-2 flex justify-center gap-4">
              <Button variant="glass" icon={RotateCcw} onClick={handleStartQuiz}>
                Retake Quiz
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
