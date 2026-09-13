import React, { useState, useEffect } from 'react';
import { Settings, Sun, Moon, User, Code, Square, CreditCard, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { paystackService } from '../../services/paystack/paystackService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { student, updateProfile } = useAuth();
  const { isPro, subscription, isLoading: isSubLoading } = useSubscriptionStatus();

  const [name, setName] = useState(student?.name || '');
  const [school, setSchool] = useState(student?.school || '');
  const [level, setLevel] = useState(student?.level || '');
  const [targetCgpa, setTargetCgpa] = useState(student?.targetCgpa || 4.50);

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setSchool(student.school || '');
      setLevel(student.level || '');
      setTargetCgpa(student.targetCgpa || 4.50);
    }
  }, [student]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [checkoutLoadingPlan, setCheckoutLoadingPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

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

  const handleSubscribe = async (amountKobo: number, planCode: string) => {
    setCheckoutError(null);
    const userEmail = student?.email;

    if (!userEmail) {
      setCheckoutError('User email address is missing. Please update your profile first.');
      return;
    }

    setCheckoutLoadingPlan(planCode);
    try {
      const response = await paystackService.initializeTransaction(userEmail, amountKobo, planCode);
      if (response && response.authorization_url) {
        window.location.href = response.authorization_url;
      } else {
        throw new Error('No authorization URL returned from Paystack.');
      }
    } catch (err: unknown) {
      console.error('[Checkout Error]:', err);
      const msg = err instanceof Error ? err.message : 'Failed to initialize Paystack checkout.';
      setCheckoutError(msg);
    } finally {
      setCheckoutLoadingPlan(null);
    }
  };

  const integrationChecklist = [
    { title: 'Supabase Authentication (Email & Password / OAuth)', file: 'src/services/supabase/authService.ts' },
    { title: 'Supabase Database & Realtime (Profiles, Quizzes, Streaks)', file: 'src/services/supabase/dbService.ts' },
    { title: 'Supabase Storage (Profile Avatars & PDF Attachments)', file: 'src/services/supabase/storageService.ts' },
    { title: 'Paystack Subscription Service (Edge Functions)', file: 'src/services/paystack/paystackService.ts' },
    { title: 'Gemini AI API (@google/genai SDK for AI Tutor)', file: 'src/services/gemini/geminiService.ts' },
    { title: 'ZEGOCLOUD WebRTC Video/Audio Call Integration', file: 'src/services/zegocloud/callService.ts' },
    { title: 'ZEGOCLOUD Live Group Study Rooms', file: 'src/services/zegocloud/roomService.ts' },
    { title: 'Database Schema & RLS Security Policies', file: 'supabase/schema.sql' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="w-8 h-8 text-brand-600 dark:text-brand-400" />
          <span>App Preferences & Developer Settings</span>
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Manage your student profile, theme appearance, membership subscription & backend integration status.
        </p>
      </div>

      {/* Paystack Membership & Subscription Card */}
      <Card className="space-y-6 border-brand-500/30 dark:border-brand-900/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-500" />
            <span>NursaFlow Membership & Subscription</span>
          </h3>

          {isSubLoading ? (
            <span className="text-xs font-semibold text-slate-400">Checking status...</span>
          ) : isPro ? (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Pro Active</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              Free Tier Student
            </span>
          )}
        </div>

        {checkoutError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{checkoutError}</span>
          </div>
        )}

        {isPro && subscription ? (
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Active Plan: {subscription.plan}</span>
              <span className="text-slate-500 dark:text-slate-400">Ref: {subscription.paystack_reference || 'N/A'}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Your subscription is active until{' '}
              <strong>
                {subscription.current_period_end
                  ? new Date(subscription.current_period_end).toLocaleDateString()
                  : 'N/A'}
              </strong>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Monthly Plan */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pro Monthly</h4>
                  <Sparkles className="w-4 h-4 text-brand-500" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                  ₦5,000 <span className="text-xs font-normal text-slate-400">/ month</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Full access to unlimited AI Tutor questions, NCLEX prep tools, and live video study rooms.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full mt-2"
                isLoading={checkoutLoadingPlan === 'PLN_nursaflow_monthly'}
                onClick={() => handleSubscribe(500000, 'PLN_nursaflow_monthly')}
              >
                Subscribe Monthly (₦5,000)
              </Button>
            </div>

            {/* Annual Plan */}
            <div className="p-4 rounded-2xl bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/30 space-y-3 flex flex-col justify-between relative overflow-hidden">
              <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500 text-white uppercase tracking-wider">
                Save 17%
              </span>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Pro Annual</h4>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
                  ₦50,000 <span className="text-xs font-normal text-slate-400">/ year</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Best value! Includes full NursaFlow Pro features + priority AI tutor response.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                className="w-full mt-2 bg-gradient-to-r from-brand-600 to-teal-500"
                isLoading={checkoutLoadingPlan === 'PLN_nursaflow_annual'}
                onClick={() => handleSubscribe(5000000, 'PLN_nursaflow_annual')}
              >
                Subscribe Annual (₦50,000)
              </Button>
            </div>
          </div>
        )}
      </Card>

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
