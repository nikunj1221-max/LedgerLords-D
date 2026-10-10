import React, { useState } from 'react';
import WidgetContainer from './WidgetContainer.jsx';
import { renderWidgetComponent, COMPONENT_REGISTRY } from '../registry/components.jsx';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import {
  Plus, LayoutGrid, Layers, Info, Sparkles, CheckCircle2,
  Calendar, Clock, ShieldAlert, Sliders, ArrowRight, Eye,
  Compass, GitMerge, CheckSquare, ChevronRight
} from 'lucide-react';

// Section Grouping Definitions
const SECTION_DEFINITIONS = [
  {
    id: 'strategy',
    title: 'Executive Strategy & Kickoff Agenda',
    description: 'Strategic vision, meeting duration breakdown, and core stakeholder alignment',
    icon: Compass,
    accentBorder: 'border-indigo-300',
    headerBg: 'bg-indigo-50/80',
    iconColor: 'text-indigo-600',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    widgetTypes: ['ProjectOverview', 'Agenda', 'TeamMembers', 'NotesPanel'],
  },
  {
    id: 'delivery',
    title: 'Critical Path, Milestones & Delivery',
    description: 'Sequential delivery schedule, deliverables, and goal execution tracker',
    icon: Calendar,
    accentBorder: 'border-sky-300',
    headerBg: 'bg-sky-50/80',
    iconColor: 'text-sky-600',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    widgetTypes: ['Timeline', 'TaskList', 'GoalProgress'],
  },
  {
    id: 'risks',
    title: 'Risk Radar & Single Points of Failure',
    description: 'Active obstacles, engineering bottlenecks, and mitigation checklists',
    icon: ShieldAlert,
    accentBorder: 'border-amber-300',
    headerBg: 'bg-amber-50/80',
    iconColor: 'text-amber-600',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    widgetTypes: ['RiskList', 'BlockerList'],
  },
  {
    id: 'intelligence',
    title: 'Self-Proving Insights & Strategic Decisions',
    description: 'AI-verified findings, calculations, KPI trends, and decision trade-offs',
    icon: Sparkles,
    accentBorder: 'border-emerald-300',
    headerBg: 'bg-emerald-50/80',
    iconColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    widgetTypes: ['InsightList', 'DecisionComparison', 'SummaryCards', 'ChartWidget'],
  },
];

