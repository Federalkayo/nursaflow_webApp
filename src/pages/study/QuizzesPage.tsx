import React, { useState, useEffect } from 'react';
import {
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  RotateCcw,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Quiz, QuizQuestion } from '../../types';

export const QuizzesPage: React.FC = () => {
  const { quizzes } = useData();

  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(600);

  // Timer Effect
  useEffect(() => {
    let timer: any;
    if (activeQuiz && !isSubmitted && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => {
          if (prev <= 1) {
            setIsSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeQuiz, isSubmitted, timeLeftSeconds]);

  const handleStartQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setIsSubmitted(false);
    setTimeLeftSeconds(quiz.durationMinutes * 60);
  };

  const handleSelectOption = (optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: optionIdx,
    });
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
    } else {
      setIsSubmitted(true);
    }
  };

  // Calculate Score Results
  const calculateScore = () => {
    if (!activeQuiz) return { correct: 0, total: 0, percentage: 0 };
    let correctCount = 0;
    activeQuiz.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount += 1;
      }
    });
    const percentage = Math.round((correctCount / activeQuiz.questions.length) * 100);
    return { correct: correctCount, total: activeQuiz.questions.length, percentage };
  };

  const scoreResults = calculateScore();
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder < 10 ? '0' : ''}${remainder}`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Zap className="w-8 h-8 text-amber-500" />
          <span>NCLEX Practice Quizzes</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Simulated NCLEX-RN multiple-choice drills with instant scoring & clinical rationales.
        </p>
      </div>

      {!activeQuiz ? (
        /* Quiz Selection Dashboard */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} hoverable className="space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="brand">{quiz.subjectTitle}</Badge>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {quiz.durationMinutes} Mins
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {quiz.title}
                </h3>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {quiz.questions.length} NCLEX-style questions with comprehensive rationales.
                </p>
              </div>

              <Button
                variant="primary"
                icon={Zap}
                onClick={() => handleStartQuiz(quiz)}
                className="w-full"
              >
                Start Quiz Now
              </Button>
            </Card>
          ))}
        </div>
      ) : !isSubmitted ? (
        /* Active Quiz Question Interface */
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <Badge variant="brand">{activeQuiz.subjectTitle}</Badge>
            <div className="flex items-center gap-2 font-mono font-bold text-sm bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
              <Clock className="w-4 h-4 text-amber-500" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>
          </div>

          <ProgressBar
            value={currentQuestionIdx + 1}
            max={activeQuiz.questions.length}
            label={`Question ${currentQuestionIdx + 1} of ${activeQuiz.questions.length}`}
            showPercentage
            color="brand"
          />

          <Card className="p-6 sm:p-8 space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
              {activeQuiz.questions[currentQuestionIdx].question}
            </h2>

            {/* Multiple Choice Options */}
            <div className="space-y-3">
              {activeQuiz.questions[currentQuestionIdx].options.map((opt, optIdx) => {
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
                      <span>{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                onClick={() => setActiveQuiz(null)}
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
                {currentQuestionIdx === activeQuiz.questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
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
              <Button variant="glass" icon={RotateCcw} onClick={() => handleStartQuiz(activeQuiz)}>
                Retake Quiz
              </Button>
              <Button variant="primary" onClick={() => setActiveQuiz(null)}>
                Back to Quizzes
              </Button>
            </div>
          </Card>

          {/* Detailed Question Review & Rationales */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Detailed Question Review & Clinical Rationales
            </h3>

            {activeQuiz.questions.map((q, idx) => {
              const userAns = selectedAnswers[idx];
              const isCorrect = userAns === q.correctAnswerIndex;

              return (
                <Card key={q.id} className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {q.question}
                    </h4>
                    <Badge variant={isCorrect ? 'success' : 'danger'}>
                      {isCorrect ? 'Correct' : 'Incorrect'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = userAns === optIdx;
                      const isTargetCorrect = q.correctAnswerIndex === optIdx;

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
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </span>
                          {isTargetCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          {isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-500" />}
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    <span className="font-bold text-brand-600 dark:text-brand-400 block">
                      NCLEX Clinical Rationale:
                    </span>
                    <p>{q.explanation}</p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
