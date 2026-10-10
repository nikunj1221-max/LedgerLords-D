import React from 'react';
import { HelpCircle, Check, ArrowRight } from 'lucide-react';
import { useWorkspaceStore } from '../../store/workspaceStore';

export const ClarificationModal: React.FC = () => {
  const { currentPlan, answerClarification, isAdapting } = useWorkspaceStore();

  if (!currentPlan?.clarificationRequired || !currentPlan.clarificationQuestion) {
    return null;
  }

  const { question, options, entityKey } = currentPlan.clarificationQuestion;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg rounded-2xl bg-card border-2 border-primary/50 shadow-2xl p-6 space-y-5">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/20 text-primary border border-primary/30 shrink-0">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-teal-400">
              Disambiguation Check
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">{question}</h3>
            <p className="text-xs text-gray-300 mt-1">
              Multiple accounts match your prompt. Selecting the intended client ensures only relevant metrics, attendees, and issues are presented.
            </p>
          </div>
        </div>

        {/* Selectable Options */}
        <div className="space-y-2.5">
          {options.map(opt => (
            <button
              key={opt.id}
              onClick={() => answerClarification(entityKey, opt.id)}
              disabled={isAdapting}
              className="w-full text-left p-3.5 rounded-xl bg-plum-900/50 hover:bg-primary/20 border border-border/70 hover:border-primary transition-all flex items-center justify-between group"
            >
              <div>
                <div className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                  {opt.label}
                </div>
                {opt.description && (
                  <div className="text-xs text-gray-400 mt-0.5">{opt.description}</div>
                )}
              </div>
              <div className="p-1.5 rounded-lg bg-canvas text-gray-400 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          ))}
        </div>

        <div className="text-[11px] text-gray-400 text-center pt-2 border-t border-border/40">
          NexusFlow will immediately adapt the workspace around your selected account.
        </div>
      </div>
    </div>
  );
};
