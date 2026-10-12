import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  CheckCircle2,
  Cpu,
  Home,
  Info,
  LogOut,
  Moon,
  Redo2,
  Settings,
  Sun,
  Trash2,
  Undo2,
  Upload,
  User,
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';

type NavTab = 'home' | 'notifications' | 'settings' | 'profile';

interface HeaderProps {
  onUploadData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUploadData }) => {
  const {
    isAdapting,
    currentPlan,
    clearWorkspace,
    theme,
    toggleTheme,
    notification,
    clearNotification,
    provider,
    undo,
    redo,
    undoStack,
    redoStack,
    isHistoryActionPending,
  } = useWorkspaceStore();
  const { user, error: authError, signOut } = useAuthStore();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [openDropdown, setOpenDropdown] = useState<NavTab | null>(null);
  const navContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTabClick = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'home') {
      setOpenDropdown(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setOpenDropdown(previous => previous === tab ? null : tab);
    }
  };

  const closeDropdown = () => setOpenDropdown(null);

  return (
    <header className="h-16 mt-4 px-4 md:px-6 border-b border-[var(--border-color)] bg-[var(--bg-color)]/90 backdrop-blur-md sticky top-0 z-40 transition-colors flex items-center justify-between shrink-0">
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <img
          src="/saarthai-logo.jpg"
          alt="SaarthAI"
          className="h-9 max-w-40 object-contain mix-blend-multiply dark:mix-blend-normal dark:bg-white dark:px-2 dark:py-0.5 dark:rounded-lg transition-all"
        />
        <span className="text-[10px] sm:text-[11px] uppercase font-mono font-semibold px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black border border-primary/30 shadow-sm">
          v2.0
        </span>
      </div>

      <div className="relative" ref={navContainerRef}>
        <nav
          aria-label="Main Navigation"
          className="relative flex items-center gap-1 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-white dark:bg-[#181524] rounded-2xl sm:rounded-full border border-slate-200/80 dark:border-white/10 shadow-lg transition-all"
        >
          {([
            ['home', Home, 'Home'],
            ['notifications', Bell, 'Notifications'],
            ['settings', Settings, 'Settings'],
            ['profile', User, 'Profile'],
          ] as const).map(([tab, Icon, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabClick(tab)}
              aria-expanded={tab === 'home' ? undefined : openDropdown === tab}
              className={`relative flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'text-slate-900 dark:text-white font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-white/5'
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="absolute inset-0 rounded-xl sm:rounded-full bg-gradient-to-r from-[#fc5602]/15 via-[#ff8008]/15 to-[#ffb703]/15 border border-[#ff8008]/30 shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10">
                <Icon className={`w-4 h-4 sm:w-[18px] sm:h-[18px] ${
                  activeTab === tab ? 'text-[#ea580c] dark:text-[#ff8008]' : 'text-slate-500 dark:text-slate-400'
                }`} />
                {tab === 'notifications' && notification && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary ring-2 ring-white dark:ring-[#181524]" />
                )}
              </span>
              <span className="relative z-10 hidden sm:inline">{label}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence>
          {openDropdown === 'notifications' && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute left-1/2 -translate-x-1/2 mt-3 w-80 sm:w-96 p-4 rounded-2xl bg-white dark:bg-[#1b172b] border border-[var(--border-color)] shadow-2xl z-50 text-[var(--text-primary)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <span className="font-semibold text-xs uppercase tracking-wider">Notifications</span>
                {notification && (
                  <button
                    type="button"
                    onClick={clearNotification}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="py-3">
                {notification ? (
                  <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-500/10 border border-blue-200/60 dark:border-blue-500/20 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs leading-relaxed">{notification.message}</div>
                  </div>
                ) : (
                  <div className="text-center py-5 text-xs text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-500/70" />
                    All caught up!
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
              className="absolute left-1/2 -translate-x-1/2 mt-3 w-72 sm:w-80 p-4 rounded-2xl bg-white dark:bg-[#1b172b] border border-[var(--border-color)] shadow-2xl z-50 text-[var(--text-primary)] space-y-4"
            >
              <div className="font-semibold text-xs uppercase tracking-wider border-b border-[var(--border-color)] pb-2">
                Settings
              </div>
              <button
                type="button"
                onClick={() => {
                  closeDropdown();
                  onUploadData();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30 text-xs font-medium transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload CSV or JSON data
              </button>
              <div className="space-y-2">
                <span className="text-xs font-medium text-[var(--text-secondary)]">Interface theme</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs border ${
                      theme === 'light' ? 'bg-blue-50 border-blue-500/40 text-blue-700' : 'border-[var(--border-color)]'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" /> Light
                  </button>
                  <button
                    type="button"
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`flex items-center justify-center gap-2 p-2 rounded-xl text-xs border ${
                      theme === 'dark' ? 'bg-blue-500/15 border-blue-500/40 text-blue-400' : 'border-[var(--border-color)]'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-blue-400" /> Dark
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--border-color)] pt-3">
                <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-primary" /> Engine mode
                </span>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary">
                  {provider}
                </span>
              </div>
              {currentPlan && (
                <button
                  type="button"
                  onClick={() => {
                    clearWorkspace();
                    closeDropdown();
                  }}
                  disabled={isAdapting}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-coral/10 hover:bg-coral/20 text-coral border border-coral/30 text-xs font-medium disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear workspace canvas
                </button>
              )}
            </motion.div>
          )}

          {openDropdown === 'profile' && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="absolute left-1/2 -translate-x-1/2 mt-3 w-72 p-4 rounded-2xl bg-white dark:bg-[#1b172b] border border-[var(--border-color)] shadow-2xl z-50 text-[var(--text-primary)] space-y-3"
            >
              <div className="flex items-center gap-3 pb-3 border-b border-[var(--border-color)]">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold truncate">{user?.name || 'Authorized User'}</div>
                  <div className="text-[11px] text-[var(--text-secondary)] truncate">{user?.email}</div>
                </div>
              </div>
              {authError && <p role="alert" className="text-[11px] text-coral">{authError}</p>}
              <button
                type="button"
                onClick={() => void signOut()}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-[var(--border-color)] text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {(undoStack.length > 0 || redoStack.length > 0) && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => void undo()}
              disabled={!undoStack.length || isHistoryActionPending}
              aria-label="Undo last change"
              title="Undo last change"
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => void redo()}
              disabled={!redoStack.length || isHistoryActionPending}
              aria-label="Redo last change"
              title="Redo last change"
              className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-40"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>
        )}
        {authError && <span role="alert" className="hidden max-w-48 text-[11px] text-coral lg:inline">{authError}</span>}
        <button
          type="button"
          onClick={() => handleTabClick('profile')}
          title={user?.email || 'Open profile'}
          className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold"
        >
          {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
