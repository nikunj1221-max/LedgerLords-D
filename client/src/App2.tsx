import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from './store/workspaceStore';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CommandBar } from './components/common/CommandBar';
import { WorkspaceExplanationPanel } from './components/general/WorkspaceExplanationPanel';
import { ComponentWrapper } from './components/common/ComponentWrapper';
import { ClarificationModal } from './components/common/ClarificationModal';
import { NotificationToast } from './components/common/NotificationToast';
import { getComponentForType } from './components/registry';
import { Eye, Loader2, Sparkles } from 'lucide-react';
import { AuthScreen } from './components/auth/AuthScreen';
import { DataOnboardingScreen } from './components/auth/DataOnboardingScreen';
import { useAuthStore } from './store/authStore';
import { UIPlan } from './types/workspace';

const demoFollowUps: Record<string, Array<{ label: string; prompt: string }>> = {
  client_meeting_prep: [
    { label: 'Which open issues should we prioritize?', prompt: 'Which open issues should we prioritize in this meeting?' },
    { label: 'Draft a focused meeting agenda', prompt: 'Draft a concise agenda based on the current client briefing.' },
    { label: 'Summarize recent client communications', prompt: 'Summarize recent communications relevant to this meeting.' },
  ],
  product_usage_investigation: [
    { label: 'Which features drove the usage change?', prompt: 'Which features contributed most to the usage change?' },
    { label: 'Compare the trend with recent releases', prompt: 'Compare the usage change with recent product releases.' },
    { label: 'Check related support incidents', prompt: 'Show support incidents that may help explain this usage trend.' },
  ],
  overdue_tasks_triage: [
    { label: 'Which overdue tasks need attention first?', prompt: 'Prioritize overdue tasks by impact and dependencies.' },
    { label: 'Review workload by assignee', prompt: 'Group overdue work by assignee and highlight workload bottlenecks.' },
    { label: 'Prepare a project triage plan', prompt: 'Create a triage plan for the most urgent overdue project work.' },
  ],
  default: [
    { label: 'Summarize the key findings', prompt: 'Summarize the key findings from this workspace.' },
    { label: 'What needs attention first?', prompt: 'Identify which items need attention first and explain why.' },
    { label: 'Show related details for the top priority', prompt: 'Show more details about the highest-priority item in this workspace.' },
  ],
};

function getFollowUpSuggestions(plan: UIPlan) {
  const previousIntent = plan.contextReused?.previousIntent;
  const intent = plan.intent === 'workspace_refinement' && typeof previousIntent === 'string'
    ? previousIntent
    : plan.intent;
  const suggestions = (plan.actions ?? [])
    .filter(action => action.actionType === 'run_prompt' && typeof action.payload?.prompt === 'string')
    .map(action => ({ label: action.label, prompt: action.payload!.prompt as string }))
    .filter(suggestion => suggestion.prompt.trim());
  const seenPrompts = new Set(suggestions.map(suggestion => suggestion.prompt.trim().toLowerCase()));

  for (const suggestion of demoFollowUps[intent] ?? demoFollowUps.default) {
    if (suggestions.length >= 3) break;
    if (!seenPrompts.has(suggestion.prompt.toLowerCase())) {
      suggestions.push(suggestion);
      seenPrompts.add(suggestion.prompt.toLowerCase());
    }
  }

  return suggestions.slice(0, 3);
}

