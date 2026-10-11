<<<<<<< HEAD
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Bell,
  Settings,
  User,
  Sparkles,
  Sun,
  Moon,
  Trash2,
  LogOut,
  CheckCircle2,
  Cpu,
  Info,
  X
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';

type NavTab = 'home' | 'notifications' | 'settings' | 'profile';

export const Header: React.FC = () => {
=======
import React from 'react';
import { Sparkles, Menu, Sun, Moon, Trash2, LogOut, Upload, Undo2, Redo2 } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  onUploadData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUploadData }) => {
>>>>>>> origin/saniya
  const {
    isAdapting,
    currentPlan,
    clearWorkspace,
    theme,
    toggleTheme,
<<<<<<< HEAD
    notification,
    clearNotification,
    provider
=======
    undo,
    redo,
    undoStack,
    redoStack,
    isHistoryActionPending
>>>>>>> origin/saniya
  } = useWorkspaceStore();
  const { user, error: authError, signOut } = useAuthStore();

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [openDropdown, setOpenDropdown] = useState<NavTab | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTabClick = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setOpenDropdown(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Toggle dropdown if clicked again, otherwise open it
      setOpenDropdown(prev => (prev === tab ? null : tab));
    }
  };

  return (
    <header className="h-16 mt-4 px-4 md:px-6 border-b border-[var(--border-color)] bg-[var(--bg-color)]/90 backdrop-blur-md sticky top-0 z-40 transition-colors flex items-center justify-between shrink-0">
      {/* Left side: Brand */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <img
            src="/saarthai-logo.jpg"
            alt="SaarthAI"
            className="h-20 sm:h-9 w-50 object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:px-2 dark:py-0.5 dark:rounded-lg transition-all"
          />
          <span className="text-[10px] sm:text-[11px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black border border-primary/30 shadow-sm shrink-0">
            v2.0
          </span>
        </div>
      </div>

<<<<<<< HEAD
      {/* Center: The Floating Pill Navigation Bar */}
      <div className="relative " ref={navContainerRef}>
        <nav
          aria-label="Main Navigation"
          className="relative mb-2  flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white dark:bg-[#181524] rounded-2xl sm:rounded-full border border-slate-200/80 dark:border-white/10 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_14px_35px_-5px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)] transition-all"
=======
      {/* Right controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onUploadData}
          title="Upload data files"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-card-hover text-xs text-[var(--text-primary)] border border-[var(--border-color)] transition-all font-medium"
        >
          <Upload className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Upload data</span>
        </button>
        {(undoStack.length > 0 || redoStack.length > 0) && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void undo()}
              disabled={!undoStack.length || isHistoryActionPending}
              aria-label="Undo last change"
              title="Undo last change"
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => void redo()}
              disabled={!redoStack.length || isHistoryActionPending}
              aria-label="Redo last change"
              title="Redo last change"
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        )}
        {authError && (
          <span role="alert" className="max-w-48 text-[11px] text-coral">
            {authError}
          </span>
        )}
        <div className="hidden text-right sm:block">
          <div className="text-xs font-medium text-[var(--text-primary)]">{user?.name}</div>
          <div className="text-[10px] text-[var(--text-muted)]">{user?.email}</div>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          title={authError || 'Sign out'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-card-hover text-xs text-[var(--text-primary)] border border-[var(--border-color)] transition-all font-medium"
>>>>>>> origin/saniya
        >
          {/* Home Tab */}
          <button
            type="button"
            onClick={() => handleTabClick('home')}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all ${activeTab === 'home'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
              }`}
          >
            {activeTab === 'home' && (
              <motion.div
                layoutId="navbar-active-pill"
                className="absolute inset-0 rounded-xl sm:rounded-full bg-gradient-to-r from-[#471ca8]/15 via-[#884ab2]/15 to-[#ff8008]/15 border border-[#884ab2]/30 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Home
              className={`w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10 transition-colors ${activeTab === 'home' ? 'text-[#471ca8] dark:text-[#ff8008] stroke-[2.2]' : 'text-slate-500 dark:text-slate-400 stroke-[1.8]'
                }`}
            />
            <span className="relative z-10 hidden sm:inline">Home</span>
          </button>

          {/* Notifications Tab */}
          <button
            type="button"
            onClick={() => handleTabClick('notifications')}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all ${activeTab === 'notifications'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
              }`}
          >
            {activeTab === 'notifications' && (
              <motion.div
                layoutId="navbar-active-pill"
                className="absolute inset-0 rounded-xl sm:rounded-full bg-gradient-to-r from-[#471ca8]/15 via-[#884ab2]/15 to-[#ff8008]/15 border border-[#884ab2]/30 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <div className="relative">
              <Bell
                className={`w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10 transition-colors ${activeTab === 'notifications' ? 'text-[#471ca8] dark:text-[#ff8008] stroke-[2.2]' : 'text-slate-500 dark:text-slate-400 stroke-[1.8]'
                  }`}
              />
              {notification && (
                <span
                  style={{ background: 'linear-gradient(135deg, #471ca8 0%, #ff8008 100%)' }}
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-white dark:ring-[#181524] z-20"
                />
              )}
            </div>
            <span className="relative z-10 hidden sm:inline">Notifications</span>
          </button>

          {/* Settings Tab */}
          <button
            type="button"
            onClick={() => handleTabClick('settings')}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all ${activeTab === 'settings'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
              }`}
          >
            {activeTab === 'settings' && (
              <motion.div
                layoutId="navbar-active-pill"
                className="absolute inset-0 rounded-xl sm:rounded-full bg-gradient-to-r from-[#471ca8]/15 via-[#884ab2]/15 to-[#ff8008]/15 border border-[#884ab2]/30 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <Settings
              className={`w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10 transition-colors ${activeTab === 'settings' ? 'text-[#471ca8] dark:text-[#ff8008] stroke-[2.2]' : 'text-slate-500 dark:text-slate-400 stroke-[1.8]'
                }`}
            />
            <span className="relative z-10 hidden sm:inline">Settings</span>
          </button>

          {/* Profile Tab */}
          <button
            type="button"
            onClick={() => handleTabClick('profile')}
            className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all ${activeTab === 'profile'
              ? 'text-slate-900 dark:text-white font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
              }`}
          >
            {activeTab === 'profile' && (
              <motion.div
                layoutId="navbar-active-pill"
                className="absolute inset-0 rounded-xl sm:rounded-full bg-gradient-to-r from-[#471ca8]/15 via-[#884ab2]/15 to-[#ff8008]/15 border border-[#884ab2]/30 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <User
              className={`w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10 transition-colors ${activeTab === 'profile' ? 'text-[#471ca8] dark:text-[#ff8008] stroke-[2.2]' : 'text-slate-500 dark:text-slate-400 stroke-[1.8]'
                }`}
            />
            <span className="relative z-10 hidden sm:inline">Profile</span>
          </button>
        </nav>

        {/* Dropdown Popovers */}
        <AnimatePresence>
          {openDropdown === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 mt-3 w-80 sm:w-96 p-4 rounded-2xl bg-white dark:bg-[#1b172b] border border-slate-200/90 dark:border-white/10 shadow-2xl z-50 text-[var(--text-primary)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                    Notifications
                  </span>
                </div>
                {notification && (
                  <button
                    onClick={clearNotification}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="py-3 space-y-2.5 max-h-64 overflow-y-auto">
                {notification ? (
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed text-slate-800 dark:text-slate-200">
                      {notification.message}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-xs text-[var(--text-muted)] space-y-1">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500/70 stroke-[1.5]" />
                    <p className="font-medium text-[var(--text-secondary)]">All caught up!</p>
                    <p className="text-[11px]">No pending workspace alerts.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {openDropdown === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 mt-3 w-72 sm:w-80 p-4 rounded-2xl bg-white dark:bg-[#1b172b] border border-slate-200/90 dark:border-white/10 shadow-2xl z-50 text-[var(--text-primary)] space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-xs uppercase tracking-wider text-[var(--text-primary)]">
                    Preferences
                  </span>
                </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--text-secondary)]">Interface Theme</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium border transition-all ${theme === 'light'
                      ? 'bg-blue-50 border-blue-500/40 text-blue-700 shadow-sm'
                      : 'border-[var(--border-color)] hover:bg-black/5 text-[var(--text-secondary)]'
                      }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    Light
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-medium border transition-all ${theme === 'dark'
                      ? 'bg-blue-500/15 border-blue-500/40 text-blue-400 shadow-sm'
                      : 'border-[var(--border-color)] hover:bg-black/5 text-[var(--text-secondary)]'
                      }`}
                  >
                    <Moon className="w-4 h-4 text-blue-400" />
                    Dark
                  </button>
                </div>
              </div>

              {/* AI Engine Provider */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-primary" />
                    Engine Mode
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                    {provider}
                  </span>
                </div>
              </div>

              {/* Workspace Clear */}
              {currentPlan && (
                <div className="pt-2 border-t border-[var(--border-color)]">
                  <button
                    onClick={() => {
                      clearWorkspace();
                      setOpenDropdown(null);
                    }}
                    disabled={isAdapting}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-coral/10 hover:bg-coral/20 text-coral border border-coral/30 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Workspace Canvas
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {openDropdown === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 mt-3 w-72 sm:w-80 p-4 rounded-2xl bg-white dark:bg-[#1b172b] border border-slate-200/90 dark:border-white/10 shadow-2xl z-50 text-[var(--text-primary)] space-y-4"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-color)]">
                <div
                  style={{ background: 'linear-gradient(135deg, #471ca8 0%, #884ab2 50%, #ff8008 100%)' }}
                  className="w-10 h-10 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-md"
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-semibold text-[var(--text-primary)] truncate">
                    {user?.name || 'Authorized User'}
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">
                    {user?.email || 'user@workspace.internal'}
                  </div>
                </div>
              </div>

              {authError && (
                <div className="p-2 rounded-lg bg-coral/15 border border-coral/30 text-coral text-[11px]">
                  {authError}
                </div>
              )}

              <button
                type="button"
                onClick={() => void signOut()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-[var(--border-color)] text-xs font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right controls: Theme quick-toggle & User avatar indicator */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('profile')}
          title="Open Profile"
          className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <div
            style={{ background: 'linear-gradient(135deg, #471ca8 0%, #884ab2 50%, #ff8008 100%)' }}
            className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-semibold shadow-sm"
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
          </div>
        </button>
      </div>
    </header>
  );
};

