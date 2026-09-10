import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HeartPulse, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('maya.nursing@nursaflow.edu');
  const [password, setPassword] = useState('password123');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    navigate('/dashboard');
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

        <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800 p-6 sm:p-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
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

          {/* Quick Demo Login Preset Banner */}
          <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20 space-y-2 text-xs text-brand-300">
            <div className="flex items-center gap-1.5 font-bold text-white">
              <CheckCircle2 className="w-4 h-4 text-brand-400" />
              <span>Demo Account Credentials</span>
            </div>
            <p className="text-slate-300">
              Preset demo student account loaded for immediate evaluation. Click &quot;Sign In&quot; to launch demo environment.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
