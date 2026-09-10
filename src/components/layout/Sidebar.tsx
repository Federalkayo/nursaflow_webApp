import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  Stethoscope,
  Bot,
  User,
  Settings,
  Flame,
  ChevronLeft,
  ChevronRight,
  HeartPulse,
  Code
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Badge } from '../common/Badge';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const { student } = useAuth();
  const location = useLocation();

  const mainNavigation = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Academic Tracker', path: '/academic', icon: GraduationCap },
    { name: 'Nursing Study', path: '/study', icon: BookOpen },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Clinical Tools', path: '/clinical', icon: Stethoscope },
    { name: 'AI Nursing Tutor', path: '/ai-tutor', icon: Bot, badge: 'AI' },
  ];

  const secondaryNavigation = [
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`hidden md:flex flex-col fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo & Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800/80">
        <NavLink to="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20 shrink-0">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                Nursa<span className="text-brand-600 dark:text-brand-400">Flow</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                Clinical EdTech
              </span>
            </div>
          )}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Main Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 no-scrollbar">
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Main Menu
            </p>
          )}
          {mainNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />

                {!collapsed && <span className="truncate">{item.name}</span>}

                {!collapsed && item.badge && (
                  <span className="ml-auto px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
              Preferences
            </p>
          )}
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                    isActive
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
                title={collapsed ? item.name : undefined}
              >
                <Icon className="w-5 h-5 shrink-0 text-slate-500 dark:text-slate-400 group-hover:scale-110 transition-transform" />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Student Profile Quick Footer */}
      {student && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <Avatar src={student.avatarUrl} name={student.name} size={collapsed ? 'sm' : 'md'} status="online" />
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {student.name}
                </span>
                <div className="flex items-center gap-1 text-[11px] text-amber-500 font-semibold mt-0.5">
                  <Flame className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{student.studyStreakDays} Day Streak</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
