import React, { useState } from 'react';
import { RefreshCw, CheckCircle, PlusCircle, MinusCircle, Info, X } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const WorkspaceChangeSummary: React.FC = () => {
  const { currentPlan, previousPlan } = useWorkspaceStore();
  const [dismissed, setDismissed] = useState(false);

  // If there is no change summary or user dismissed it
  if (!currentPlan?.changeSummary || dismissed) return null;
  // If it's the very first initial plan with no previous plan, skip or show compact
  if (!previousPlan) return null;

  const { added, updated, retained, removed, reason } = currentPlan.changeSummary;

  return (
    <div className="mb-6 p-4 rounded-xl bg-card border border-[var(--border-color)] shadow-md relative transition-all animate-fadeIn">
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-3 right-3 p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        title="Dismiss summary"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/20 text-primary border border-primary/30 shrink-0 mt-0.5">
          <RefreshCw className="w-4 h-4" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">Workspace Adapted</h4>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              ({previousPlan.intentLabel} → {currentPlan.intentLabel})
            </span>
          </div>

          <p className="text-xs text-[var(--text-secondary)] mt-1 mb-3">{reason}</p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {/* Added */}
            {added.length > 0 && (
              <div className="p-2.5 rounded-lg bg-teal/10 border border-teal/20">
                <div className="flex items-center gap-1.5 font-semibold text-teal-700 dark:text-teal-400 mb-1">
                  <PlusCircle className="w-3.5 h-3.5" />
                  Added ({added.length})
                </div>
                <div className="text-[11px] text-[var(--text-primary)] line-clamp-3">
                  {added.join(', ')}
                </div>
              </div>
            )}

            {/* Retained */}
            {retained.length > 0 && (
              <div className="p-2.5 rounded-lg bg-[var(--canvas-color)] border border-[var(--border-color)]">
                <div className="flex items-center gap-1.5 font-semibold text-[var(--text-secondary)] mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-mint" />
                  Retained ({retained.length})
                </div>
                <div className="text-[11px] text-[var(--text-muted)] line-clamp-3">
                  {retained.join(', ')}
                </div>
              </div>
            )}

            {/* Updated */}
            {updated.length > 0 && (
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  <Info className="w-3.5 h-3.5" />
                  Updated ({updated.length})
                </div>
                <div className="text-[11px] text-[var(--text-primary)] line-clamp-3">
                  {updated.join(', ')}
                </div>
              </div>
            )}

            {/* Removed */}
            {removed.length > 0 && (
              <div className="p-2.5 rounded-lg bg-coral/10 border border-coral/20">
                <div className="flex items-center gap-1.5 font-semibold text-coral mb-1">
                  <MinusCircle className="w-3.5 h-3.5" />
                  De-prioritized ({removed.length})
                </div>
                <div className="text-[11px] text-[var(--text-primary)] line-clamp-3">
                  {removed.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
