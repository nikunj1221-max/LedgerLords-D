import React from 'react';
import {
  Menu, Undo2, Redo2, Sliders, History, FilterX, HelpCircle,
  FileQuestion, CheckCircle2
} from 'lucide-react';
import IntentModeSwitcher from './IntentModeSwitcher.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function TopBar({ onOpenSidebar }) {
  const {
    workspace,
    canUndo,
    canRedo,
    undo,
    redo,
    openTimeMachine,
    activeFilters,
    clearFilters,
    setHistoryDrawerOpen,
    setClarificationModalOpen,
  } = useWorkspace();

  const hasActiveFilters = Object.keys(activeFilters).length > 0;
  const unresolvedQuestions = workspace?.missingInfo?.filter(m => !m.resolved)?.length || 0;

  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-xs px-4 flex items-center justify-between gap-4 sticky top-0 z-20 shrink-0">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="md:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-md hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 truncate">
              {workspace ? workspace.title : 'Adaptive AI Workspace'}
            </h2>
            {workspace && (
              <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded shrink-0">
                v{workspace.version}
              </span>
            )}
          </div>
          {workspace?.goal && (
            <p className="text-[11px] text-slate-500 truncate hidden sm:block max-w-md">
              Goal: {workspace.goal}
            </p>
          )}
        </div>
      </div>

      {/* Middle: Intent Mode Switcher */}
      {workspace && (
        <div className="hidden lg:flex items-center shrink-0">
          <IntentModeSwitcher />
        </div>
      )}

      {/* Right: Actions (Undo, Redo, Time Machine, History, Filter) */}
      <div className="flex items-center gap-2 shrink-0">
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-2 py-1 rounded-md hover:bg-rose-100 transition-colors"
            title="Clear active cross-widget filters"
          >
            <FilterX className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Filters</span>
          </button>
        )}

        {unresolvedQuestions > 0 && (
          <button
            onClick={() => setClarificationModalOpen(true)}
            className="flex items-center gap-1 text-xs text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md hover:bg-amber-100 transition-colors"
            title="View missing workspace details"
          >
            <FileQuestion className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">{unresolvedQuestions} Missing Info</span>
          </button>
        )}

        {/* Undo & Redo */}
        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white">
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo recent workspace change"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-slate-200" />
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo workspace change"
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>

        {/* Time Machine Trigger */}
        {workspace && (
          <button
            onClick={() => openTimeMachine('delay_launch', { weeks: 2 })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Open Workspace Time Machine to simulate what-if outcomes"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Time Machine</span>
          </button>
        )}

        {/* History Trigger */}
        {workspace && (
          <button
            onClick={() => setHistoryDrawerOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            title="Workspace Version History"
          >
            <History className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
}
