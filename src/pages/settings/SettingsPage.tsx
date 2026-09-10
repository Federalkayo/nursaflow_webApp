import React, { useState } from 'react';
import { Settings, Sun, Moon, Bell, Shield, User, Code, CheckSquare, Square, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { student, updateProfile } = useAuth();

  const [name, setName] = useState(student?.name || '');
  const [school, setSchool] = useState(student?.school || '');
  const [level, setLevel] = useState(student?.level || '');
  const [targetCgpa, setTargetCgpa] = useState(student?.targetCgpa || 4.50);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      school,
      level,
      targetCgpa: Number(targetCgpa),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const integrationChecklist = [
    { title: 'Firebase Authentication (Email & Password / Google Auth)', file: 'src/services/firebase/authService.ts' },
    { title: 'Cloud Firestore Database (Semesters, Notes, Posts, Quizzes)', file: 'src/services/firebase/firestoreService.ts' },
    { title: 'Firebase Storage (Profile Photos & PDF Notes Attachments)', file: 'src/services/firebase/storageService.ts' },
    { title: 'Firebase Cloud Messaging (FCM Push Notifications)', file: 'src/services/firebase/notificationService.ts' },
    { title: 'Gemini AI API (@google/genai SDK for AI Tutor)', file: 'src/services/gemini/geminiService.ts' },
    { title: 'ZEGOCLOUD WebRTC Video/Audio Call Integration', file: 'src/services/zegocloud/callService.ts' },
    { title: 'ZEGOCLOUD Live Group Study Rooms', file: 'src/services/zegocloud/roomService.ts' },
    { title: 'Production Security Rules & Environment Variables', file: 'firestore.rules' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>App Preferences & Developer Settings</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your student profile, theme appearance, notifications & backend integration status.
        </p>
      </div>

      {/* Theme Appearance Card */}
      <Card className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          {theme === 'dark' ? <Moon className="w-5 h-5 text-amber-400" /> : <Sun className="w-5 h-5 text-slate-600" />}
          <span>Appearance & Theme</span>
        </h3>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Dark Mode Theme
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Currently active: <strong className="capitalize">{theme} mode</strong>
            </p>
          </div>

          <Button variant="outline" onClick={toggleTheme}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
      </Card>

      {/* Edit Student Profile Card */}
      <Card className="space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User className="w-5 h-5 text-brand-500" />
          <span>Student Profile Settings</span>
        </h3>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input label="Nursing School / University" value={school} onChange={(e) => setSchool(e.target.value)} required />
            <Input label="Academic Level" value={level} onChange={(e) => setLevel(e.target.value)} required />
            <Input
              label="Target CGPA Goal"
              type="number"
              step="0.01"
              max="5.0"
              value={targetCgpa}
              onChange={(e) => setTargetCgpa(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-bold text-emerald-500">
                ✓ Settings saved successfully!
              </span>
            ) : <span />}

            <Button type="submit" variant="primary">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Rule 11 Developer Integration Checklist */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-brand-500" />
            <span>NursaFlow Backend Integration Checklist</span>
          </h3>
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">
            0 / {integrationChecklist.length} Connected (Placeholders Ready)
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          This checklist tracks backend services configured for future integration (Firebase, Gemini AI, ZEGOCLOUD).
        </p>

        <div className="space-y-2">
          {integrationChecklist.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <Square className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.title}</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">{item.file}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
