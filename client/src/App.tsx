import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { LayoutGroup, motion, AnimatePresence, MotionConfig, useReducedMotion } from 'framer-motion';
import { useWorkspaceStore } from './store/workspaceStore';
import {
  reducedWorkspaceLayoutTransition,
  workspaceLayoutTransition
} from './animations/workspaceMotion';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { CommandBar } from './components/common/CommandBar';
import { WorkspaceExplanationPanel } from './components/general/WorkspaceExplanationPanel';
import { ComponentWrapper } from './components/common/ComponentWrapper';
import { WorkspaceMotionCard } from './components/common/WorkspaceMotionCard';
import { ClarificationModal } from './components/common/ClarificationModal';
import { NotificationToast } from './components/common/NotificationToast';
import { getComponentForType } from './components/registry';
import { Eye, Loader2, Sparkles } from 'lucide-react';
import { AuthScreen } from './components/auth/AuthScreen';
import { DataOnboardingScreen } from './components/auth/DataOnboardingScreen';
import { useAuthStore } from './store/authStore';

// Aliases that render the same React component share one card identity,
// so a card glides instead of exiting and re-entering when the planner
// switches between an alias and its target.
const CANONICAL_TYPE: Record<string, string> = {
  ClientHealthCard: 'ClientProfileCard',
  PeriodComparisonCard: 'UsageTrendChart',
  TrendIndicator: 'MetricCard',
  InsightPanel: 'EvidenceBasedInsightList',
  DataTable: 'OverdueTasksTable',
  TaskDetailDrawer: 'OverdueTasksTable',
  DatePicker: 'MeetingScheduler',
  MeetingConfirmationCard: 'MeetingScheduler',
  TimeSlotSelector: 'AvailabilityPanel',
};

