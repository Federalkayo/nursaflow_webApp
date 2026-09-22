import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, CheckCircle, Crown, AlertTriangle, ArrowDown } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { groqService } from '../../services/groq/groqService';
import { ChatMessage } from '../../types';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Avatar } from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { NavLink } from 'react-router-dom';

/**
 * Renders full Markdown (bold, headers, lists, and GFM tables) as styled JSX.
 * Uses react-markdown + remark-gfm so tables ( | col | col | ) render as real
 * <table> elements instead of raw pipe-delimited text.
 */
const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  return (
    <div className="space-y-2 leading-relaxed text-sm [&_p]:my-1">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3 mb-1">{children}</h2>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white mt-3 mb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-bold text-brand-600 dark:text-brand-400 mt-2 mb-1">{children}</h3>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
          ),
          ul: ({ children }) => <ul className="space-y-1 ml-1">{children}</ul>,
          ol: ({ children }) => <ol className="space-y-1 ml-1 list-none">{children}</ol>,
          li: ({ children }) => (
            <li className="ml-3 flex items-start gap-2">
              <span className="text-brand-500 font-bold">•</span>
              <span>{children}</span>
            </li>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="min-w-full text-xs sm:text-sm border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-100 dark:bg-slate-800">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 align-top border-b border-slate-100 dark:border-slate-800">{children}</td>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          p: ({ children }) => <p className="text-sm">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-brand-600 underline">
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
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
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([
    'Explain the difference between systolic and diastolic blood pressure.',
    'Quiz me on pharmacology cardiac glycosides.',
    'What is the fluid & insulin protocol for DKA management?',
  ]);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // Auto-scroll whenever messages list or loading state changes
  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading]);

  // Track scroll position to show quick "scroll to bottom" button if user scrolls up
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isFarFromBottom = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isFarFromBottom);
  };

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
    <div className="space-y-2.5 sm:space-y-4 animate-in fade-in duration-300 max-w-4xl mx-auto h-[calc(100dvh-11rem)] md:h-[calc(100vh-8.5rem)] flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-base sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bot className="w-5 h-5 sm:w-7 sm:h-7 text-brand-500 shrink-0" />
            <span className="truncate">NursaFlow AI Nursing Tutor</span>
            {isPro ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-extrabold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1 shrink-0">
                <Crown className="w-3 h-3 fill-amber-500" />
                <span>PRO</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                Free Tier
              </span>
            )}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-0.5">
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
              Groq AI • Llama 3.3 70B • NCLEX-RN tutoring
            </p>
            <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-2.5 h-2.5" />
              Active
            </span>
          </div>
        </div>

        {!isPro && (
          <div className="shrink-0 hidden sm:block">
            <NavLink to="/settings">
              <Button variant="primary" size="sm" icon={Crown} className="bg-gradient-to-r from-amber-500 to-brand-600 text-xs py-1 px-3">
                Upgrade to Pro
              </Button>
            </NavLink>
          </div>
        )}
      </div>

      {/* Suggested Prompt Pills */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />
        <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">
          Suggested:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(p)}
            className="px-2.5 py-1 rounded-xl text-[10px] sm:text-xs font-medium bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900/60 hover:bg-brand-500/20 whitespace-nowrap transition-colors cursor-pointer"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Workspace Box - Fixed Height Flex Container */}
      <Card className="flex-1 min-h-0 p-0 flex flex-col justify-between overflow-hidden border border-slate-200 dark:border-slate-800 relative shadow-sm rounded-2xl sm:rounded-3xl">
        {/* Chat Messages Stream - ONLY THIS CONTAINER SCROLLS */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="p-3 sm:p-6 flex-1 min-h-0 overflow-y-auto space-y-3.5 scroll-smooth"
        >
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {!isUser ? (
                  <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-brand-600 to-teal-400 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                    <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                ) : (
                  <Avatar src={student?.avatarUrl} name={student?.name || 'User'} size="sm" />
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[85%] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl text-xs sm:text-sm leading-relaxed ${
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
                  <span className={`text-[9px] sm:text-[10px] block text-right mt-1.5 font-semibold ${isUser ? 'text-brand-200' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3 text-slate-400 text-xs font-semibold animate-pulse p-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl sm:rounded-2xl bg-brand-500/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-brand-500 animate-spin" />
              </div>
              <span>NursaFlow AI Tutor is thinking...</span>
            </div>
          )}

          {/* Invisible ref element to target scrolling */}
          <div ref={messagesEndRef} />
        </div>

        {/* Scroll to Bottom Floating Action Button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-16 sm:bottom-20 right-4 sm:right-6 p-2 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700 transition-all flex items-center gap-1 text-xs font-semibold z-20 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
          >
            <ArrowDown className="w-4 h-4" />
            <span className="hidden sm:inline">Latest</span>
          </button>
        )}

        {/* 100% STATIC Input Bar at Bottom */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(inputPrompt);
          }}
          className="shrink-0 p-2.5 sm:p-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 sm:gap-3 bg-white dark:bg-slate-900 z-10"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Ask NursaFlow AI any question..."
            className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-inner"
          />

          <Button type="submit" variant="primary" icon={Send} isLoading={isLoading} className="text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4">
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
};
