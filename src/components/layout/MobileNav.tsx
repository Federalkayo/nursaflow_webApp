import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Users,
  Stethoscope,
  Bot,
  X,
  User,
  Settings,
  HeartPulse
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  isDrawerOpen: boolean;
  onCloseDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isDrawerOpen, onCloseDrawer }) => {
  const location = useLocation();
  const { student } = useAuth();

  const mobileTabs = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Academic', path: '/academic', icon: GraduationCap },
    { name: 'Study', path: '/study', icon: BookOpen },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Clinical', path: '/clinical', icon: Stethoscope },
  ];

  const drawerLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Academic Tracker', path: '/academic', icon: GraduationCap },
    { name: 'Nursing Study', path: '/study', icon: BookOpen },
    { name: 'Community', path: '/community', icon: Users },
    { name: 'Clinical Tools', path: '/clinical', icon: Stethoscope },
    { name: 'AI Nursing Tutor', path: '/ai-tutor', icon: Bot },
    { name: 'Student Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar for Mobile (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex items-center justify-around shadow-lg">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname.startsWith(tab.path);

          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-brand-500/10' : ''}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{tab.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Full-screen Mobile Drawer Slide-out */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 h-full p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-left duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-400 flex items-center justify-center text-white font-bold">
                    <HeartPulse className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                    Nursa<span className="text-brand-600 dark:text-brand-400">Flow</span>
                  </span>
                </div>
                <button
                  onClick={onCloseDrawer}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1">
                {drawerLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = location.pathname.startsWith(link.path);

                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={onCloseDrawer}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-colors ${
                        isActive
                          ? 'bg-brand-600 text-white font-semibold'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-5 h-5 shrink-0" />
                      <span>{link.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>

            {student && (
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img src={student.avatarUrl} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {student.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{student.school}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1" onClick={onCloseDrawer} />
        </div>
      )}
    </>
  );
};
