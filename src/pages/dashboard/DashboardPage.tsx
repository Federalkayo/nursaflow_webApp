import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Flame,
  Clock,
  GraduationCap,
  Award,
  Stethoscope,
  Pill,
  Activity,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  Calculator,
  Brain,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { StatCard } from '../../components/feedback/StatCard';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Badge } from '../../components/common/Badge';

export const DashboardPage: React.FC = () => {
  const { student } = useAuth();
  const { currentGpa, cgpa, semesters, subjects } = useData();

  const upcomingExams = [
    { id: 'ex_1', title: 'Pharmacology II Midterm Exam', date: 'Tomorrow, 9:00 AM', location: 'Hall B - Health Sciences', type: 'Exam' },
    { id: 'ex_2', title: 'Maternal & Child Clinical Care Plan', date: 'Sep 14, 11:59 PM', location: 'Online Portal', type: 'Assignment' },
    { id: 'ex_3', title: 'Medical-Surgical OSCE Practical', date: 'Sep 18, 2:00 PM', location: 'Simulation Lab 4', type: 'Clinical' },
  ];

  const quickTools = [
    { title: 'Dosage Calculator', path: '/clinical/dosage', icon: Pill, color: 'text-teal-500 bg-teal-500/10' },
    { title: 'IV Flow Rate', path: '/clinical/iv-flow', icon: Activity, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Glasgow Coma Scale', path: '/clinical/gcs', icon: Brain, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'APGAR Calculator', path: '/clinical/apgar', icon: Sparkles, color: 'text-purple-500 bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Student Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 border border-slate-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">
                {student?.level || '300 Level Nursing'}
              </Badge>
              <span className="text-xs font-semibold text-slate-400">
                {student?.school || 'Johns Hopkins School of Nursing'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Good day, <span className="bg-gradient-to-r from-brand-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">{student?.name || 'Nightingale Maya'}</span> 👋
            </h1>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              You are on a <span className="font-bold text-amber-400">{student?.studyStreakDays || 12}-day study streak</span>! Keep pushing towards your target CGPA of {student?.targetCgpa || 4.50}.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <NavLink to="/study/quizzes">
              <Button variant="primary" icon={Zap}>
                Start Daily Quiz
              </Button>
            </NavLink>
            <NavLink to="/ai-tutor">
              <Button variant="glass" icon={Brain}>
                Ask AI Tutor
              </Button>
            </NavLink>
          </div>
        </div>

        {/* Ambient Glowing Orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Primary Academic & Study Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Current GPA"
          value={currentGpa.toFixed(2)}
          subtitle="300 Level - 1st Semester"
          icon={GraduationCap}
          trend={{ value: '0.14', isPositive: true }}
          color="brand"
        />
        <StatCard
          title="Cumulative CGPA"
          value={cgpa.toFixed(2)}
          subtitle="78 Credits Completed"
          icon={Award}
          trend={{ value: '0.08', isPositive: true }}
          color="emerald"
        />
        <StatCard
          title="Study Streak"
          value={`${student?.studyStreakDays || 12} Days`}
          subtitle="Personal Best Streak!"
          icon={Flame}
          color="amber"
        />
        <StatCard
          title="Study Hours"
          value={`${student?.studyHoursTotal || 128.5} hrs`}
          subtitle="18.5 hrs this week"
          icon={Clock}
          color="indigo"
        />
      </div>

      {/* Academic Progress & Target Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Academic Progress & Target CGPA
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracking completed credit units towards Nursing Degree requirements
              </p>
            </div>

            <NavLink to="/academic" className="text-xs font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline">
              <span>View Semesters</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Degree Credits Completion</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold">
                  {student?.completedCredits || 78} / {student?.totalRequiredCredits || 120} Credits
                </span>
              </div>
              <ProgressBar value={student?.completedCredits || 78} max={student?.totalRequiredCredits || 120} showPercentage color="brand" size="lg" />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="text-slate-700 dark:text-slate-300">Target CGPA Goal Progress</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  Current: {cgpa.toFixed(2)} | Target: {student?.targetCgpa || 4.50}
                </span>
              </div>
              <ProgressBar value={(cgpa / (student?.targetCgpa || 4.50)) * 100} showPercentage color="emerald" size="lg" />
            </div>
          </div>
        </Card>

        {/* Quick Launch Clinical Tools */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-brand-500" />
              <span>Clinical Suite</span>
            </h3>
            <NavLink to="/clinical" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              All Tools
            </NavLink>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <NavLink
                  key={tool.path}
                  to={tool.path}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex flex-col items-center text-center space-y-2 group"
                >
                  <div className={`p-2.5 rounded-xl ${tool.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {tool.title}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Upcoming Exams & Recommended Topics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams & Deadlines */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>Upcoming Exams & Deadlines</span>
            </h3>
            <Badge variant="warning">{upcomingExams.length} Pending</Badge>
          </div>

          <div className="space-y-3">
            {upcomingExams.map((exam) => (
              <div
                key={exam.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-4"
              >
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {exam.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {exam.date} • {exam.location}
                  </p>
                </div>
                <Badge variant={exam.type === 'Exam' ? 'danger' : 'info'}>
                  {exam.type}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Nursing Subjects */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-brand-500" />
              <span>Recommended Study Topics</span>
            </h3>
            <NavLink to="/study/subjects" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
              Explore All
            </NavLink>
          </div>

          <div className="space-y-3">
            {subjects.slice(0, 3).map((subj) => (
              <NavLink
                key={subj.id}
                to="/study/flashcards"
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${subj.color}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {subj.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {subj.flashcardsCount} Flashcards • {subj.quizzesCount} Quizzes
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </NavLink>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
