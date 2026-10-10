import React, { useState } from 'react';
import {
  Sliders, X, Calendar, AlertTriangle, Check, ArrowRight,
  TrendingUp, RefreshCw, Calculator, ShieldCheck
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';
import { apiService } from '../services/api.js';

export default function TimeMachinePanel() {
  const {
    timeMachineOpen,
    setTimeMachineOpen,
    activeSimulation,
    applyScenario,
    discardScenario,
  } = useWorkspace();

  const [selectedScenarioType, setSelectedScenarioType] = useState('delay_launch');
  const [delayWeeks, setDelayWeeks] = useState(2);
  const [simulation, setSimulation] = useState(activeSimulation);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync with active simulation
  React.useEffect(() => {
    if (activeSimulation) {
      setSimulation(activeSimulation);
    }
  }, [activeSimulation]);

  if (!timeMachineOpen) return null;

  const handleRunSimulation = async (type, weeks) => {
    setSelectedScenarioType(type);
    setIsSimulating(true);
    try {
      const res = await apiService.runSimulation(type, { weeks });
      if (res && res.simulation) {
        setSimulation(res.simulation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const currentSim = simulation || activeSimulation;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Workspace Time Machine — What-If Simulator
              </h3>
              <p className="text-[11px] text-slate-500">
                Deterministic forward scheduling engine; baseline remains safe until scenario is applied.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTimeMachineOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Scenario Selector Tabs */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Select What-If Scenario
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: 'delay_launch', label: 'Delay Launch', desc: 'Simulate kickoff slip' },
                { id: 'reduce_scope', label: 'Reduce Scope', desc: 'Defer non-critical items' },
                { id: 'reassign_task', label: 'Reassign Task', desc: 'Parallelize QA work' },
                { id: 'add_resource', label: 'Add Contractor', desc: 'Accelerate backend' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleRunSimulation(tab.id, delayWeeks)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    selectedScenarioType === tab.id
                      ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className={`font-semibold text-xs ${selectedScenarioType === tab.id ? 'text-indigo-900' : 'text-slate-900'}`}>
                    {tab.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 truncate">{tab.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* If delay_launch, show delay weeks slider */}
          {selectedScenarioType === 'delay_launch' && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-900">Kickoff Delay Duration:</span>
                <p className="text-slate-500 text-[11px] mt-0.5">Adjust weeks to recalculate downstream critical path</p>
              </div>
              <div className="flex items-center gap-3">
                {[1, 2, 3, 4].map(w => (
                  <button
                    key={w}
                    onClick={() => {
                      setDelayWeeks(w);
                      handleRunSimulation('delay_launch', w);
                    }}
                    className={`px-3 py-1.5 rounded-md font-mono text-xs font-bold transition-all ${
                      delayWeeks === w
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {w} Week{w > 1 ? 's' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Cards: Baseline vs Scenario */}
          {currentSim && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baseline */}
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Baseline (Current Plan)
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Locked</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500">Public Launch Milestone</span>
                  <p className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-0.5">
                    {currentSim.baselineMilestoneDate || '2026-11-20'}
                  </p>
                </div>
                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>Estimated Baseline Budget:</span>
                    <span className="font-mono font-semibold">$180,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Path Duration:</span>
                    <span className="font-mono font-semibold">39 calendar days</span>
                  </div>
                </div>
              </div>

              {/* Simulated Scenario */}
              <div className="p-4 bg-indigo-50/50 rounded-lg border border-indigo-200 space-y-3 ring-1 ring-indigo-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                    Simulated Scenario
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600 font-semibold">
                    {currentSim.projectShiftDays > 0 ? `+${currentSim.projectShiftDays} Days` : 'On Schedule'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-indigo-600 font-medium">Projected Milestone Date</span>
                  <p className="text-xl font-bold font-mono tabular-nums text-indigo-950 mt-0.5">
                    {currentSim.simulatedMilestoneDate}
                  </p>
                </div>
                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-indigo-100">
                  <div className="flex justify-between">
                    <span>Estimated Cost Impact:</span>
                    <span className="font-mono font-bold text-slate-900">{currentSim.costImpact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Affected Downstream Tasks:</span>
                    <span className="font-mono font-bold text-slate-900">{currentSim.affectedTasksCount} tasks</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Affected Tasks Breakdown */}
          {currentSim?.affectedTasks?.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                Tasks Affected by Dependency Propagation ({currentSim.affectedTasks.length})
              </span>
              <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                {currentSim.affectedTasks.map(t => (
                  <div key={t.id} className="p-2.5 bg-white flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-slate-700">{t.id}</span>
                        <span className="font-medium text-slate-900">{t.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">Owner: {t.owner}</p>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-slate-400 line-through text-[11px] mr-2">{t.originalDueDate}</span>
                      <span className="text-rose-700 font-bold">{t.simulatedDueDate}</span>
                      <span className="ml-2 text-[10px] text-rose-600 font-semibold bg-rose-50 px-1 py-0.5 rounded">
                        +{t.shiftDays}d
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions & Limitations (Self-Proving Rigor) */}
          {currentSim && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-600" />
                  Calculation Assumptions:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {currentSim.assumptions.map((a, i) => (
                    <li key={i}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Known Limitations:
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  {currentSim.limitations.map((l, i) => (
                    <li key={i}>{l}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => discardScenario()}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Discard Scenario
          </button>

          <button
            onClick={() => currentSim && applyScenario(currentSim)}
            disabled={!currentSim}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>Apply Scenario to Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