export const App: React.FC = () => {
  const [showDataUpload, setShowDataUpload] = useState(false);
  const {
    status: authStatus,
    user,
    checkSession,
    showAuthSuccessAnimation,
    dismissAuthSuccessAnimation,
  } = useAuthStore();
  const {
    currentPlan,
    isAdapting,
    error,
    hiddenComponentIds,
    unhideAllComponents,
    executeMockAction,
    submitPrompt,
    theme
  } = useWorkspaceStore();
  const clearWorkspace = useWorkspaceStore(state => state.clearWorkspace);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    void checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!showAuthSuccessAnimation) return;
    const timeout = window.setTimeout(dismissAuthSuccessAnimation, 2500);
    return () => window.clearTimeout(timeout);
  }, [showAuthSuccessAnimation, dismissAuthSuccessAnimation]);

  if (authStatus === 'checking') {
    return (
      <main className="min-h-screen bg-[var(--bg-color)] text-[var(--text-secondary)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          Checking your session…
        </div>
      </main>
    );
  }

  if (authStatus === 'unauthenticated' || authStatus === 'unavailable') {
    return <AuthScreen unavailable={authStatus === 'unavailable'} onRetry={() => void checkSession()} />;
  }

  if (showAuthSuccessAnimation) {
    return (
      <main
        role="status"
        aria-live="polite"
        className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex flex-col items-center justify-center p-6"
      >
        <img
          src="/loaders/successful_login.svg"
          alt=""
          aria-hidden="true"
          className="h-56 w-56"
        />
        <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
          {user?.name ? `Welcome, ${user.name}!` : 'You’re signed in!'}
        </p>
      </main>
    );
  }

  if (!user?.onboardingComplete) {
    return (
      <DataOnboardingScreen
        onComplete={() => {
          clearWorkspace();
          setShowDataUpload(false);
        }}
      />
    );
  }

  if (showDataUpload) {
    return (
      <DataOnboardingScreen
        onComplete={() => {
          clearWorkspace();
          setShowDataUpload(false);
        }}
        onCancel={() => setShowDataUpload(false)}
      />
    );
  }

  const visibleComponents = (isAdapting ? [] : currentPlan?.components || []).filter(
    c => !hiddenComponentIds.includes(c.id)
  );
  const followUpSuggestions = currentPlan ? getFollowUpSuggestions(currentPlan) : [];

  return (
    <div className="h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200 overflow-hidden">
      {/* Top Application Bar */}
      <Header onUploadData={() => setShowDataUpload(true)} />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar />

        {/* Dynamic Workspace Canvas */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-8 bg-transparent ${!currentPlan && !isAdapting ? 'flex items-center' : ''
            }`}
        >
          <div className={`w-full max-w-7xl mx-auto space-y-6 ${!currentPlan && !isAdapting ? 'lg:max-w-4xl' : ''}`}>
            {/* Natural-Language Command Bar */}
            <CommandBar />

            {/* Error Banner */}
            {error && (
              <div className="p-4 rounded-xl bg-coral/15 border border-coral/30 text-coral text-xs flex items-center justify-between">
                <span>{error}</span>
              </div>
            )}

            {/* Active Workspace Header & Quick Actions */}
            {currentPlan && !isAdapting && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                      {currentPlan.title}
                    </h1>
                    <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                      {currentPlan.intentLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1.5 max-w-2xl leading-relaxed">
                    {currentPlan.subtitle}
                  </p>
                </div>

                {/* Plan-specific Top Actions */}
                {currentPlan.actions?.some(action => action.actionType !== 'run_prompt') && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentPlan.actions.filter(action => action.actionType !== 'run_prompt').map(action => (
                      <button
                        key={action.id}
                        onClick={() => executeMockAction(action.actionType, action.payload)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${action.variant === 'primary'
                            ? 'bg-primary hover:bg-primary-hover text-white shadow-glow-violet/30'
                            : action.variant === 'secondary'
                              ? 'bg-card hover:bg-plum-800 text-teal-600 dark:text-teal-300 border border-teal-500/30'
                              : 'bg-card hover:bg-plum-800 text-[var(--text-primary)] border border-[var(--border-color)]'
                          }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-primary" />
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {currentPlan && !isAdapting && followUpSuggestions.length > 0 && (
              <section aria-label="Suggested follow-up questions" className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Suggested follow-up questions
                </h2>
                <div className="flex flex-wrap gap-2">
                  {followUpSuggestions.map(suggestion => (
                    <button
                      key={suggestion.prompt}
                      type="button"
                      onClick={() => void submitPrompt(suggestion.prompt)}
                      className="rounded-xl border border-[var(--border-color)] bg-card px-3.5 py-2 text-left text-xs text-[var(--text-secondary)] transition-colors hover:border-primary/50 hover:text-[var(--text-primary)] sm:text-sm"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Expandable Explanation Panel */}
            {/* {!isAdapting && <WorkspaceExplanationPanel />} */}

            {/* Hidden Components Restore Banner */}
            {!isAdapting && hiddenComponentIds.length > 0 && (
              <div className="p-2.5 rounded-lg bg-card border border-[var(--border-color)] text-xs flex items-center justify-between text-[var(--text-secondary)]">
                <span>{hiddenComponentIds.length} component(s) hidden from active canvas.</span>
                <button
                  onClick={unhideAllComponents}
                  className="text-primary hover:underline font-medium flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Restore All Hidden
                </button>
              </div>
            )}

            {/* Dynamic Component Grid */}
            {isAdapting ? (
              <div className="py-16 text-center space-y-3" role="status" aria-live="polite">
                <img
                  src="/loaders/workspace-loading.svg"
                  alt=""
                  aria-hidden="true"
                  className="w-20 h-20 mx-auto"
                />
                <p className="text-sm text-[var(--text-secondary)]">Building a workspace for your goal...</p>
              </div>
            ) : currentPlan ? (
              <motion.div
                layout
                className="grid grid-cols-12 gap-5"
                transition={{
                  layout: { type: 'spring', stiffness: 350, damping: 32 }
                }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {visibleComponents.map(spec => {
                    const Component = getComponentForType(spec.type);

                    return (
                      <motion.div
                        key={spec.id}
                        id={`workspace-component-${spec.id}`}
                        layout
                        initial={{ opacity: 0, y: 24, scale: 0.92, filter: 'blur(4px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: -16, filter: 'blur(4px)' }}
                        transition={{
                          layout: { type: 'spring', stiffness: 350, damping: 32 },
                          opacity: { duration: 0.28, ease: 'easeOut' },
                          scale: { duration: 0.28 },
                          y: { duration: 0.28, ease: 'easeOut' }
                        }}
                        className={`${{
                            1: 'col-span-12 md:col-span-6 lg:col-span-3',
                            2: 'col-span-12 md:col-span-6 lg:col-span-6',
                            3: 'col-span-12 lg:col-span-9',
                            4: 'col-span-12',
                          }[spec.colSpan || 2]
                          }`}
                      >
                        <ComponentWrapper spec={spec}>
                          <Component spec={spec} />
                        </ComponentWrapper>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            ) : null}
          </div>
        </main>
      </div>

      {/* Disambiguation Modal for Ambiguous Prompts */}
      <ClarificationModal />

      {/* Feedback Toast */}
      <NotificationToast />
    </div>
  );
};
export default App;
