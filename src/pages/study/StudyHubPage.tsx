import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BookOpen,
  Layers,
  Zap,
  Calendar,
  FileText,
  Bookmark,
  ArrowRight,
  Brain,
  Sparkles
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { useData } from '../../context/DataContext';

export const StudyHubPage: React.FC = () => {
  const { flashcards, quizzes, notes, studyPlans } = useData();

  const studyModules = [
    {
      title: 'Nursing Subjects',
      desc: 'Browse Anatomy, Pharmacology, Med-Surg, Fundamentals & core curricula.',
      path: '/study/subjects',
      icon: BookOpen,
      count: '10 Core Subjects',
      color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-900',
    },
    {
      title: '3D Flashcards',
      desc: 'Interactive flip card deck for active recall & spaced repetition.',
      path: '/study/flashcards',
      icon: Layers,
      count: `${flashcards.length} Cards Available`,
      color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900',
    },
    {
      title: 'NCLEX Practice Quizzes',
      desc: 'Timed multiple-choice drills with immediate rationales & scoring.',
      path: '/study/quizzes',
      icon: Zap,
      count: `${quizzes.length} Practice Quizzes`,
      color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900',
    },
    {
      title: 'Interactive Study Plans',
      desc: 'Weekly structured study agendas, task completion tracking & schedules.',
      path: '/study/plans',
      icon: Calendar,
      count: `${studyPlans.length} Active Plans`,
      color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900',
    },
    {
      title: 'Personal Nursing Notes',
      desc: 'Rich clinical notes, mnemonics, ABG guides & bookmark repository.',
      path: '/study/notes',
      icon: FileText,
      count: `${notes.length} Notes Saved`,
      color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Brain className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>Nursing Study System</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Comprehensive active-recall study suite engineered for nursing exams & NCLEX-RN prep.
        </p>
      </div>

      {/* Grid of Main Study Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {studyModules.map((mod) => {
          const Icon = mod.icon;
          return (
            <NavLink key={mod.path} to={mod.path}>
              <Card hoverable className="h-full flex flex-col justify-between space-y-4 group">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-2xl border ${mod.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {mod.count}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {mod.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {mod.desc}
                  </p>
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 group-hover:translate-x-1 transition-transform">
                  <span>Open {mod.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Card>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
