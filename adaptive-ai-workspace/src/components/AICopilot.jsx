import React, { useState } from 'react';
import { Send, Sparkles, Sliders, ChevronDown, ChevronUp, Undo2 } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext.jsx';

export default function AICopilot() {
  const {
    workspace,
    adaptWorkspace,
    isGenerating,
    undo,
    canUndo,
  } = useWorkspace();

  const [input, setInput] = useState('');
  const [showPrompts, setShowPrompts] = useState(true);

  if (!workspace) return null;

  const demoSuggestions = [
    'Make this a 30-minute meeting and focus on technical feasibility.',
    'What happens if we delay the launch by two weeks?',
    'Why do you think this delay affects the launch?',
    'Compare delaying the launch with reducing the project scope.',
    'Turn the recommended option into an action plan.',
    'Make this more compact.',
    'Show the most important risks.',
    'Undo that change.',
  ];

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim() || isGenerating) return;
    const text = input.trim();
    setInput('');
    if (text.toLowerCase().includes('undo')) {
      undo();
    } else {
      adaptWorkspace(text);
    }
  };

  const handleQuickPrompt = (prompt) => {
    if (prompt.toLowerCase().includes('undo')) {
      undo();
    } else {
      adaptWorkspace(prompt);
    }
  };

  return (
    <div className="border-t border-slate-200 bg-white/95 backdrop-blur-xs p-3 sm:p-4 sticky bottom-0 z-20 shadow-lg">
      <div className="max-w-4xl mx-auto space-y-2.5">
        {/* Quick Suggestion Chips */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Copilot Prompts</span>
          </div>
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="text-[11px] text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            <span>{showPrompts ? 'Hide suggestions' : 'Show suggestions'}</span>
            {showPrompts ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {showPrompts && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {demoSuggestions.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={isGenerating}
                className="text-xs text-slate-700 hover:text-indigo-700 bg-slate-50 hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-200 rounded-full py-1 px-3 whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Form input */}
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Instruct your workspace (e.g. 'Make this a 30-minute meeting', 'What if launch is delayed?', 'Turn into action plan')..."
            className="w-full pl-4 pr-24 py-2.5 text-xs sm:text-sm bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl outline-none transition-all shadow-2xs"
            disabled={isGenerating}
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            {canUndo && (
              <button
                type="button"
                onClick={undo}
                title="Undo last change"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Undo2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
