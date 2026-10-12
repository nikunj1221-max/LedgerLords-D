import React, { useState } from 'react';
import { Sparkles, CornerDownLeft, Loader2 } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const CommandBar: React.FC = () => {
  const [input, setInput] = useState('');
  const {
    submitPrompt,
    isAdapting,
    pendingPrompt,
    currentPlan,
    promptFeedback,
    clearPromptFeedback
  } = useWorkspaceStore();
  const isInitial = !currentPlan && !isAdapting;
  const normalizePrompt = (prompt: string) => prompt.trim().replace(/\s+/g, ' ').toLocaleLowerCase();
  const isDuplicatePrompt = input.trim() !== '' &&
    normalizePrompt(input) === normalizePrompt(pendingPrompt || '');

  const starterPrompts = [
    { label: 'Prepare a new meeting', prompt: 'Prepare a new meeting with selected attendees.' },
    { label: 'Investigate a product usage drop', prompt: 'Investigate why product usage dropped this week.' },
    { label: 'Review overdue project work', prompt: 'Show me the overdue project work that needs attention first.' }
  ];

  const handleSend = () => {
    if (!input.trim() || isDuplicatePrompt) return;
    submitPrompt(input.trim());
    setInput('');
  };

  return (
    <div className={`mb-6 ${isInitial ? 'mx-auto w-full max-w-4xl' : ''}`}>
      {/* Main Command Input Box */}
      <div className={`relative rounded-2xl bg-card border-2 border-primary/50 focus-within:border-primary transition-all shadow-md ${
        isInitial ? 'p-3 md:p-4 shadow-xl' : 'p-2'
      }`}>
        <div className={`flex items-center gap-3 ${isInitial ? 'px-3 py-2 md:gap-4 md:px-4 md:py-3' : 'px-3 py-1.5'}`}>
          <div className={`rounded-xl bg-primary/20 text-primary shrink-0 ${isInitial ? 'p-3' : 'p-2'}`}>
            {isAdapting ? (
              <Loader2 className={`${isInitial ? 'w-6 h-6' : 'w-5 h-5'} animate-spin`} />
            ) : (
              <Sparkles className={`${isInitial ? 'w-6 h-6' : 'w-5 h-5'} animate-pulse`} />
            )}
          </div>

          <input
            type="text"
            placeholder={
              currentPlan
                ? 'Enter a new goal or follow-up...'
                : 'What would you like to work on?'
            }
            value={input}
            maxLength={1000}
            onChange={e => {
              setInput(e.target.value);
              clearPromptFeedback();
            }}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className={`w-full bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none font-medium ${
              isInitial ? 'text-base md:text-xl' : 'text-sm md:text-base'
            }`}
          />

          <button
            onClick={handleSend}
            disabled={!input.trim() || isDuplicatePrompt}
            style={
              input.trim() && !isDuplicatePrompt
                ? { background: 'linear-gradient(135deg, #471ca8 0%, #884ab2 50%, #ff8008 100%)' }
                : undefined
            }
            className={`rounded-xl font-semibold flex items-center gap-2 transition-all shrink-0 ${
              isInitial ? 'px-5 py-3 text-sm md:text-base' : 'px-4 py-2.5 text-xs md:text-sm'
            } ${
              input.trim() && !isDuplicatePrompt
                ? 'text-white shadow-md hover:opacity-95 shadow-[#471ca8]/30'
                : 'bg-black/5 dark:bg-white/5 text-[var(--text-muted)] cursor-not-allowed'
            }`}
          >
            {isAdapting && isDuplicatePrompt ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Working...</span>
              </>
            ) : (
              <>
                <span>{isAdapting ? 'Send another goal' : 'Adapt Workspace'}</span>
                <CornerDownLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {promptFeedback && (
        <div
          className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm"
          role="alert"
        >
          <p className="font-medium text-[var(--text-primary)]">{promptFeedback.message}</p>
          {promptFeedback.suggestedPrompts.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {promptFeedback.suggestedPrompts.map(suggestion => (
                <button
                  key={suggestion.label}
                  type="button"
                  onClick={() => {
                    setInput(suggestion.prompt);
                    clearPromptFeedback();
                  }}
                  className="rounded-lg border border-primary/30 bg-card px-3 py-2 text-xs font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/5"
                >
                  {suggestion.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isInitial && (
        <div className="mt-5 space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Or start with a suggested goal
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {starterPrompts.map(suggestion => (
              <button
                key={suggestion.label}
                type="button"
                onClick={() => submitPrompt(suggestion.prompt)}
                disabled={normalizePrompt(suggestion.prompt) === normalizePrompt(pendingPrompt || '')}
                className="px-3.5 py-2 rounded-xl bg-card border border-[var(--border-color)] text-xs md:text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-primary/50 transition-colors"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
