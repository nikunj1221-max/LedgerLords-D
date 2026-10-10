import React, { useState } from 'react';
import {
  Calendar, Clock, CheckCircle2, AlertTriangle, ArrowRight,
  TrendingDown, TrendingUp, Users, DollarSign, Target, ShieldAlert,
  HelpCircle, ChevronRight, Calculator, Plus, Eye, Check
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

/**
 * 1. Project Overview Widget
 */
export function ProjectOverviewWidget({ widget, data, onAction }) {
  const overview = data?.['project-overview']?.data || {};

  return (
    <div className="space-y-4 text-sm text-slate-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</span>
          <p className="font-semibold text-slate-900 mt-0.5">{overview.status || 'Planning'}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Target Launch</span>
          <p className="font-semibold text-indigo-700 mt-0.5">{overview.targetLaunchDate || '2026-11-20'}</p>
        </div>
        <div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Estimated Budget</span>
          <p className="font-semibold text-slate-900 tabular-nums font-mono mt-0.5">{overview.estimatedBudget || '$180,000'}</p>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">Strategic Objective</h4>
        <p className="text-slate-800 leading-relaxed bg-white p-3 rounded border border-slate-100">
          {overview.objective || 'Coordinate alignment across product, engineering, and growth for kickoff readiness.'}
        </p>
      </div>

      {overview.successCriteria && (
        <div>
          <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Key Success Metrics</h4>
          <ul className="space-y-1.5">
            {overview.successCriteria.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * 2. Agenda Widget (Interactive with Duration Math)
 */
export function AgendaWidget({ widget, data, onAction }) {
  const agendaSource = data?.['meeting-agenda']?.data || {};
  const config = widget.config || {};
  const items = config.customItems || agendaSource.items || [];
  const focus = config.focus || agendaSource.focus || 'Kickoff Alignment';

  const totalCalculated = items.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-500">Duration:</span>
          <span className="font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
            {totalCalculated} minutes
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-600">
          <span className="text-slate-400">Focus:</span>
          <span className="font-medium text-slate-800">{focus}</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {items.map((item, idx) => (
          <div key={item.id || idx} className="p-2.5 bg-slate-50/70 hover:bg-slate-100/80 rounded-lg border border-slate-200/70 flex items-center justify-between gap-3 text-xs transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="font-mono text-slate-400 font-bold shrink-0 w-4 text-right">{idx + 1}.</span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                  {item.category === 'technical' && (
                    <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded">
                      Technical Priority
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.speaker || 'Team Lead'}</p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-1.5 font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-2xs">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>{item.duration}m</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
        <span>Deterministic duration check:</span>
        <span className="font-mono font-medium text-emerald-700">All items sum to {totalCalculated}m</span>
      </div>
    </div>
  );
}

/**
 * 3. Summary Cards Widget
 */
export function SummaryCardsWidget({ widget, data, activeFilters, onAction }) {
  const summary = data?.['sales-summary']?.data || {};

  const cards = [
    {
      label: 'Total Net Revenue',
      value: summary.totalRevenue || '$1,248,500',
      change: summary.revenueChange || '-14.2%',
      positive: !summary.revenueChange?.startsWith('-'),
      icon: DollarSign,
    },
    {
      label: 'Average Order Value',
      value: summary.averageOrderValue || '$420',
      change: summary.aovChange || '-6.8%',
      positive: !summary.aovChange?.startsWith('-'),
      icon: Target,
    },
    {
      label: 'Closed Deals',
      value: String(summary.closedDeals || 142),
      change: summary.dealsChange || '-18.4%',
      positive: !summary.dealsChange?.startsWith('-'),
      icon: Users,
    },
    {
      label: 'Conversion Rate',
      value: summary.conversionRate || '3.1%',
      change: summary.conversionChange || '-0.9%',
      positive: !summary.conversionChange?.startsWith('-'),
      icon: TrendingDown,
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div key={i} className="p-3 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-medium">{card.label}</span>
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1">
              {card.value}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs">
              <span className={`font-mono font-semibold ${card.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {card.change}
              </span>
              <span className="text-slate-400">vs previous period</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 4. Chart Widget (Recharts)
 */
export function ChartWidget({ widget, data, activeFilters, onAction }) {
  const config = widget.config || {};
  const isRegionChart = widget.dataSourceIds.includes('sales-by-region');

  if (isRegionChart) {
    const rawData = data?.['sales-by-region']?.data || [];
    return (
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={rawData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload[0]) {
                const clickedRegion = state.activePayload[0].payload.region;
                onAction && onAction('filter_region', clickedRegion);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="region" tick={{ fontSize: 10, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
            <Tooltip
              formatter={(val) => [`$${val.toLocaleString()}`, 'Revenue']}
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
            />
            <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} cursor="pointer" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[11px] text-center text-slate-400 mt-1">
          Click any regional bar to cross-filter connected KPI cards.
        </p>
      </div>
    );
  }

  // Timeseries revenue trend
  const trendData = data?.['sales-history']?.data || [];
  return (
    <div className="h-64 w-full pt-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
          <Tooltip
            formatter={(val, name) => [`$${val.toLocaleString()}`, name === 'revenue' ? 'Actual Revenue' : 'Target']}
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
          <Area type="monotone" dataKey="revenue" name="Actual Revenue" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
          <Area type="monotone" dataKey="target" name="Target" stroke="#cbd5e1" strokeDasharray="4 4" strokeWidth={1.5} fill="none" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * 5. Task List Widget
 */
export function TaskListWidget({ widget, data, onAction }) {
  const initialTasks = data?.['project-tasks']?.data || [];
  const [tasks, setTasks] = useState(initialTasks);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'completed' ? 'in_progress' : 'completed',
          progress: t.status === 'completed' ? 50 : 100,
        };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
        <span className="text-slate-500 font-medium">Deliverables ({tasks.length})</span>
        <span className="text-slate-500">
          Completed: <strong className="font-mono text-slate-800">{tasks.filter(t => t.status === 'completed').length}</strong> / {tasks.length}
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {tasks.map(task => (
          <div key={task.id} className="py-2.5 flex items-start justify-between gap-3 text-xs hover:bg-slate-50 px-1 rounded transition-colors">
            <div className="flex items-start gap-2.5 min-w-0">
              <button
                onClick={() => toggleTask(task.id)}
                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  task.status === 'completed'
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
              >
                {task.status === 'completed' && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <div className="min-w-0">
                <p className={`font-medium ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {task.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                  <span className="font-mono">{task.id}</span>
                  <span>·</span>
                  <span>{task.owner || 'Unassigned'}</span>
                  <span>·</span>
                  <span className="font-mono">Due {task.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {task.priority === 'critical' && (
                <span className="text-[10px] font-mono font-medium text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded">
                  Critical
                </span>
              )}
              {task.dependencies?.length > 0 && (
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded" title={`Depends on ${task.dependencies.join(', ')}`}>
                  {task.dependencies.length} dep{task.dependencies.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 6. Timeline Widget (Gantt & Baseline vs Scenario Comparison)
 */
export function TimelineWidget({ widget, data, activeSimulation, onAction }) {
  const baselineTasks = data?.['project-tasks']?.data || [];
  const simulationTasks = activeSimulation?.tasks || null;

  return (
    <div className="space-y-4">
      {activeSimulation && (
        <div className="p-2.5 bg-amber-50/80 border border-amber-200/80 rounded text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-amber-700" />
            <span>Time Machine Scenario Active: <strong>{activeSimulation.scenarioDescription}</strong></span>
          </div>
          <span className="font-mono font-semibold text-amber-800">
            {activeSimulation.projectShiftDays > 0 ? `+${activeSimulation.projectShiftDays} days shift` : 'On track'}
          </span>
        </div>
      )}

      <div className="space-y-2.5">
        {baselineTasks.map(task => {
          const simTask = simulationTasks?.find(st => st.id === task.id);
          const isShifted = simTask && simTask.totalShiftDays > 0;

          return (
            <div key={task.id} className="p-2 rounded bg-slate-50 border border-slate-100 text-xs">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-700">{task.id}</span>
                  <span className="font-medium text-slate-900">{task.name}</span>
                </div>
                <div className="font-mono text-slate-500">
                  {task.startDate} → {task.dueDate}
                </div>
              </div>

              {/* Baseline bar */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
                <div
                  className="bg-indigo-600 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.max(15, (task.duration || 1) * 7))}%` }}
                />
              </div>

              {/* Scenario diff bar if simulated */}
              {isShifted && (
                <div className="mt-1 flex items-center justify-between text-[11px] text-rose-700 font-mono">
                  <span>Shifted to: {simTask.simulatedDueDate}</span>
                  <span>+{simTask.totalShiftDays} days delay</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * 7. Risk List Widget
 */
export function RiskListWidget({ widget, data, onAction }) {
  const risks = data?.['project-blockers']?.data || [];

  return (
    <div className="space-y-3">
      {risks.map(r => (
        <div key={r.id} className="p-3 bg-white rounded border border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">{r.title}</span>
            <span className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-medium ${
              r.severity === 'critical' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {r.severity}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">{r.impact}</p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
            <span>Mitigation: {r.mitigation}</span>
            <button
              onClick={() => onAction && onAction('open_evidence', {
                statement: r.title,
                type: r.isHypothesis ? 'hypothesis' : 'observed_fact',
                sourceDataset: 'project-blockers',
                relevantValues: { severity: r.severity, impact: r.impact },
                calculationSteps: ['Evaluated against current sprint allocations and dependency graph.'],
                assumptions: ['No secondary engineer allocated.'],
                limitations: ['Vendor response timeframe is unverified.'],
              })}
              className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1"
            >
              <Eye className="w-3 h-3" /> Proof
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 8. Blocker List Widget
 */
export function BlockerListWidget({ widget, data, onAction }) {
  return <RiskListWidget widget={widget} data={data} onAction={onAction} />;
}

/**
 * 9. Self-Proving Insights Widget (Signature Innovation 3)
 */
export function InsightListWidget({ widget, data, onAction }) {
  const insights = [
    {
      id: 'INS-DELAY-1',
      statement: 'A 2-week kickoff delay pushes public launch from Nov 20 to Dec 4 (+14 days) via critical path.',
      type: 'calculated_result',
      sourceDataset: 'project-tasks (TASK-1 -> TASK-2 -> TASK-4 -> TASK-5)',
      relevantValues: { baselineDate: '2026-11-20', simulatedDate: '2026-12-04', criticalShift: '14 calendar days' },
      formula: 'earliestStartDate(T) = max(dueDate(Dep_i) + 1); dueDate(T) = earliestStartDate(T) + duration - 1',
      calculationSteps: [
        'TASK-1 delayed by 14 days -> finish moved to 2026-11-03',
        'TASK-2 depends on TASK-1 -> start moved to 2026-11-04, finish to 2026-11-17',
        'TASK-4 depends on TASK-2 -> start moved to 2026-11-18, finish to 2026-11-25',
        'TASK-5 depends on TASK-4 -> finish moved to 2026-12-03',
        'TASK-6 (Milestone) moved to 2026-12-04.'
      ],
      assumptions: [
        'Task durations remain unchanged without overtime compression',
        'Sequential dependencies are mandatory',
        'No additional engineering resources are allocated'
      ],
      limitations: [
        'Does not calculate unexpected vendor turnaround latency',
        'Uses standard calendar day schedule'
      ]
    },
    {
      id: 'INS-REGIONAL-1',
      statement: 'North America - West revenue dropped by 24.6% in Q3, accounting for 72% of total company decline.',
      type: 'observed_fact',
      sourceDataset: 'sales-by-region',
      relevantValues: { region: 'North America - West', revenue: '$310,000', change: '-24.6%' },
      calculationSteps: [
        'Extracted from historical ledger sales-by-region verified records.',
        'Net drop from $411,000 baseline to $310,000 actual.'
      ],
      assumptions: ['Direct currency exchange at parity'],
      limitations: ['Channel partner split data not separated']
    },
    {
      id: 'INS-HYP-1',
      statement: 'Deferred analytics module (Option B) will save 6 engineering days with minimal partner disruption.',
      type: 'hypothesis',
      sourceDataset: 'decision-options & project-tasks',
      relevantValues: { taskDurationDelta: '-5 days', costDelta: '$0' },
      calculationSteps: ['Estimated developer workload allocation.'],
      assumptions: ['Beta partners prioritize onboarding speed over visual charting.'],
      limitations: ['Partner acceptance survey has not been executed.'],
      validationRequirement: 'Validate with 3 lighthouse beta customers before committing scope freeze.'
    }
  ];

  const typeStyles = {
    observed_fact: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', label: 'Observed Fact' },
    calculated_result: { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', label: 'Calculated Result' },
    hypothesis: { bg: 'bg-amber-50 text-amber-800 border-amber-200', label: 'Hypothesis' },
    recommendation: { bg: 'bg-purple-50 text-purple-800 border-purple-200', label: 'Recommendation' },
    unknown: { bg: 'bg-slate-100 text-slate-800 border-slate-200', label: 'Unknown' },
  };

  return (
    <div className="space-y-3">
      {insights.map(item => {
        const style = typeStyles[item.type] || typeStyles.observed_fact;
        return (
          <div key={item.id} className="p-3.5 bg-slate-50/60 hover:bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2.5 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold font-mono ${style.bg}`}>
                {style.label}
              </span>
              <span className="text-[11px] font-mono text-slate-400 font-semibold">{item.id}</span>
            </div>

            <p className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">{item.statement}</p>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 text-[11px]">
              <span className="text-slate-500">Source: <code className="text-slate-700 bg-white border border-slate-200 px-1 py-0.5 rounded">{item.sourceDataset}</code></span>
              <button
                onClick={() => onAction && onAction('open_evidence', item)}
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 px-2.5 py-1 rounded-md shadow-2xs transition-colors"
              >
                <Eye className="w-3.5 h-3.5 text-indigo-600" /> Inspect Evidence & Math
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 10. Decision Comparison Widget
 */
export function DecisionComparisonWidget({ widget, data, onAction }) {
  const options = data?.['decision-options']?.data || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {options.map(opt => (
        <div key={opt.id} className={`p-4 rounded-xl border text-xs flex flex-col justify-between transition-all ${
          opt.recommended
            ? 'bg-indigo-50/70 border-2 border-indigo-600 shadow-sm ring-2 ring-indigo-500/20'
            : 'bg-white border-slate-300 shadow-2xs hover:border-slate-400'
        }`}>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-slate-500 text-[11px] font-bold">{opt.id}</span>
              {opt.recommended && (
                <span className="bg-indigo-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full shadow-2xs">
                  ★ Recommended Option
                </span>
              )}
            </div>
            <h4 className="font-bold text-slate-900 text-sm leading-snug">{opt.name}</h4>
            <p className="text-slate-600 text-xs leading-relaxed">{opt.description}</p>

            <div className="space-y-1.5 pt-2.5 border-t border-slate-200 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-slate-500">Cost Impact:</span>
                <span className="font-bold text-slate-900">{opt.calculatedCostImpact}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date Impact:</span>
                <span className="font-bold text-indigo-700">{opt.calculatedDateImpact}</span>
              </div>
            </div>

            <div className="pt-2 text-[11px] space-y-1">
              <p className="font-bold text-slate-700">Trade-offs & Scope:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                {opt.pros.slice(0, 2).map((p, i) => (
                  <li key={i} className="truncate">{p}</li>
                ))}
              </ul>
            </div>
          </div>

          <button
            onClick={() => onAction && onAction('select_decision', opt)}
            className={`mt-4 w-full py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              opt.recommended
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            Turn into Action Plan
          </button>
        </div>
      ))}
    </div>
  );
}

/**
 * 11. Team Members Widget
 */
export function TeamMembersWidget({ widget, data, onAction }) {
  const members = data?.['project-overview']?.data?.stakeholders || [];

  return (
    <div className="space-y-2">
      <div className="divide-y divide-slate-100 text-xs">
        {members.map((m, i) => (
          <div key={i} className="py-2 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-900">{m.name}</p>
              <p className="text-slate-500 text-[11px]">{m.role}</p>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
              {m.department}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 12. Notes Panel Widget
 */
export function NotesPanelWidget({ widget, data, onAction }) {
  const questions = data?.['project-overview']?.data?.discussionQuestions || [];

  return (
    <div className="space-y-2 text-xs">
      <p className="text-slate-500 mb-2">Key alignment prompts for kickoff:</p>
      <ul className="space-y-2">
        {questions.map((q, i) => (
          <li key={i} className="p-2 bg-slate-50 rounded border border-slate-100 text-slate-800 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
            <span>{q}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * 13. Goal Progress Widget (Innovation 4: Intent-to-Action)
 */
export function GoalProgressWidget({ widget, data, onAction }) {
  const [steps, setSteps] = useState([
    { id: 1, title: 'Confirm Project Objective with Stakeholders', done: true, owner: 'Elena Rostova', due: '2026-10-12' },
    { id: 2, title: 'Finalize Kickoff Agenda (30m Technical)', done: true, owner: 'Devon Patel', due: '2026-10-13' },
    { id: 3, title: 'Freeze Core Backend API Contracts', done: false, owner: 'Devon Patel', due: '2026-10-20' },
    { id: 4, title: 'Review 2-Week Delay Marketing Reschedule', done: false, owner: 'Sarah Jenkins', due: '2026-10-25' },
    { id: 5, title: 'Begin Integration Security Audit Window', done: false, owner: 'Aria Thorne', due: '2026-11-13' },
    { id: 6, title: 'Beta Partner Early Access Smoke Test', done: false, owner: 'Marcus Chen', due: '2026-11-25' },
    { id: 7, title: 'Deploy Production Release Candidate', done: false, owner: 'Devon Patel', due: '2026-12-02' },
    { id: 8, title: 'Execute Public Launch Event (Dec 4)', done: false, owner: 'All Leads', due: '2026-12-04' },
  ]);

  const toggleStep = (id) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s));
  };

  const completedCount = steps.filter(s => s.done).length;
  const percent = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-4">
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-slate-900">Launch Workflow Execution</span>
          <p className="text-slate-500 text-[11px] mt-0.5">{completedCount} of {steps.length} milestones completed</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${percent}%` }} />
          </div>
          <span className="font-mono font-bold text-slate-800">{percent}%</span>
        </div>
      </div>

      <div className="divide-y divide-slate-100 text-xs">
        {steps.map(s => (
          <div key={s.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 px-1 rounded transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => toggleStep(s.id)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                  s.done ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {s.done && <Check className="w-3 h-3 stroke-[3]" />}
              </button>
              <span className={`font-medium ${s.done ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {s.title}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono shrink-0">
              <span>{s.owner}</span>
              <span>·</span>
              <span>{s.due}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Approved Component Registry Map
 */
export const COMPONENT_REGISTRY = {
  ProjectOverview: ProjectOverviewWidget,
  Agenda: AgendaWidget,
  SummaryCards: SummaryCardsWidget,
  ChartWidget: ChartWidget,
  TaskList: TaskListWidget,
  Timeline: TimelineWidget,
  RiskList: RiskListWidget,
  BlockerList: BlockerListWidget,
  InsightList: InsightListWidget,
  DecisionComparison: DecisionComparisonWidget,
  TeamMembers: TeamMembersWidget,
  NotesPanel: NotesPanelWidget,
  GoalProgress: GoalProgressWidget,
};

/**
 * Registry Resolver
 */
export function renderWidgetComponent(type, props) {
  const Component = COMPONENT_REGISTRY[type];
  if (!Component) {
    return (
      <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded text-xs text-slate-500 text-center">
        Component type "{type}" is not in the approved registry.
      </div>
    );
  }
  return <Component {...props} />;
}
