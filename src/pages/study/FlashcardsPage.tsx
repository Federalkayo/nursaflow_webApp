import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  Sparkles,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Select } from '../../components/common/Select';

import { useAuth } from '../../context/AuthContext';

export const FlashcardsPage: React.FC = () => {
  const { flashcards, subjects, toggleFlashcardKnown, toggleFlashcardBookmark } = useData();
  const { addStudyTime, recordStudyActivity } = useAuth();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const filteredCards = flashcards.filter(
    (card) => selectedSubjectId === 'all' || card.subjectId === selectedSubjectId
  );

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
    addStudyTime(2, false); // 2 minutes study time credit
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
    addStudyTime(2, false);
  };

  const subjectOptions = [
    { value: 'all', label: 'All Nursing Subjects' },
    ...subjects.map((s) => ({ value: s.id, label: s.title })),
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Layers className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <span>Interactive Nursing Flashcards</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Active recall practice for NCLEX concepts, drug mechanisms & clinical rules.
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedSubjectId}
            onChange={(e) => {
              setSelectedSubjectId(e.target.value);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            options={subjectOptions}
          />
        </div>
      </div>

      {filteredCards.length > 0 && currentCard ? (
        <div className="space-y-6">
          {/* Card Deck Controls & Progress Indicator */}
          <div className="flex items-center justify-between text-sm font-semibold">
            <div className="flex items-center gap-2">
              <Badge variant="brand">{currentCard.category}</Badge>
              {currentCard.isKnown && <Badge variant="success">Mastered</Badge>}
            </div>

            <span className="text-slate-500 dark:text-slate-400">
              Card {currentIndex + 1} of {filteredCards.length}
            </span>
          </div>

          <ProgressBar value={currentIndex + 1} max={filteredCards.length} color="brand" size="sm" />

          {/* Interactive 3D Flip Card Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer perspective-1000 group min-h-[320px] sm:min-h-[360px] relative"
          >
            <div
              className={`w-full h-full min-h-[320px] sm:min-h-[360px] rounded-3xl p-6 sm:p-10 border transition-all duration-500 transform-style-3d flex flex-col justify-between shadow-xl ${
                isFlipped
                  ? 'bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 border-brand-500/50 text-white shadow-glow'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white'
              }`}
            >
              {/* Card Top Actions */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-500" />
                  <span>{isFlipped ? 'Answer & Rationale' : 'Question (Click card to flip)'}</span>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFlashcardBookmark(currentCard.id);
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    currentCard.isBookmarked
                      ? 'text-amber-500 bg-amber-500/10'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
                  title="Bookmark Card"
                >
                  <Bookmark className="w-5 h-5 fill-current" />
                </button>
              </div>

              {/* Card Center Content */}
              <div className="py-6 space-y-4 my-auto">
                {!isFlipped ? (
                  <h3 className="text-xl sm:text-2xl font-extrabold leading-snug tracking-tight">
                    {currentCard.question}
                  </h3>
                ) : (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className="text-lg sm:text-xl font-bold leading-relaxed whitespace-pre-line text-emerald-300">
                      {currentCard.answer}
                    </div>
                    {currentCard.explanation && (
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 leading-relaxed">
                        <span className="font-bold text-brand-300 block mb-1">Clinical Rationale:</span>
                        {currentCard.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Card Bottom Hint */}
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <span className="flex items-center gap-1">
                  <RotateCw className="w-4 h-4 text-brand-500 animate-spin-slow" />
                  Tap card to flip answer
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFlashcardKnown(currentCard.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    currentCard.isKnown
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-500'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{currentCard.isKnown ? 'Marked as Known' : 'Mark as Known'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Control Buttons */}
          <div className="flex items-center justify-between pt-2">
            <Button variant="outline" icon={ChevronLeft} onClick={handlePrev}>
              Previous
            </Button>

            <Button
              variant="secondary"
              icon={RotateCw}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              Flip Card
            </Button>

            <Button variant="primary" icon={ChevronRight} iconPosition="right" onClick={handleNext}>
              Next Card
            </Button>
          </div>
        </div>
      ) : (
        <Card className="text-center p-8">
          <p className="text-sm text-slate-500">No flashcards found for selected subject.</p>
        </Card>
      )}
    </div>
  );
};
