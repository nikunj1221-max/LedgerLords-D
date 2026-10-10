import React, { useState } from 'react';
import { ArrowRight, Sparkles, Layers, Sliders, ShieldCheck } from 'lucide-react';

export default function GoalInput({ onSubmit, isGenerating }) {
  const [goal, setGoal] = useState('');

  const examples = [
    'Prepare for a new project kickoff meeting.',
    'Analyze why sales are declining.',
    'Create a recovery plan for a delayed project.',
    'Plan a product launch.',
    'Prepare for an important client meeting.'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!goal.trim()) return;
    onSubmit(goal.trim());
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 space-y-10">
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Your workspace, your way.
        </h1>
        <p className="text-slate-600 text-base max-w-xl mx-auto leading-relaxed">
          Tell us what you want to accomplish. Your workspace will adapt to your goal.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative rounded-xl border border-slate-300 bg-white shadow-xs focus-within:border-indigo-600 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What are you trying to accomplish today? (e.g., I want to launch a new project, so help me prepare for the kickoff meeting)"
            rows={3}
            className="w-full p-4 text-slate-900 placeholder-slate-400 text-sm sm:text-base outline-none resize-none rounded-xl"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="p-3 bg-slate-50/70 border-t border-slate-100 rounded-b-xl flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">Enter</kbd> to submit
            </span>
            <button
              type="submit"
              disabled={!goal.trim() || isGenerating}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm py-2 px-5 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <span>Build my workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
          Example goals & demo starters
        </span>
        <div className="flex flex-wrap gap-2">
          {examples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setGoal(ex);
                onSubmit(ex);
              }}
              className="text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg py-2 px-3 transition-colors text-left"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
        <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wide">
            <Sliders className="w-4 h-4" />
            <span>Time Machine</span>
          </div>
          <p className="text-xs text-slate-600">
            Simulate what-if outcomes and evaluate impacts deterministically before committing decisions.
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wide">
            <Layers className="w-4 h-4" />
            <span>Intent Morphing</span>
          </div>
          <p className="text-xs text-slate-600">
            Dynamically reorganize tools to Explore situation, Decide between options, or Execute deliverables.
          </p>
        </div>

        <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" />
            <span>Self-Proving Insights</span>
          </div>
          <p className="text-xs text-slate-600">
            Inspect explicit calculations, mathematical formulas, observed data, and transparent assumptions.
          </p>
        </div>
      </div>
    </div>
  );
}
