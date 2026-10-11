import React from 'react';
import { Sparkles, Menu, Sun, Moon, Trash2, LogOut, Upload, Undo2, Redo2 } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';
import { useAuthStore } from '../../store/authStore';

interface HeaderProps {
  onUploadData: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onUploadData }) => {
  const {
    sidebarOpen,
    setSidebarOpen,
    isAdapting,
    currentPlan,
    clearWorkspace,
    theme,
    toggleTheme,
    undo,
    redo,
    undoStack,
    redoStack,
    isHistoryActionPending
  } = useWorkspaceStore();
  const { user, error: authError, signOut } = useAuthStore();

  return (
    <header className="h-16 px-6 border-b border-[var(--border-color)] bg-[var(--bg-color)]/95 backdrop-blur-md flex items-center justify-between sticky top-0 z-30 transition-colors">
      <div className="flex items-center gap-3">
        {currentPlan && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Toggle Navigation Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-tight text-[var(--text-primary)]">NexusFlow</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                Intent-to-Interface v2.0
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-secondary)]">Adaptive AI Workspace</div>
          </div>
        </div>
      </div>

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
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light Canvas' : 'Dark Plum'} Theme`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-card-hover text-xs text-[var(--text-primary)] border border-[var(--border-color)] transition-all font-medium"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-primary" />
              <span className="hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {currentPlan && (
          <button
            onClick={clearWorkspace}
            disabled={isAdapting}
            title="Clear the current workspace"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-card-hover text-xs text-[var(--text-primary)] border border-[var(--border-color)] transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5 text-[var(--text-secondary)]" />
            <span className="hidden sm:inline font-medium">Clear workspace</span>
          </button>
        )}
      </div>
    </header>
  );
};