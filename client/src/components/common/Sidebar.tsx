import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  History,
  RotateCcw,
  Folder,
  Minus,
  Plus,
  Home,
  Box,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const Sidebar: React.FC = () => {
  const {
    sidebarOpen,
    currentPlan,
    hiddenComponentIds,
    history,
    restoreFromHistory,
    setSidebarOpen
  } = useWorkspaceStore();

  const [sectionsExpanded, setSectionsExpanded] = useState(true);
  const [historyExpanded, setHistoryExpanded] = useState(true);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  if (!currentPlan) return null;

  const components = currentPlan.components.filter(
    component => !hiddenComponentIds.includes(component.id)
  );

  const previousPlans = history.filter(item => item.plan !== currentPlan);

  const handleComponentClick = (componentId: string) => {
    setSelectedComponentId(componentId);
    document
      .getElementById(`workspace-component-${componentId}`)
      ?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  return (
    <>
      <AnimatePresence initial={false}>
        {!sidebarOpen && (
          <motion.button
            type="button"
            key="open-sidebar"
            initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.18 }}
            onClick={() => setSidebarOpen(true)}
            aria-label="Show navigation panel"
            aria-expanded={false}
            title="Show navigation panel"
            className="fixed left-0 top-1/2 z-30 -translate-y-1/2 rounded-r-xl border border-l-0 border-[var(--border-color)] bg-card p-2 text-[var(--text-secondary)] shadow-md transition-colors hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
          >
            <PanelLeftOpen className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {sidebarOpen && (
    <motion.aside
      initial={prefersReducedMotion ? false : { opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: prefersReducedMotion ? 0.01 : 0.2, ease: 'easeOut' }}
      className="w-72 mt-1 bg-[#f8f9fb] dark:bg-[#13111e] border-r border-slate-200 dark:border-white/10 flex flex-col h-full shrink-0 z-20 transition-colors select-none"
    >
      {/* Header with ✦ Menu matching screenshot */}
      <div className="p-4 pb-2">
        <div className="flex items-center justify-between gap-2.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <svg className="w-5 h-5 text-slate-900 dark:text-white fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M12 2L14.6 9.4L22 12L14.6 14.6L12 22L9.4 14.6L2 12L9.4 9.4L12 2Z" />
            </svg>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Menu
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Hide navigation panel"
            aria-expanded={true}
            title="Hide navigation panel"
            className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-black/5 hover:text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary dark:text-slate-300 dark:hover:bg-white/10"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        {/* Current plan context tag */}
        <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-200/60 dark:bg-white/5 border border-slate-300/40 dark:border-white/5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {currentPlan.intentLabel}
          </div>
          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
            {currentPlan.title}
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {/* Home / Overview */}
        <button
          type="button"
          onClick={scrollToTop}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-xs font-medium transition-all group"
        >
          <Home className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white stroke-[1.8]" />
          <span>Home</span>
        </button>

        {/* Relevant Sections - styled like the dark black pill "Threads -" in screenshot */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setSectionsExpanded(!sectionsExpanded)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-sm transition-all"
          >
            <div className="flex items-center gap-2.5 truncate text-white dark:text-slate-900">
              <Box className="w-4 h-4 stroke-[2] shrink-0 text-white dark:text-slate-900" />
              <span className="truncate text-white dark:text-slate-900 font-medium">Relevant Sections</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="text-[10px] opacity-70">({components.length})</span>
              {sectionsExpanded ? (
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </div>
          </button>

          {/* Nested Children with vertical hierarchy line and folder icons */}
          {sectionsExpanded && (
            <div className="relative ml-5 pl-4 border-l-2 border-slate-300/80 dark:border-slate-800 my-2 space-y-1.5">
              {/* Connector dot on the tree line */}
              <div className="absolute -left-[5px] top-4 w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />

              {components.length > 0 ? (
                components.map((component, idx) => {
                  const isSelected = selectedComponentId === component.id || (!selectedComponentId && idx === 0);
                  return (
                    <button
                      key={component.id}
                      type="button"
                      onClick={() => handleComponentClick(component.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-full text-xs transition-all text-left truncate ${isSelected
                          ? 'bg-white dark:bg-[#252037] text-slate-900 dark:text-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-black/[0.03] dark:hover:bg-white/[0.04] font-medium'
                        }`}
                    >
                      <Folder
                        className={`w-4 h-4 shrink-0 transition-colors ${isSelected
                            ? 'text-slate-900 dark:text-white stroke-[2]'
                            : 'text-slate-500 dark:text-slate-500 stroke-[1.8]'
                          }`}
                      />
                      <span className="truncate">{component.title}</span>
                    </button>
                  );
                })
              ) : (
                <div className="py-2 text-[11px] text-slate-400 dark:text-slate-500 italic pl-1">
                  No visible sections
                </div>
              )}
            </div>
          )}
        </div>

        {/* Previous Results / History - styled like "Messages (2)" in screenshot */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setHistoryExpanded(!historyExpanded)}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-slate-700 dark:text-slate-300 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] text-xs font-medium transition-all group"
          >
            <div className="flex items-center gap-3">
              <History className="w-4 h-4 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white stroke-[1.8]" />
              <span>Previous results</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold flex items-center justify-center">
                {previousPlans.length}
              </span>
              {historyExpanded ? (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <Plus className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
          </button>

          {/* History Sublist */}
          {historyExpanded && (
            <div className="relative ml-5 pl-4 border-l-2 border-slate-300/80 dark:border-slate-800 my-2 space-y-2">
              {previousPlans.length > 0 ? (
                previousPlans.map((item, index) => (
                  <div
                    key={`${item.plan.id}-${index}`}
                    className="p-2.5 rounded-2xl bg-white dark:bg-[#1f1b2e] border border-slate-200/70 dark:border-white/5 shadow-sm space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-1 text-[11px]">
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {item.intentLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {item.timestamp}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {item.plan.title}
                    </div>
                    <button
                      type="button"
                      onClick={() => restoreFromHistory(index)}
                      className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore result
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-2 text-[11px] text-slate-400 dark:text-slate-500 italic pl-1">
                  Earlier results will appear here
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