export const App: React.FC = () => {
  const {
    status: authStatus,
    user,
    checkSession,
    showAuthSuccessAnimation,
    dismissAuthSuccessAnimation,
  } = useAuthStore();
  const [showDataUpload, setShowDataUpload] = useState(false);
  const [stagedArrangementPlanId, setStagedArrangementPlanId] = useState<string | null>(null);
  const workspaceScrollRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const {
    currentPlan,
    isAdapting,
    pendingPrompt,
    error,
    hiddenComponentIds,
    unhideAllComponents,
    executeMockAction,
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

  useLayoutEffect(() => {
    if (!currentPlan || prefersReducedMotion) {
      setStagedArrangementPlanId(null);
      return;
    }

    setStagedArrangementPlanId(currentPlan.id);
    const timeout = window.setTimeout(() => setStagedArrangementPlanId(null), 700);
    return () => window.clearTimeout(timeout);
  }, [currentPlan?.id, prefersReducedMotion]);

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
          {user?.name
            ? `Welcome, ${user.name}!`
            : 'You’re signed in!'}
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

  const planComponents = currentPlan?.components || [];
  const hasIntegratedMeetingScheduler = planComponents.some(component =>
    ['MeetingScheduler', 'MeetingConfirmationCard', 'DatePicker'].includes(component.type)
  );
  const positionedComponents = [...planComponents]
    .filter(component =>
      !hiddenComponentIds.includes(component.id) &&
      !(hasIntegratedMeetingScheduler && component.type === 'AttendeeSelector')
    )
    .sort((a, b) => {
      if (hasIntegratedMeetingScheduler) {
        const isSchedulerA = ['MeetingScheduler', 'MeetingConfirmationCard', 'DatePicker'].includes(a.type);
        const isSchedulerB = ['MeetingScheduler', 'MeetingConfirmationCard', 'DatePicker'].includes(b.type);
        if (isSchedulerA && !isSchedulerB) return -1;
        if (!isSchedulerA && isSchedulerB) return 1;
      }
      return (a.position || 0) - (b.position || 0);
    });

  // Stable card identity: canonical type | data source | occurrence number.
  // The occurrence number keeps keys unique when a plan has two cards of the
  // same type and data source (e.g. two MetricCards on "tasks").
  // Plain const, not a hook: this code sits below the early returns above.
  const keyCounts = new Map<string, number>();
  const keyedComponents = positionedComponents.map(spec => {
    const base = `${CANONICAL_TYPE[spec.type] ?? spec.type}|${spec.dataSource}`;
    const n = (keyCounts.get(base) ?? 0) + 1;
    keyCounts.set(base, n);
    return { spec, key: `${base}|${n}` };
  });
  const renderComponents = stagedArrangementPlanId === currentPlan?.id
    ? [...keyedComponents].reverse()
    : keyedComponents;

  const layoutTransition = prefersReducedMotion
    ? reducedWorkspaceLayoutTransition
    : workspaceLayoutTransition;

  return (
    <MotionConfig reducedMotion={prefersReducedMotion ? 'always' : 'never'}>
    <div className="h-screen bg-[var(--bg-color)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200 overflow-hidden">
      {/* Top Application Bar */}
      <Header onUploadData={() => setShowDataUpload(true)} />

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Left Sidebar */}
        <Sidebar />

        {/* Dynamic Workspace Canvas */}
        <motion.main
          id="workspace-scroll-container"
          layoutScroll
          ref={workspaceScrollRef}
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
            {currentPlan && (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentPlan.id}
                    initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
                    transition={{ duration: 0.2 }}
                  >
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
                  </motion.div>
                </AnimatePresence>

                {/* Plan-specific Top Actions */}
                {currentPlan.actions && currentPlan.actions.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentPlan.actions.map(action => (
                      <button
                        key={action.id}
                        onClick={() => executeMockAction(action.actionType, action.payload)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 ${action.variant === 'primary'
                            ? 'bg-primary hover:bg-primary-hover text-white shadow-glow-orange/30'
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

            {isAdapting && (
              <div
                className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-[var(--text-secondary)]"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary motion-reduce:animate-none" />
                <span>
                  Updating workspace{pendingPrompt ? ` for “${pendingPrompt}”` : ''}. Your current workspace remains available.
                </span>
              </div>
            )}

            {/* Hidden Components Restore Banner */}
            {hiddenComponentIds.length > 0 && (
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
            {currentPlan ? (
              <LayoutGroup id="workspace-components">
                <motion.div
                  layout="position"
                  aria-busy={isAdapting}
                  animate={{
                    opacity: isAdapting ? 0.55 : 1,
                    scale: isAdapting && !prefersReducedMotion ? 0.995 : 1,
                  }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-5"
                  transition={{ layout: layoutTransition, opacity: { duration: 0.2 }, scale: { duration: 0.2 } }}
                >
                  <AnimatePresence mode="popLayout">
                    {renderComponents.map(({ spec, key }, index) => {
                      const Component = getComponentForType(spec.type);

                      return (
                        <WorkspaceMotionCard
                          key={key}
                          componentId={spec.id}
                          scrollRoot={workspaceScrollRef}
                          staggerIndex={index}
                          layoutTransition={layoutTransition}
                          className={
                            spec.colSpan >= 3 ||
                            ['MeetingScheduler', 'MeetingConfirmationCard'].includes(spec.type)
                              ? 'col-span-1 lg:col-span-2'
                              : 'col-span-1'
                          }
                        >
                          <ComponentWrapper spec={spec}>
                            <Component spec={spec} />
                          </ComponentWrapper>
                        </WorkspaceMotionCard>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              </LayoutGroup>
            ) : null}

            {/* Why This Workspace? AI Rationale & Explanation Section */}
            <WorkspaceExplanationPanel />
          </div>
        </motion.main>
      </div>

      {/* Disambiguation Modal for Ambiguous Prompts */}
      <ClarificationModal />

      {/* Feedback Toast */}
      <NotificationToast />
    </div>
    </MotionConfig>
  );
};
export default App;