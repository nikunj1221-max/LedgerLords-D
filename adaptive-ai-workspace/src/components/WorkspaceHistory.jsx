import React, { useState } from 'react';
import { History, X, RotateCcw, Clock, Layers, ArrowRight } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function WorkspaceHistory() {
  const {
    historyDrawerOpen,
    setHistoryDrawerOpen,
    history,
    workspace,
    restoreVersion,
  } = useWorkspace();

  const [inspectVersion, setInspectVersion] = useState(null);

  if (!historyDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Workspace History & Time Travel</h3>
              <p className="text-[11px] text-slate-500">Every goal adaptation, layout shift, and scenario committed</p>
            </div>
          </div>
          <button
            onClick={() => setHistoryDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Versions */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No previous versions recorded yet.
            </div>
          ) : (
            history.slice().reverse().map((record) => {
              const isCurrent = record.version === workspace?.version;
              const dateStr = new Date(record.timestamp).toLocaleTimeString();

              return (
                <div
                  key={record.version}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-indigo-50/50 border-indigo-300 ring-1 ring-indigo-200'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        v{record.version}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                          Active State
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dateStr}
                    </span>
                  </div>

                  <p className="font-medium text-slate-800 mt-2 text-xs leading-relaxed">
                    {record.changeSummary}
                  </p>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-mono">
                      {record.workspace?.widgets?.length || 0} widgets · Mode: {record.workspace?.intentMode}
                    </span>

                    {!isCurrent && (
                      <button
                        onClick={() => restoreVersion(record.version)}
                        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore This State</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center">
          Restoring creates a safe new version without overwriting prior audit snapshots.
        </div>
      </div>
    </div>
  );
}
