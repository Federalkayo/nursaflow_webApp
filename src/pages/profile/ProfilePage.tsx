import React from 'react';
import { User, Flame, GraduationCap, Award, Clock, BookOpen, Calculator, Bookmark, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { ProgressBar } from '../../components/common/ProgressBar';

import { Button } from '../../components/common/Button';
import { LogOut } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { student, logout } = useAuth();
  const { currentGpa, cgpa, flashcards, notes } = useData();

  const bookmarkedFlashcards = flashcards.filter((f) => f.isBookmarked);
  const bookmarkedNotes = notes.filter((n) => n.isBookmarked);

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-5xl mx-auto">
      {/* Student Profile Overview Card */}
      <Card className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 text-white border-slate-800 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left justify-between">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar src={student?.avatarUrl} name={student?.name || 'Nurse Maya'} size="xl" status="online" />
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {student?.name || 'Nightingale Maya'}
                </h1>
                <Badge variant="brand">{student?.level || '300 Level BSN'}</Badge>
              </div>
              <p className="text-sm text-slate-300 font-medium">
                {student?.school || 'Johns Hopkins School of Nursing'} • {student?.email}
              </p>
              <p className="text-xs text-slate-400">
                Future Registered Nurse (RN) • Specialized in Adult Critical Care & Pharmacology.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            icon={LogOut}
            onClick={logout}
            className="border-white/20 text-white hover:bg-white/10 shrink-0"
          >
            Sign Out
          </Button>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/10 text-center">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current GPA</span>
            <span className="text-2xl font-black text-brand-300">{currentGpa.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CGPA</span>
            <span className="text-2xl font-black text-emerald-300">{cgpa.toFixed(2)}</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Study Streak</span>
            <span className="text-2xl font-black text-amber-400">{student?.studyStreakDays ?? 1} Days</span>
          </div>

          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Hours</span>
            <span className="text-2xl font-black text-purple-300">{student?.studyHoursTotal ?? 0} hrs</span>
          </div>
        </div>
      </Card>

      {/* Achievements Gallery */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-500" />
          <span>Unlocked Achievements ({student?.achievements.length || 4})</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {student?.achievements.map((ach) => (
            <Card key={ach.id} className="space-y-2 p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {ach.title}
                  </h4>
                  <span className="text-[10px] text-slate-400">Unlocked: {ach.unlockedAt}</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {ach.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bookmarked Resources */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-brand-500" />
          <span>Saved & Bookmarked Resources</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bookmarked Flashcards ({bookmarkedFlashcards.length})
            </h3>
            {bookmarkedFlashcards.map((f) => (
              <div key={f.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {f.question}
              </div>
            ))}
          </Card>

          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Bookmarked Notes ({bookmarkedNotes.length})
            </h3>
            {bookmarkedNotes.map((n) => (
              <div key={n.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {n.title}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
};
