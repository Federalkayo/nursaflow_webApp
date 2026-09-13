import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Code, Video, Bot, Database, CheckCircle, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { groqService } from '../../services/groq/groqService';

interface IntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: 'zegocloud' | 'gemini' | 'supabase';
  featureTitle: string;
}

export const IntegrationModal: React.FC<IntegrationModalProps> = ({
  isOpen,
  onClose,
  serviceType,
  featureTitle,
}) => {
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string; model?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    if (isOpen && serviceType === 'gemini') {
      setTestResult(null);
    }
  }, [isOpen, serviceType]);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await groqService.testApiKey();
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Error testing server connection.' });
    } finally {
      setIsTesting(false);
    }
  };

  const serviceDetails = {
    zegocloud: {
      icon: Video,
      color: 'text-purple-500 bg-purple-500/10 border-purple-200 dark:border-purple-900',
      title: 'ZEGOCLOUD Real-Time Video/Audio Integration',
      filePath: 'src/services/zegocloud/roomService.ts & callService.ts',
      description: `The UI for "${featureTitle}" is fully responsive and ready. Real-time WebRTC audio/video call streams and live study rooms will connect when you add your ZEGOCLOUD credentials.`,
      todoList: [
        'Obtain App ID & Server Secret from ZEGOCLOUD Admin Console',
        'Install ZEGOCLOUD UIKit package: npm install @zegocloud/zego-uikit-prebuilt',
        'Implement token generation in src/services/zegocloud/roomService.ts',
        'Mount live WebRTC video room container DOM node',
      ],
    },
    gemini: {
      icon: Bot,
      color: 'text-teal-500 bg-teal-500/10 border-teal-200 dark:border-teal-900',
      title: 'Groq AI Tutor Server-Side Architecture',
      filePath: 'supabase/functions/groq-tutor/index.ts & src/services/groq/groqService.ts',
      description: `NursaFlow AI Nursing Tutor operates on a secure zero-client-key architecture. All AI prompts are processed server-side via Supabase Edge Function (groq-tutor) using Groq AI (${groqService.getModel()}). Zero API keys are shipped to client browser bundles.`,
      todoList: [
        'Set server-side secret using Supabase CLI: supabase secrets set GROQ_API_KEY=gsk_...',
        'Model selection configured via VITE_GROQ_MODEL (default: llama-3.3-70b-versatile)',
        'Requests proxied server-side via supabase.functions.invoke("groq-tutor")',
        'Full OWASP security compliance: Zero client-side API key leakage',
      ],
    },
    supabase: {
      icon: Database,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-200 dark:border-emerald-900',
      title: 'Supabase Backend & Paystack Integration',
      filePath: 'src/services/supabase/dbService.ts & paystackService.ts',
      description: `Backend services are powered by Supabase with Row Level Security (RLS) policies and Paystack edge function integrations.`,
      todoList: [
        'Initialize Supabase Project & copy VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY credentials',
        'Run database schema migration using supabase/schema.sql',
        'Deploy Paystack Edge Functions using: supabase functions deploy',
        'Set PAYSTACK_SECRET_KEY secret in Supabase Dashboard',
      ],
    },
  };

  const current = serviceDetails[serviceType];
  const Icon = current.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl border ${current.color}`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {current.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {current.filePath}
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {current.description}
        </p>

        {/* Server Connection Test Panel for AI Tutor */}
        {serviceType === 'gemini' && (
          <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                <span>Server Edge Function Health Check</span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle className="w-3 h-3" />
                Zero Client Key Architecture
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              API keys live exclusively in Supabase Secrets (<code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-900 dark:text-slate-200">GROQ_API_KEY</code>). Click below to ping the <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded text-slate-900 dark:text-slate-200">groq-tutor</code> Edge Function.
            </p>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                icon={RefreshCw}
                isLoading={isTesting}
                onClick={handleTestConnection}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Test Server Connection
              </Button>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl border text-xs flex items-start gap-2 ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        )}

        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Code className="w-4 h-4 text-brand-500" />
            <span>Developer Integration Guidelines</span>
          </div>

          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            {current.todoList.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-brand-500/20 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
