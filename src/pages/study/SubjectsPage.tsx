import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, Layers, Zap } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { SearchBar } from '../../components/common/SearchBar';
import { Badge } from '../../components/common/Badge';

export const SubjectsPage: React.FC = () => {
  const { subjects } = useData();
  const [search, setSearch] = useState('');

  const filteredSubjects = subjects.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.topics.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-brand-600 dark:text-brand-400" />
            <span>Nursing Subjects Directory</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Explore 10 core clinical nursing disciplines, flashcard decks, and practice quizzes.
          </p>
        </div>

        <div className="w-full md:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Filter subjects or topics..." />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subj) => (
          <Card key={subj.id} hoverable className="space-y-4 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl border ${subj.color} group-hover:scale-110 transition-transform`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <Badge variant="brand">{subj.code}</Badge>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                {subj.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {subj.description}
              </p>

              {/* Topics Pills */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {subj.topics.slice(0, 3).map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">
                {subj.flashcardsCount} Cards • {subj.quizzesCount} Quizzes
              </span>

              <NavLink
                to="/study/flashcards"
                className="text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline group-hover:translate-x-1 transition-transform"
              >
                <span>Study Cards</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </NavLink>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
