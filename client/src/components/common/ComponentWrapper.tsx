import React, { useState } from 'react';
import { Pin, EyeOff, Info, HelpCircle } from 'lucide-react';
import { ComponentSpec } from '../../types/workspace';
import { useWorkspaceStore } from '../../store/workspaceStore';

interface ComponentWrapperProps {
  spec: ComponentSpec;
  children: React.ReactNode;
}

export const ComponentWrapper: React.FC<ComponentWrapperProps> = ({ spec, children }) => {
  const { togglePinComponent, hideComponent } = useWorkspaceStore();
  const [showExplanation, setShowExplanation] = useState(false);

  // Map colSpan to Tailwind grid classes
  const colSpanClasses = {
    1: 'col-span-12 md:col-span-6 lg:col-span-3',
    2: 'col-span-12 md:col-span-6 lg:col-span-6',
    3: 'col-span-12 lg:col-span-9',
    4: 'col-span-12',
  }[spec.colSpan || 2];

  return (
    <div
      className={`${colSpanClasses} group relative rounded-xl bg-card border border-[var(--border-color)] hover:border-primary/50 transition-all duration-200 shadow-sm flex flex-col`}
    >
      {/* Header bar with title and actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-card/70 rounded-t-xl">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-2 h-2 rounded-full bg-primary/80 animate-pulse" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)] truncate" title={spec.title}>
            {spec.title}
          </h3>
        </div>

        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Explanation tooltip button */}
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            title="Why is this component here?"
            className={`p-1 rounded-md text-xs transition-colors ${
              showExplanation
                ? 'bg-primary/20 text-primary'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Pin component toggle */}
          <button
            onClick={() => togglePinComponent(spec.id)}
            title={spec.pinned ? 'Unpin component' : 'Pin component to persist across goal changes'}
            className={`p-1 rounded-md text-xs transition-colors ${
              spec.pinned
                ? 'bg-amber-500/20 text-amber-500 font-bold'
                : 'text-[var(--text-secondary)] hover:text-amber-500 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${spec.pinned ? 'fill-amber-500' : ''}`} />
          </button>

          {/* Hide component button */}
          <button
            onClick={() => hideComponent(spec.id)}
            title="Hide component"
            className="p-1 rounded-md text-xs text-[var(--text-secondary)] hover:text-coral hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Explanation drawer if toggled */}
      {showExplanation && (
        <div className="px-4 py-2.5 bg-primary/10 border-b border-primary/20 text-xs text-[var(--text-secondary)] flex items-start gap-2">
          <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-primary">Selection Rationale:</div>
            <p className="mt-0.5 text-[var(--text-primary)]">{spec.explanation}</p>
            {spec.evidence && (
              <p className="mt-1 text-[var(--text-secondary)] font-mono text-[11px]">
                <strong className="text-teal-600 dark:text-teal-400">Supporting Evidence:</strong> {spec.evidence}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Component Inner Body */}
      <div className="p-4 flex-1 flex flex-col">{children}</div>
    </div>
  );
};
