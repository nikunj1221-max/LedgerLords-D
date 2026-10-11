import React from 'react';
import { History, Layers, RotateCcw } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const Sidebar: React.FC = () => {
  const {
    sidebarOpen,
    currentPlan,
    hiddenComponentIds,
    history,
    isAdapting,
    restoreFromHistory
  } = useWorkspaceStore();

  if (!sidebarOpen || !currentPlan || isAdapting) return null;

  const components = currentPlan.components.filter(
    component => !hiddenComponentIds.includes(component.id)
  );

  return (
    <aside className="w-72 bg-[var(--canvas-color)] border-r border-[var(--border-color)] flex flex-col h-[calc(100vh-4rem)] sticky top-16 z-20 shrink-0 transition-colors">
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          Current Workspace
        </div>
        <p className="mt-2 text-xs font-semibold text-[var(--text-primary)]">
          {currentPlan.intentLabel}
        </p>
        <p className="mt-1 text-[11px] text-[var(--text-muted)] line-clamp-2">
          {currentPlan.title}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav aria-label="Current workspace sections" className="p-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5">
            Relevant sections
          </div>
          {components.length > 0 ? (
            <div className="space-y-1.5">
              {components.map(component => (
                <button
                  key={component.id}
                  type="button"
                  onClick={() => {
                    document
                      .getElementById(`workspace-component-${component.id}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="w-full text-left p-2.5 rounded-xl border border-[var(--border-color)] bg-card text-xs text-[var(--text-primary)] hover:border-primary/50 transition-colors"
                >
                  <span className="block truncate font-medium">{component.title}</span>
                  <span className="block mt-1 truncate text-[10px] text-[var(--text-muted)]">
                    {component.dataSource}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">No visible sections in this workspace.</p>
          )}
        </nav>

        <section aria-label="Previous workspace results" className="p-4 pt-0">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-teal" />
              Previous results
            </span>
            <span className="text-[10px] text-[var(--text-muted)]">{history.filter(item => item.plan !== currentPlan).length}</span>
          </div>
          {history.filter(item => item.plan !== currentPlan).length > 0 ? (
            <div className="space-y-1.5">
              {history.map((item, index) => item.plan !== currentPlan && (
                <button
                  key={`${item.plan.id}-${index}`}
                  type="button"
                  onClick={() => restoreFromHistory(index)}
                  className="w-full text-left p-2.5 rounded-xl border border-[var(--border-color)] bg-card text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary/50 transition-colors"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{item.intentLabel}</span>
                    <span className="shrink-0 text-[10px] text-[var(--text-muted)]">{item.timestamp}</span>
                  </span>
                  <span className="block mt-1 truncate text-[11px]">{item.plan.title}</span>
                  <span className="mt-2 flex items-center gap-1 text-[10px] text-primary">
                    <RotateCcw className="w-3 h-3" />
                    Restore result
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-muted)]">Earlier results will appear here.</p>
          )}
        </section>
      </div>
    </aside>
  );
};
