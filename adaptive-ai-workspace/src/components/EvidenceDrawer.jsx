import React from 'react';
import {
  X, ShieldCheck, Database, Calculator, HelpCircle,
  AlertCircle, ArrowRight, CheckCircle2, Layers
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function EvidenceDrawer() {
  const {
    selectedInsight,
    evidenceDrawerOpen,
    closeEvidence,
    setIntentMode,
    addWidget,
  } = useWorkspace();

  if (!evidenceDrawerOpen || !selectedInsight) return null;

  const typeConfig = {
    observed_fact: {
      label: 'Observed Fact',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      desc: 'Extracted directly from verified, recorded enterprise datasets.',
    },
    calculated_result: {
      label: 'Calculated Result',
      color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
      desc: 'Derived via deterministic algorithmic formula and dependency propagation.',
    },
    hypothesis: {
      label: 'Hypothesis',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
      desc: 'A plausible deduction requiring additional experimental or customer validation.',
    },
    recommendation: {
      label: 'Recommendation',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
      desc: 'Proposed course of action evaluated against multi-variable trade-offs.',
    },
    unknown: {
      label: 'Unknown',
      color: 'bg-slate-100 text-slate-800 border-slate-200',
      desc: 'Insufficient data in the current state to prove or disprove.',
    }
  }[selectedInsight.type] || {
    label: 'Calculated Result',
    color: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    desc: 'Deterministic evaluation.',
  };

  const handleConvertToTask = () => {
    setIntentMode('execute');
    closeEvidence();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Self-Proving Evidence Drawer</h3>
              <p className="text-[11px] text-slate-500">Transparent AI auditing, proof chain, & calculations</p>
            </div>
          </div>
          <button
            onClick={closeEvidence}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          {/* Classification Banner */}
          <div className="p-3 rounded-lg border space-y-1 bg-white border-slate-200">
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded border text-[11px] font-mono font-semibold ${typeConfig.color}`}>
                {typeConfig.label}
              </span>
              <span className="font-mono text-slate-400">{selectedInsight.id || 'INS-AUDIT'}</span>
            </div>
            <p className="text-slate-600 pt-1 leading-relaxed">{typeConfig.desc}</p>
          </div>

          {/* Statement */}
          <div>
            <h4 className="font-semibold text-slate-500 uppercase tracking-wider text-[11px] mb-1.5">
              Verified Finding
            </h4>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm font-semibold text-slate-900 leading-snug">
              "{selectedInsight.statement}"
            </div>
          </div>

          {/* Source Dataset */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Grounding Data Source</span>
            </div>
            <p className="font-mono text-[11px] text-slate-800 bg-slate-50 p-2 rounded border border-slate-100">
              {selectedInsight.sourceDataset || 'project-tasks / sales-history'}
            </p>
            {selectedInsight.relevantValues && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-medium">Relevant Extracted Values:</span>
                <div className="mt-1 space-y-1">
                  {Object.entries(selectedInsight.relevantValues).map(([k, v]) => (
                    <div key={k} className="flex justify-between font-mono text-[11px]">
                      <span className="text-slate-500">{k}:</span>
                      <span className="font-semibold text-slate-900">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Explicit Formula & Math Steps */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2.5">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Calculator className="w-4 h-4 text-indigo-600" />
              <span>Deterministic Calculation & Step-by-Step Math</span>
            </div>
            {selectedInsight.formula && (
              <div className="p-2 bg-indigo-50/60 rounded border border-indigo-100 font-mono text-[11px] text-indigo-900">
                <strong>Formula:</strong> {selectedInsight.formula}
              </div>
            )}
            {selectedInsight.calculationSteps && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-600">Propagation Steps:</span>
                <ol className="space-y-1 text-slate-700">
                  {selectedInsight.calculationSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded border border-slate-100">
                      <span className="font-mono text-indigo-600 font-bold">{i + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Explicit Assumptions */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
            <h5 className="font-semibold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
              <span>Underlying Assumptions:</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-600">
              {(selectedInsight.assumptions || ['Baseline team allocation constant']).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </div>

          {/* Validation Requirements (for hypotheses) */}
          {selectedInsight.validationRequirement && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 space-y-1 text-amber-900">
              <span className="font-semibold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5" />
                Validation Gate Needed to Prove Hypothesis:
              </span>
              <p className="text-[11px] leading-relaxed">{selectedInsight.validationRequirement}</p>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={closeEvidence}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Close Audit
          </button>
          <button
            onClick={handleConvertToTask}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Convert to Action Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
