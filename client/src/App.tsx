import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspaceStore } from './store/workspaceStore';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CommandBar } from './components/common/CommandBar';
import { WorkspaceExplanationPanel } from './components/general/WorkspaceExplanationPanel';
import { WorkspaceChangeSummary } from './components/general/WorkspaceChangeSummary';
import { ComponentWrapper } from './components/common/ComponentWrapper';
import { ClarificationModal } from './components/common/ClarificationModal';
import { NotificationToast } from './components/common/NotificationToast';
import { getComponentForType } from './components/registry';
import { Eye, Loader2, Sparkles } from 'lucide-react';
import { AuthScreen } from './components/auth/AuthScreen';
import { useAuthStore } from './store/authStore';

export const App: React.FC = () => {
  const {
    status: authStatus,
    user: authUser,
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
    theme
  } = useWorkspaceStore();

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
          className="h-56 w-56"
        />
        <p className="mt-2 text-sm font-medium text-[var(--text-secondary)]">
          {authUser?.name
            ? `Welcome, ${authUser.name}!`
            : 'You’re signed in!'}
        </p>
      </main>
    );
  }

  const visibleComponents = (isAdapting ? [] : currentPlan?.components || []).filter(
    c => !hiddenComponentIds.includes(c.id)
  );

  return (
    <div className="min-h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200">
      {/* Top Application Bar */}
      <Header />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar />

        {/* Dynamic Workspace Canvas */}
        <main
          className={`flex-1 overflow-y-auto p-4 md:p-8 bg-transparent ${
            !currentPlan && !isAdapting ? 'flex items-center' : ''
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

            {/* Workspace Change Summary */}
            <WorkspaceChangeSummary />

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
                {currentPlan.actions && currentPlan.actions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentPlan.actions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => executeMockAction(action.actionType, action.payload)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${
                          action.variant === 'primary'
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

            {/* Expandable Explanation Panel */}
            {!isAdapting && <WorkspaceExplanationPanel />}

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
              <AnimatePresence mode="popLayout">
                <motion.div
                  layout
                  className="grid grid-cols-12 gap-5"
                  transition={{ duration: 0.35, ease: 'easeInOut' }}
                >
                  {visibleComponents.map(spec => {
                    const Component = getComponentForType(spec.type);

                    return (
                      <motion.div
                        key={spec.id}
                        id={`workspace-component-${spec.id}`}
                        layout
                        initial={{ opacity: 0, y: 12, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25 }}
                        className={`${
                          {
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
                </motion.div>
              </AnimatePresence>
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
