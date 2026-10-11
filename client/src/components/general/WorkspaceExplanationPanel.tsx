import React from 'react';
import { Brain, Layers, Database, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const WorkspaceExplanationPanel: React.FC = () => {
  const { currentPlan, explanationPanelExpanded, toggleExplanationPanel, provider } = useWorkspaceStore();

  if (!currentPlan) return null;

  const { intentLabel, explanations, entities, dataSources, components, changeSummary, contextReused } = currentPlan;

  return (
    <div className="mb-6 rounded-xl border border-[var(--border-color)] bg-card overflow-hidden transition-all duration-300 shadow-sm">
      {/* Clickable Header */}
      <button
        onClick={toggleExplanationPanel}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
            <Brain className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Why this workspace?</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                {intentLabel}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal/15 text-teal-700 dark:text-teal-300 border border-teal/30">
                Mode: {provider === 'llm' ? 'AI Engine (LLM)' : 'Deterministic Planner'}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 line-clamp-1">
              {explanations?.overallRationale || 'Workspace composed based on identified user intent.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span>{explanationPanelExpanded ? 'Collapse' : 'Inspect Rationale'}</span>
          {explanationPanelExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded Rationale Details */}
      {explanationPanelExpanded && (
        <div className="p-5 border-t border-[var(--border-color)] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs bg-[var(--canvas-color)]/50">
          {/* Column 1: Detected Intent & Extracted Entities */}
          <div className="p-3.5 rounded-lg bg-card border border-[var(--border-color)] space-y-2">
            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Intent & Extracted Entities
            </div>
            <div className="text-[var(--text-secondary)]">
              <span className="text-[var(--text-primary)] font-medium">Goal: </span>
              {currentPlan.prompt || intentLabel}
            </div>
            {Object.keys(entities || {}).length > 0 && (
              <div className="mt-2 space-y-1">
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wide font-mono">Entities:</span>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(entities).map(([key, val]) => (
                    <span
                      key={key}
                      className="px-2 py-0.5 rounded bg-primary/10 border border-primary/20 text-[11px] text-primary"
                    >
                      {key}: <strong className="text-[var(--text-primary)]">{String(val)}</strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {contextReused && Object.keys(contextReused).length > 0 && (
              <div className="mt-2 text-[11px] text-amber-600 dark:text-amber-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                <strong>Context Reused:</strong> {JSON.stringify(contextReused)}
              </div>
            )}
          </div>

          {/* Column 2: Data Sources & Rationale */}
          <div className="p-3.5 rounded-lg bg-card border border-[var(--border-color)] space-y-2">
            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Connected Data Sources
            </div>
            <div className="flex flex-wrap gap-1.5">
              {dataSources.map(src => (
                <span
                  key={src}
                  className="px-2 py-0.5 rounded bg-teal/10 border border-teal/20 text-teal-700 dark:text-teal-300 text-[11px] font-mono"
                >
                  {src}.json
                </span>
              ))}
            </div>
            <div className="mt-2 text-[var(--text-secondary)] leading-relaxed">
              {explanations?.overallRationale}
            </div>
          </div>

          {/* Column 3: Component Composition & Adaptation */}
          <div className="p-3.5 rounded-lg bg-card border border-[var(--border-color)] space-y-2">
            <div className="font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-coral" />
              Component Selection ({components.length} active)
            </div>
            <div className="text-[var(--text-secondary)] text-[11px]">
              {changeSummary ? (
                <div>
                  <div className="text-teal-700 dark:text-teal-400 font-medium">Added: {changeSummary.added.join(', ') || 'None'}</div>
                  <div className="text-[var(--text-primary)]">Retained: {changeSummary.retained.join(', ') || 'None'}</div>
                  {changeSummary.removed.length > 0 && (
                    <div className="text-coral">Removed: {changeSummary.removed.join(', ')}</div>
                  )}
                </div>
              ) : (
                <div>All components selected for optimal task completion.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
