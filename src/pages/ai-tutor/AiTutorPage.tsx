import React, { useState } from 'react';
import { Bot, Send, Sparkles, CheckCircle, Crown, AlertTriangle } from 'lucide-react';
import { groqService } from '../../services/groq/groqService';
import { ChatMessage } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { NavLink } from 'react-router-dom';

/**
 * Renders bold Markdown and headers nicely formatted in React JSX
 */
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');

  const renderBoldText = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-2 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={idx} className="text-base font-bold text-brand-600 dark:text-brand-400 mt-2 mb-1">
              {trimmed.replace(/^###\s+/, '')}
            </h3>
          );
        }

        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={idx} className="text-lg font-extrabold text-slate-900 dark:text-white mt-3 mb-1">
              {trimmed.replace(/^##\s+/, '')}
            </h2>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const content = trimmed.replace(/^[\*\-]\s+/, '');
          return (
            <div key={idx} className="ml-3 flex items-start gap-2 text-sm">
              <span className="text-brand-500 font-bold">•</span>
              <span>{renderBoldText(content)}</span>
            </div>
          );
        }

        if (/^\d+\.\s+/.test(trimmed)) {
          const match = trimmed.match(/^(\d+\.)\s+(.*)/);
          if (match) {
            return (
              <div key={idx} className="ml-3 flex items-start gap-2 text-sm">
                <span className="text-brand-600 font-bold shrink-0">{match[1]}</span>
                <span>{renderBoldText(match[2])}</span>
              </div>
            );
          }
        }

        return (
          <p key={idx} className="text-sm">
            {renderBoldText(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const AiTutorPage: React.FC = () => {
  const { student, addStudyTime, recordStudyActivity } = useAuth();
  const { isPro } = useSubscriptionStatus();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'tutor',
      text: `Hello ${student?.name.split(' ')[0] || 'Nurse'}! 👋 I am your NursaFlow AI Tutor. How can I assist your nursing studies today? Feel free to select a prompt below or ask any NCLEX question!`,
      timestamp: 'Just now',
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Explain the difference between systolic and diastolic blood pressure.',
    'Quiz me on pharmacology cardiac glycosides.',
    'What is the fluid & insulin protocol for DKA management?',
  ]);

  const handleSendPrompt = async (promptText: string) => {
    if (!promptText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    addStudyTime(5, false); // 5 minutes study time credit per query
    recordStudyActivity();

    try {
      const response = await groqService.askNursingTutor(promptText, messages);
      const tutorMsg: ChatMessage = {
        id: `tutor_${Date.now()}`,
        sender: 'tutor',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFallback: response.isFallback,
        fallbackReason: response.fallbackReason,
      };
      setMessages((prev) => [...prev, tutorMsg]);

      if (response.suggestedFollowUps && response.suggestedFollowUps.length > 0) {
        setSuggestedPrompts(response.suggestedFollowUps);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Bot className="w-8 h-8 text-brand-500" />
            <span>NursaFlow AI Nursing Tutor</span>
            {isPro ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-amber-500" />
                <span>PRO</span>
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                Free Tier
              </span>
            )}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Powered by Groq AI • Llama 3.3 70B • NCLEX-RN tutoring & clinical explanations.
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" />
              NursaFlow AI Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isPro && (
            <NavLink to="/settings">
              <Button variant="primary" size="sm" icon={Crown} className="bg-gradient-to-r from-amber-500 to-brand-600">
                Upgrade to Pro
              </Button>
            </NavLink>
          )}
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <Sparkles className="w-4 h-4 text-brand-500 shrink-0" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Suggested:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(p)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900/60 hover:bg-brand-500/20 whitespace-nowrap transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Workspace Box */}
      <Card className="p-0 flex flex-col justify-between overflow-hidden min-h-[500px] border-slate-200 dark:border-slate-800">
        {/* Chat Messages Stream */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 max-h-[550px]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isUser ? (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                ) : (
                  <Avatar src={student?.avatarUrl} name={student?.name || 'User'} size="sm" />
                )}

                <div
                  className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-none shadow-md shadow-brand-600/20'
                      : 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  {msg.isFallback && (
                    <div className="mb-3 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>⚠️ Couldn't reach live Groq AI ({msg.fallbackReason || 'Offline Mode'}) — Showing offline study template</span>
                    </div>
                  )}

                  <FormattedMessage text={msg.text} />
                  <span className={`text-[10px] block text-right mt-1.5 font-semibold ${isUser ? 'text-brand-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold animate-pulse p-2">
              <div className="w-8 h-8 rounded-2xl bg-brand-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-500 animate-spin" />
              </div>
              <span>NursaFlow AI Tutor is thinking...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputPrompt);
          }}
          className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask NursaFlow AI any nursing or NCLEX question..."
            className="flex-1 px-4 py-3 rounded-2xl text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
          />

          <Button type="submit" variant="primary" icon={Send} isLoading={isLoading}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
