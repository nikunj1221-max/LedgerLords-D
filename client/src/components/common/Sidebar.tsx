import React from 'react';
import { Layers } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const Sidebar: React.FC = () => {
  const { sidebarOpen, currentPlan, hiddenComponentIds, isAdapting } = useWorkspaceStore();

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

      <nav aria-label="Current workspace sections" className="flex-1 overflow-y-auto p-4">
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
    </aside>
  );
};