export default function WorkspaceCanvas() {
  const {
    workspace,
    resolvedData,
    activeFilters,
    activeSimulation,
    togglePinWidget,
    removeWidget,
    addWidget,
    setFilter,
    openEvidence,
    setIntentMode,
    userPreferences,
    openTimeMachine,
    latestChangeSummary,
    sectionViewMode,
    setSectionViewMode,
  } = useWorkspace();

  const [showAddMenu, setShowAddMenu] = useState(false);

  if (!workspace) return null;

  const handleWidgetAction = (actionType, payload) => {
    if (actionType === 'filter_region') {
      setFilter('region', payload);
    } else if (actionType === 'open_evidence') {
      openEvidence(payload);
    } else if (actionType === 'select_decision') {
      setIntentMode('execute');
    }
  };

  const handleAddWidget = (type) => {
    const defaultTitles = {
      ProjectOverview: 'Project Scope & Goals',
      Agenda: 'Meeting Schedule',
      SummaryCards: 'KPI Overview',
      ChartWidget: 'Performance Trends',
      TaskList: 'Execution Action Items',
      Timeline: 'Delivery Timeline',
      RiskList: 'Risks & Unknowns',
      DecisionComparison: 'Strategy Comparison',
      InsightList: 'Self-Proving Insights',
      TeamMembers: 'Team Stakeholders',
      NotesPanel: 'Discussion Prompts',
      GoalProgress: 'Workflow Progress',
    };

    const newWidget = {
      id: `w-${Date.now()}`,
      type,
      title: defaultTitles[type] || type,
      description: 'Custom added widget',
      dataSourceIds: ['project-overview', 'project-tasks'],
      layout: { colSpan: 6, order: (workspace.widgets?.length || 0) + 1 },
      isPinned: false,
      explanation: 'Manually added by user to customized workspace view.',
      config: {},
    };

    addWidget(newWidget);
    setShowAddMenu(false);
  };

  // Sort widgets: pinned first, then by layout order
  const sortedWidgets = [...workspace.widgets].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return (a.layout?.order || 0) - (b.layout?.order || 0);
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
      {/* 1. Prominent "Adaptation Result & Intelligence" Callout Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-600" />
              Adaptation Result · v{workspace.version}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs font-semibold text-slate-700 capitalize">
              Intent Mode: <strong className="text-indigo-600">{workspace.intentMode}</strong>
            </span>
          </div>

          {/* Section View Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 self-start sm:self-auto">
            <button
              onClick={() => setSectionViewMode('sections')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sectionViewMode === 'sections'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" />
                Grouped Sections
              </span>
            </button>
            <button
              onClick={() => setSectionViewMode('grid')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sectionViewMode === 'grid'
                  ? 'bg-white text-indigo-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-1">
                <LayoutGrid className="w-3.5 h-3.5" />
                Compact Grid
              </span>
            </button>
          </div>
        </div>

        {/* Change summary text */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="text-sm font-bold text-slate-900">
              {latestChangeSummary || workspace.explanation}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {workspace.explanation}
            </p>
          </div>
        </div>

        {/* Quick outcome metric strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Objective</span>
            <p className="font-semibold text-slate-800 truncate mt-0.5">{workspace.goal}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Projected Rollout</span>
            <p className="font-semibold text-indigo-700 font-mono mt-0.5">
              {activeSimulation ? activeSimulation.simulatedMilestoneDate : 'Nov 20, 2026'}
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Time Machine State</span>
            <p className="font-semibold text-slate-800 mt-0.5">
              {activeSimulation ? `${activeSimulation.projectShiftDays}d shift` : 'Baseline plan'}
            </p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg border border-slate-200/60">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Tools</span>
            <p className="font-semibold text-slate-800 font-mono mt-0.5">
              {workspace.widgets.length} widgets configured
            </p>
          </div>
        </div>
      </div>

      {/* 2. Main Content Display: Grouped Sections or Compact Grid */}
      {sortedWidgets.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-300 rounded-xl bg-white p-8">
          <LayoutGrid className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">Workspace canvas is empty</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">Add registered widgets or describe a new goal in the Copilot.</p>
          <button
            onClick={() => setShowAddMenu(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            <span>Add Widget</span>
          </button>
        </div>
      ) : sectionViewMode === 'sections' ? (
        /* SECTION GROUPS VIEW */
        <div className="space-y-8">
          {SECTION_DEFINITIONS.map(sec => {
            const secWidgets = sortedWidgets.filter(w => sec.widgetTypes.includes(w.type));
            if (secWidgets.length === 0) return null;

            const Icon = sec.icon;

            return (
              <section
                key={sec.id}
                className="bg-white/60 rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4"
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-lg ${sec.headerBg} border ${sec.accentBorder} flex items-center justify-center shrink-0 shadow-2xs`}>
                      <Icon className={`w-4 h-4 ${sec.iconColor}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                          {sec.title}
                        </h3>
                        <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${sec.badgeColor}`}>
                          {secWidgets.length} tool{secWidgets.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {sec.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Grid of Widgets */}
                <div className="grid grid-cols-12 gap-4 items-start">
                  {secWidgets.map(widget => (
                    <WidgetContainer
                      key={widget.id}
                      widget={widget}
                      onTogglePin={togglePinWidget}
                      onRemove={removeWidget}
                      density={userPreferences?.density}
                    >
                      {renderWidgetComponent(widget.type, {
                        widget,
                        data: resolvedData,
                        activeFilters,
                        activeSimulation,
                        onAction: handleWidgetAction,
                      })}
                    </WidgetContainer>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* COMPACT GRID VIEW */
        <div className="grid grid-cols-12 gap-4 items-start">
          {sortedWidgets.map(widget => (
            <WidgetContainer
              key={widget.id}
              widget={widget}
              onTogglePin={togglePinWidget}
              onRemove={removeWidget}
              density={userPreferences?.density}
            >
              {renderWidgetComponent(widget.type, {
                widget,
                data: resolvedData,
                activeFilters,
                activeSimulation,
                onAction: handleWidgetAction,
              })}
            </WidgetContainer>
          ))}
        </div>
      )}

      {/* Canvas Toolbar: Add Widget button & Modal */}
      <div className="pt-2 flex items-center justify-between border-t border-slate-200">
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 px-3.5 py-2 rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-600" />
            <span>Insert Widget</span>
          </button>

          {showAddMenu && (
            <div className="absolute left-0 bottom-full mb-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-30 max-h-80 overflow-y-auto">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 block mb-1.5">
                Approved Widget Catalog
              </span>
              <div className="space-y-0.5 text-xs">
                {Object.keys(COMPONENT_REGISTRY).map(key => (
                  <button
                    key={key}
                    onClick={() => handleAddWidget(key)}
                    className="w-full text-left py-1.5 px-2.5 rounded-md hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition-colors font-medium cursor-pointer"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
          <span>{sortedWidgets.length} total widgets</span>
          <span>·</span>
          <span>Mode: {workspace.intentMode}</span>
        </div>
      </div>
    </div>
  );
}
