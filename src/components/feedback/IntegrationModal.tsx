import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Code, Video, Bot, Database, Key, CheckCircle, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { geminiService } from '../../services/gemini/geminiService';

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
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [testResult, setTestResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && serviceType === 'gemini') {
      const currentKey = geminiService.getApiKey();
      setApiKeyInput(currentKey);
      setTestResult(null);
      setSavedSuccess(false);
    }
  }, [isOpen, serviceType]);

  const handleTestKey = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult({ success: false, message: 'Please enter a Gemini API Key to test.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await geminiService.testApiKey(apiKeyInput);
      setTestResult(res);
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || 'Error testing API key.' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveKey = () => {
    geminiService.setApiKey(apiKeyInput);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleClearKey = () => {
    geminiService.setApiKey('');
    setApiKeyInput('');
    setTestResult(null);
    setSavedSuccess(false);
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
      title: 'Google Gemini AI Tutor API Specs & Config',
      filePath: 'src/services/gemini/geminiService.ts',
      description: `Power NursaFlow AI Tutor with live Google Gemini API models (gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash). Paste your API Key below to activate real-time nursing tutoring.`,
      todoList: [
        'Obtain a free GEMINI_API_KEY from Google AI Studio (aistudio.google.com)',
        'Paste your API key below or set VITE_GEMINI_API_KEY in your .env file',
        'Supports all Google AI Studio key formats (AIzaSy... and modern key formats)',
        'Automatic whitespace, quotes, and newline sanitization built-in',
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

        {/* Gemini API Key Configuration Panel */}
        {serviceType === 'gemini' && (
          <div className="p-4 rounded-2xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                <Key className="w-4 h-4 text-teal-500" />
                <span>Configure Gemini API Key</span>
              </div>
              {geminiService.hasApiKey() ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle className="w-3 h-3" />
                  Key Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Demo Mode (No Key)
                </span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                API Key (Google AI Studio):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="Paste your Gemini API key (AIzaSy...)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                {apiKeyInput && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearKey}
                    title="Clear API Key"
                    className="text-red-500 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                isLoading={isTesting}
                onClick={handleTestKey}
              >
                Test Connection
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveKey}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                Save Key
              </Button>
            </div>

            {savedSuccess && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>API Key saved to browser local storage!</span>
              </div>
            )}

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
