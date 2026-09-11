import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartPulse, Mail, Lock, User, School, GraduationCap, ArrowRight, CheckCircle2, AlertCircle, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpSchool, setSignUpSchool] = useState('');
  const [signUpLevel, setSignUpLevel] = useState('300 Level (BSN)');

  // Status & Error States
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState<boolean>(false);

  const formatAuthError = (err: unknown, defaultMsg: string): string => {
    if (err instanceof Error) {
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        return 'Unable to connect to Supabase backend. Please check your internet connection or verify that VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured in your .env file.';
      }
      return err.message;
    }
    return defaultMsg;
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailConfirmationSent(false);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      console.error('[Sign In Error]:', err);
      setErrorMsg(formatAuthError(err, 'Authentication failed. Please check your credentials.'));
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setEmailConfirmationSent(false);

    if (!signUpName || !signUpEmail || !signUpPassword) {
      setErrorMsg('Please fill in all required registration fields.');
      return;
    }

    try {
      const result = await register(
        signUpName,
        signUpEmail,
        signUpSchool || 'NursaFlow Nursing Academy',
        signUpLevel || '300 Level (BSN)',
        signUpPassword
      );

      if (result.session) {
        // Immediate login succeeded (email confirmation disabled or auto-confirmed)
        navigate('/dashboard');
      } else {
        // Email confirmation is required by Supabase project settings
        setEmailConfirmationSent(true);
      }
    } catch (err: unknown) {
      console.error('[Sign Up Error]:', err);
      setErrorMsg(formatAuthError(err, 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-brand-950 text-white flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-brand-500/20 text-teal-300 ring-8 ring-brand-500/10 mb-2">
            <HeartPulse className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome to Nursa<span className="text-brand-400">Flow</span>
          </h1>
          <p className="text-sm text-slate-400">
            Sign in to track academics, study flashcards & practice clinical tools.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setEmailConfirmationSent(false);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-colors text-center ${
              mode === 'signin'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setEmailConfirmationSent(false);
            }}
            className={`flex-1 py-2.5 rounded-xl transition-colors text-center ${
              mode === 'signup'
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800 p-6 sm:p-8 space-y-6">
          {/* Error Message Alert */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/80 text-rose-100 text-xs flex items-start gap-3 shadow-md">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-extrabold text-rose-300 text-sm">Authentication Notice</p>
                <p className="mt-1 text-slate-200 leading-relaxed font-medium">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Email Confirmation Required Banner */}
          {emailConfirmationSent && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-emerald-200 text-sm">
                <Send className="w-4 h-4 text-emerald-400" />
                <span>Verification Email Sent!</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                We sent a confirmation link to <strong className="text-white">{signUpEmail}</strong>. Please check your inbox and click the verification link before logging in.
              </p>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' ? (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nursing.student@university.edu"
                required
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In to NursaFlow
              </Button>
            </form>
          ) : (
            /* SIGN UP FORM */
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                icon={User}
                value={signUpName}
                onChange={(e) => setSignUpName(e.target.value)}
                placeholder="Maya Lin"
                required
              />

              <Input
                label="Email Address"
                type="email"
                icon={Mail}
                value={signUpEmail}
                onChange={(e) => setSignUpEmail(e.target.value)}
                placeholder="maya@nursaflow.edu"
                required
              />

              <Input
                label="Password"
                type="password"
                icon={Lock}
                value={signUpPassword}
                onChange={(e) => setSignUpPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="School / University"
                  type="text"
                  icon={School}
                  value={signUpSchool}
                  onChange={(e) => setSignUpSchool(e.target.value)}
                  placeholder="Lagos State University"
                />

                <Input
                  label="Academic Level"
                  type="text"
                  icon={GraduationCap}
                  value={signUpLevel}
                  onChange={(e) => setSignUpLevel(e.target.value)}
                  placeholder="300 Level (BSN)"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                isLoading={isLoading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Create NursaFlow Account
              </Button>
            </form>
          )}


        </Card>
      </div>
    </div>
  );
};
