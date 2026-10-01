import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  Eye,
  EyeOff,
  Flame,
  Sparkles,
  Settings as SettingsIcon,
  HardDrive,
  Cloud,
  LogOut,
  LogIn,
  Users,
  ChevronDown,
  ShieldCheck,
  Activity,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenStorage: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenSettings,
  onOpenStorage,
}) => {
  const {
    profile,
    scores,
    isPrivacyMode,
    togglePrivacyMode,
    storageStats,
    currentUser,
    signInWithGoogle,
    switchAccount,
    logout,
  } = useApp();

  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home' },
    { id: 'habits', label: 'Habits & Routine', shortLabel: 'Habits' },
    { id: 'wealth', label: 'Wealth', shortLabel: 'Wealth' },
    { id: 'productivity', label: 'Productivity & Mind', shortLabel: 'Productivity' },
    { id: 'insights', label: 'Insights & Balance', shortLabel: 'Insights' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-4 lg:px-8 py-2.5 sm:py-3 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: HabitFlow Wordmark & Brand Flow Icon */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className="flex items-center gap-2 sm:gap-2.5 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:shadow-emerald-500/25 group-hover:scale-105 transition-all shrink-0">
              <Activity className="w-4 h-4 text-white stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                HabitFlow
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-emerald-600 tracking-wider uppercase font-semibold leading-none">
                LifeOS
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Animated sliding pill navigation links (Tablet & Desktop Adaptive) */}
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 relative">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`relative px-2 lg:px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer z-10 ${
                  isActive
                    ? 'text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/80'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeHeaderTab"
                    className="absolute inset-0 bg-slate-100/90 border border-slate-200/80 rounded-lg shadow-xs -z-10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {/* Responsive label: shortLabel on tablets (md), full label on desktop (lg+) */}
                <span className="lg:hidden">{link.shortLabel}</span>
                <span className="hidden lg:inline">{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary actions, Storage, and profile snapshot */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Consistency Streak with Animated Flame */}
          <div className="hidden md:flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-mono tabular-nums">
            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-flame" />
            <span className="hidden xl:inline">{profile.consistencyStreakDays}d streak</span>
            <span className="xl:hidden">{profile.consistencyStreakDays}d</span>
          </div>

          {/* Today's Life Score Badge */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200/80 text-xs font-mono tabular-nums text-slate-700">
            <span className="text-slate-400 text-[10px] uppercase font-semibold hidden xs:inline">Score</span>
            <span className="font-bold text-emerald-700">{scores.overall}</span>
            <span className="text-slate-400 text-[10px]">/100</span>
          </div>

          {/* Storage Facilities Trigger */}
          <button
            onClick={onOpenStorage}
            title={`Storage Facilities & Cloud Database (${storageStats.kb} KB used)`}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200/70 border border-slate-200/80 text-slate-700 hover:text-slate-900 text-xs font-medium transition-colors cursor-pointer"
          >
            <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden xl:inline text-[11px] font-mono">{storageStats.kb}KB</span>
            {currentUser && (
              <span title="Connected to Google Cloud Firestore">
                <Cloud className="w-3.5 h-3.5 text-sky-600 ml-0.5" />
              </span>
            )}
          </button>

          {/* Privacy Toggle */}
          <button
            onClick={togglePrivacyMode}
            title={isPrivacyMode ? 'Privacy Mode ON (Figures Masked)' : 'Privacy Mode OFF'}
            className={`p-1.5 rounded-md border transition-colors cursor-pointer ${
              isPrivacyMode
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {isPrivacyMode ? <EyeOff className="w-3.5 sm:w-4 h-3.5 sm:h-4" /> : <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />}
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            title="Settings & Data Governance"
            className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <SettingsIcon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
          </button>

          {/* Authentication & Multi-User Profile Dropdown */}
          <div className="relative pl-1 border-l border-slate-200" ref={accountMenuRef}>
            {currentUser ? (
              <div>
                <button
                  onClick={() => setIsAccountMenuOpen((prev) => !prev)}
                  title={`Signed in as ${currentUser.email}. Click for account options.`}
                  className="flex items-center gap-1 sm:gap-1.5 p-0.5 sm:p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer text-left"
                >
                  <img
                    src={currentUser.photoURL || profile.avatarUrl}
                    alt={currentUser.displayName || profile.name}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover border border-emerald-400 ring-2 ring-emerald-100 shadow-xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Multi-Account Menu Dropdown */}
                <AnimatePresence>
                  {isAccountMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 origin-top-right"
                    >
                      <div className="px-3.5 py-2.5 border-b border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Active Google Account
                        </div>
                        <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                          {currentUser.displayName || profile.name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">
                          {currentUser.email}
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                          <Cloud className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Private Firestore Isolated Storage</span>
                        </div>
                      </div>

                      <div className="p-1 space-y-0.5">
                        {/* Switch Account */}
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            switchAccount();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <Users className="w-4 h-4 text-sky-600 shrink-0" />
                          <div>
                            <div className="font-semibold">Switch Google Account</div>
                            <div className="text-[10px] text-slate-400">Sign in with a different account</div>
                          </div>
                        </button>

                        {/* Sign Out */}
                        <button
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                          <div>
                            <div className="font-semibold">Sign Out</div>
                            <div className="text-[10px] text-rose-400">Disconnect from this browser</div>
                          </div>
                        </button>
                      </div>

                      <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Multiple users have completely isolated databases</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                title="Sign in with Google to sync with Cloud Firestore"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In with Google</span>
                <span className="sm:hidden">Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar with Smooth Horizontal Swipe */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scrollbar-none px-0.5">
        {navLinks.map((link) => {
          const isActive = currentTab === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentTab(link.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-100/90 active:bg-slate-200'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
