import React from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

export default function LoadingState({ stage }) {
  const stages = [
    'Understanding your goal...',
    'Selecting useful tools...',
    'Preparing your workspace...',
    'Connecting the information...',
    'Finalizing your layout...'
  ];

  const currentIdx = stages.findIndex(s => s === stage);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 text-center space-y-5">
        <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center text-indigo-600">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>

        <div>
          <h3 className="text-base font-bold text-slate-900">Adapting Workspace</h3>
          <p className="text-xs text-slate-500 mt-1">{stage || 'Analyzing instructions...'}</p>
        </div>

        <div className="space-y-2 text-left pt-2 border-t border-slate-100">
          {stages.map((st, i) => {
            const isDone = currentIdx > i;
            const isCurrent = currentIdx === i;

            return (
              <div
                key={i}
                className={`flex items-center gap-2 text-xs transition-colors ${
                  isCurrent ? 'text-indigo-600 font-semibold' : isDone ? 'text-emerald-600' : 'text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-200 shrink-0" />
                )}
                <span>{st.replace('...', '')}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
