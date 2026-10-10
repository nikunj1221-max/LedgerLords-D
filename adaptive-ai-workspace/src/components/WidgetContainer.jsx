import React, { useState } from 'react';
import { Pin, X, HelpCircle, Sparkles } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

const WIDGET_CATEGORIES = {
  ProjectOverview: { name: 'Strategy', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', topBorder: 'border-t-indigo-600' },
  Agenda: { name: 'Kickoff Agenda', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', topBorder: 'border-t-indigo-600' },
  TeamMembers: { name: 'Stakeholders', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', topBorder: 'border-t-indigo-600' },
  NotesPanel: { name: 'Discussion', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200', topBorder: 'border-t-indigo-600' },

  Timeline: { name: 'Timeline & Critical Path', badge: 'bg-sky-50 text-sky-700 border-sky-200', topBorder: 'border-t-sky-600' },
  TaskList: { name: 'Action Items', badge: 'bg-sky-50 text-sky-700 border-sky-200', topBorder: 'border-t-sky-600' },
  GoalProgress: { name: 'Execution Plan', badge: 'bg-sky-50 text-sky-700 border-sky-200', topBorder: 'border-t-sky-600' },

  RiskList: { name: 'Risk Radar', badge: 'bg-amber-50 text-amber-800 border-amber-200', topBorder: 'border-t-amber-500' },
  BlockerList: { name: 'Blockers', badge: 'bg-amber-50 text-amber-800 border-amber-200', topBorder: 'border-t-amber-500' },

  InsightList: { name: 'Self-Proving Insights', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', topBorder: 'border-t-emerald-600' },
  DecisionComparison: { name: 'Decision Matrix', badge: 'bg-purple-50 text-purple-800 border-purple-200', topBorder: 'border-t-purple-600' },
  SummaryCards: { name: 'KPI Analytics', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', topBorder: 'border-t-emerald-600' },
  ChartWidget: { name: 'Trends', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200', topBorder: 'border-t-emerald-600' },
};

export default function WidgetContainer({
  widget,
  onTogglePin,
  onRemove,
  children,
  density = 'comfortable'
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { recentUpdatedWidgetIds } = useWorkspace();

  const isRecentlyUpdated = recentUpdatedWidgetIds?.includes(widget.id);

  const colClasses = {
    4: 'col-span-12 lg:col-span-4',
    5: 'col-span-12 lg:col-span-5',
    6: 'col-span-12 lg:col-span-6',
    7: 'col-span-12 lg:col-span-7',
    8: 'col-span-12 lg:col-span-8',
    12: 'col-span-12',
  }[widget.layout?.colSpan || 12] || 'col-span-12';

  const isCompact = density === 'compact';
  const categoryMeta = WIDGET_CATEGORIES[widget.type] || {
    name: 'Tool',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    topBorder: 'border-t-indigo-600'
  };

  return (
    <div
      className={`${colClasses} bg-white rounded-xl border border-slate-200 shadow-xs border-t-2 ${categoryMeta.topBorder} flex flex-col transition-all relative ${
        isRecentlyUpdated ? 'ring-2 ring-indigo-500/20 shadow-sm' : ''
      }`}
    >
      {/* Widget Header */}
      <div className={`flex items-center justify-between border-b border-slate-100 ${isCompact ? 'p-2.5' : 'p-3.5'}`}>
        <div className="min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${categoryMeta.badge}`}>
              {categoryMeta.name}
            </span>
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
              {widget.title}
            </h3>
            {widget.isPinned && (
              <span className="text-[10px] font-mono font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200 shrink-0">
                Pinned
              </span>
            )}
            {isRecentlyUpdated && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0 flex items-center gap-0.5 animate-pulse">
                <Sparkles className="w-2.5 h-2.5" /> Updated
              </span>
            )}
          </div>
          {widget.description && (
            <p className="text-[11px] text-slate-500 truncate mt-1">
              {widget.description}
            </p>
          )}
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          {widget.explanation && (
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              title="Why was this widget chosen?"
              className={`p-1 rounded hover:text-indigo-600 hover:bg-slate-50 transition-colors ${
                showExplanation ? 'text-indigo-600 bg-indigo-50/50' : ''
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => onTogglePin && onTogglePin(widget.id)}
            title={widget.isPinned ? 'Unpin widget' : 'Pin widget'}
            className={`p-1 rounded hover:bg-slate-50 transition-colors ${
              widget.isPinned ? 'text-indigo-600' : 'hover:text-slate-700'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${widget.isPinned ? 'fill-indigo-600' : ''}`} />
          </button>

          <button
            onClick={() => onRemove && onRemove(widget.id)}
            title="Remove widget from canvas"
            className="p-1 rounded hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Rationale / Explanation drawer if toggled */}
      {showExplanation && widget.explanation && (
        <div className="p-3 bg-indigo-50/70 border-b border-indigo-100 text-xs text-indigo-950 flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-indigo-900">Adaptive Rationale:</span>
            <p className="text-indigo-800 leading-relaxed">{widget.explanation}</p>
          </div>
        </div>
      )}

      {/* Widget Content Body */}
      <div className={`flex-1 ${isCompact ? 'p-3' : 'p-4'}`}>
        {children}
      </div>
    </div>
  );
}
