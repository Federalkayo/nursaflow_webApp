import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Sun, Moon, Bell, Flame, Search, Code, LogOut, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { SearchBar } from '../common/SearchBar';
import { IntegrationModal } from '../feedback/IntegrationModal';

interface HeaderProps {
  onOpenMobileDrawer: () => void;
}

import { useSubscriptionStatus } from '../../hooks/useSubscriptionStatus';
import { Crown } from 'lucide-react';

export const Header: React.FC<HeaderProps> = ({ onOpenMobileDrawer }) => {
  const { theme, toggleTheme } = useTheme();
  const { student, logout } = useAuth();
  const { isPro } = useSubscriptionStatus();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  const notifications = [
    { id: '1', title: 'Pharmacology Quiz Reminder', time: '10 mins ago', isUnread: true },
    { id: '2', title: 'David Chen liked your dosage tip', time: '1 hour ago', isUnread: true },
    { id: '3', title: 'NCLEX Group Live Room starting soon', time: '3 hours ago', isUnread: false },
  ];

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Mobile Drawer Open Button */}
      <div className="flex items-center gap-3 md:hidden">
        <button
          onClick={onOpenMobileDrawer}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Open Navigation Menu"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-base font-extrabold text-slate-900 dark:text-white">
          Nursa<span className="text-brand-600 dark:text-brand-400">Flow</span>
        </span>
      </div>

      {/* Quick Search Input */}
      <div className="hidden md:flex flex-1 max-w-md">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Developer Integration Status Button */}
        <button
          onClick={() => setShowIntegrationModal(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900 hover:bg-brand-500/20 transition-colors"
        >
          <Code className="w-3.5 h-3.5" />
          <span>Integrations</span>
        </button>

        {/* Study Streak Counter */}
        {student && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-900/60 text-amber-600 dark:text-amber-400 text-xs font-bold">
            <Flame className="w-4 h-4 fill-amber-500 animate-bounce" />
            <span>{student.studyStreakDays}d</span>
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-ping" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Notifications
                </h4>
                <span className="text-[10px] font-semibold text-brand-600 dark:text-brand-400">
                  2 unread
                </span>
              </div>

              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl text-xs flex items-start gap-2.5 transition-colors ${
                      n.isUnread
                        ? 'bg-brand-500/10 text-slate-900 dark:text-white font-medium'
                        : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                    <div>
                      <p>{n.title}</p>
                      <span className="text-[10px] text-slate-400">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Student Avatar Header Quick Link */}
        {student && (
          <NavLink to="/profile" className="ml-1 flex items-center gap-2 relative">
            <Avatar src={student.avatarUrl} name={student.name} size="sm" />
            {isPro && (
              <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white shadow-sm ring-2 ring-white dark:ring-slate-900" title="NursaFlow Pro Active">
                <Crown className="w-3 h-3 fill-white" />
              </span>
            )}
          </NavLink>
        )}
      </div>

      {/* Integration Guide Modal */}
      <IntegrationModal
        isOpen={showIntegrationModal}
        onClose={() => setShowIntegrationModal(false)}
        serviceType="supabase"
        featureTitle="NursaFlow Architecture Integrations"
      />
    </header>
  );
};
