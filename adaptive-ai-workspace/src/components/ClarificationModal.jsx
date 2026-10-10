import React, { useState } from 'react';
import { FileQuestion, X, Check, Save } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function ClarificationModal() {
  const {
    workspace,
    clarificationModalOpen,
    setClarificationModalOpen,
    updateMissingInfo,
  } = useWorkspace();

  if (!clarificationModalOpen || !workspace) return null;

  const missingList = workspace.missingInfo || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Missing Information Checklist</h3>
              <p className="text-[11px] text-slate-500">Fill in unresolved project variables directly</p>
            </div>
          </div>
          <button
            onClick={() => setClarificationModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {missingList.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">All known variables are resolved.</p>
          ) : (
            missingList.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">{item.label}</span>
                  {item.required && (
                    <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-medium">
                      Required
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-[11px]">{item.description}</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item.value || ''}
                    onChange={(e) => updateMissingInfo(item.id, e.target.value)}
                    placeholder="Enter value to resolve..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-md outline-none text-xs focus:border-indigo-600"
                  />
                  {item.value ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Resolved
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={() => setClarificationModalOpen(false)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
