import { create } from 'zustand';
import axios from 'axios';
import { UIPlan, HistoryItem } from '../types/workspace';

const MINIMUM_SEARCH_LOADING_MS = 700;
const MAX_ACTION_HISTORY = 100;

type ReversibleAction =
  | { type: 'pin'; componentId: string; before: boolean; after: boolean }
  | { type: 'incident-status'; incidentId: string; before: string; after: string };

const withPinnedState = (
  plan: UIPlan | null,
  componentId: string,
  pinned: boolean
): UIPlan | null => plan && ({
  ...plan,
  components: plan.components.map(component =>
    component.id === componentId ? { ...component, pinned } : component
  )
});

const updatePinnedIds = (ids: string[], componentId: string, pinned: boolean) => {
  if (pinned) return ids.includes(componentId) ? ids : [...ids, componentId];
  return ids.filter(id => id !== componentId);
};

const waitForMinimumLoadingTime = async (startedAt: number) => {
  const remaining = MINIMUM_SEARCH_LOADING_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise(resolve => setTimeout(resolve, remaining));
  }
};

interface WorkspaceState {
  currentPlan: UIPlan | null;
  previousPlan: UIPlan | null;
  history: HistoryItem[];
  pinnedComponentIds: string[];
  hiddenComponentIds: string[];
  incidentStatusById: Record<string, string>;
  undoStack: ReversibleAction[];
  redoStack: ReversibleAction[];
  isHistoryActionPending: boolean;
  isAdapting: boolean;
  error: string | null;
  provider: 'llm' | 'deterministic';
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  sidebarOpen: boolean;
  explanationPanelExpanded: boolean;
  theme: 'dark' | 'light';

  // Actions
  clearWorkspace: () => void;
  toggleTheme: () => void;
  submitPrompt: (prompt: string) => Promise<void>;
  submitRefinement: (prompt: string) => Promise<void>;
  answerClarification: (entityKey: string, selectedId: string) => Promise<void>;
  togglePinComponent: (componentId: string) => void;
  setIncidentStatus: (incidentId: string, before: string, after: string) => Promise<void>;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  hideComponent: (componentId: string) => void;
  unhideAllComponents: () => void;
  restoreFromHistory: (index: number) => void;
  executeMockAction: (actionId: string, payload?: any) => Promise<void>;
  setSidebarOpen: (open: boolean) => void;
  toggleExplanationPanel: () => void;
  clearNotification: () => void;
}

const getInitialTheme = (): 'dark' | 'light' => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('nexusflow_theme');
    if (saved === 'dark') {
      localStorage.setItem('nexusflow_theme', 'light');
      document.documentElement.classList.remove('dark');
      return 'light';
    }
    if (saved === 'light') return 'light';
  }
  return 'light';
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentPlan: null,
  previousPlan: null,
  history: [],
  pinnedComponentIds: [],
  hiddenComponentIds: [],
  incidentStatusById: {},
  undoStack: [],
  redoStack: [],
  isHistoryActionPending: false,
  isAdapting: false,
  error: null,
  provider: 'deterministic',
  notification: null,
  sidebarOpen: true,
  explanationPanelExpanded: false,
  theme: getInitialTheme(),

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexusflow_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({
      theme: newTheme,
      notification: {
        message: `Switched to ${newTheme === 'dark' ? 'Dark Plum' : 'Light Canvas'} mode`,
        type: 'info'
      }
    });
  },

  clearWorkspace: () => {
    set({
      currentPlan: null,
      previousPlan: null,
      history: [],
      pinnedComponentIds: [],
      hiddenComponentIds: [],
      incidentStatusById: {},
      undoStack: [],
      redoStack: [],
      isHistoryActionPending: false,
      error: null,
      notification: null
    });
  },

  submitPrompt: async (prompt: string) => {
    const { currentPlan, pinnedComponentIds, history } = get();
    const loadingStartedAt = Date.now();
    set({ isAdapting: true, error: null });

    try {
      const res = await axios.post('/api/workspace/generate', {
        prompt,
        previousPlan: currentPlan,
        pinnedComponentIds
      });

      const newPlan: UIPlan = res.data.plan;
      await waitForMinimumLoadingTime(loadingStartedAt);

      set({
        previousPlan: currentPlan,
        currentPlan: newPlan,
        provider: res.data.provider,
        isAdapting: false,
        history: [
          {
            timestamp: new Date().toLocaleTimeString(),
            prompt,
            intent: newPlan.intent,
            intentLabel: newPlan.intentLabel,
            plan: newPlan
          },
          ...history
        ],
        notification: {
          message: newPlan.changeSummary?.reason || `Workspace reshaped for: ${newPlan.intentLabel}`,
          type: 'info'
        }
      });
    } catch (err: any) {
      await waitForMinimumLoadingTime(loadingStartedAt);
      console.error('Failed to adapt workspace:', err);
      set({
        error: err.message || 'Error communicating with AI engine',
        isAdapting: false
      });
    }
  },

  submitRefinement: async (prompt: string) => {
    const { currentPlan, pinnedComponentIds, history } = get();
    if (!currentPlan) return;

    set({ isAdapting: true, error: null });

    try {
      const res = await axios.post('/api/workspace/refine', {
        prompt,
        previousPlan: currentPlan,
        pinnedComponentIds
      });

      const refinedPlan: UIPlan = res.data.plan;

      set({
        previousPlan: currentPlan,
        currentPlan: refinedPlan,
        provider: res.data.provider,
        isAdapting: false,
        history: [
          {
            timestamp: new Date().toLocaleTimeString(),
            prompt: `Refinement: ${prompt}`,
            intent: refinedPlan.intent,
            intentLabel: refinedPlan.intentLabel,
            plan: refinedPlan
          },
          ...history
        ],
        notification: {
          message: refinedPlan.changeSummary?.reason || 'Workspace refined with updated criteria',
          type: 'info'
        }
      });
    } catch (err: any) {
      console.error('Failed to refine workspace:', err);
      set({ error: err.message, isAdapting: false });
    }
  },

  answerClarification: async (entityKey: string, selectedId: string) => {
    const { currentPlan, previousPlan, pinnedComponentIds, history } = get();
    set({ isAdapting: true });

    try {
      const res = await axios.post('/api/workspace/generate', {
        prompt: currentPlan?.prompt || '',
        previousPlan: previousPlan || currentPlan,
        pinnedComponentIds,
        clarificationResponse: {
          entityKey,
          selectedId
        }
      });

      const resolvedPlan: UIPlan = res.data.plan;

      set({
        previousPlan: currentPlan,
        currentPlan: resolvedPlan,
        provider: res.data.provider,
        isAdapting: false,
        history: [
          {
            timestamp: new Date().toLocaleTimeString(),
            prompt: `Clarified ${entityKey}: ${selectedId}`,
            intent: resolvedPlan.intent,
            intentLabel: resolvedPlan.intentLabel,
            plan: resolvedPlan
          },
          ...history
        ],
        notification: {
          message: `Entity clarified. Assembled custom workspace for ${selectedId}`,
          type: 'success'
        }
      });
    } catch (err: any) {
      set({ error: err.message, isAdapting: false });
    }
  },

  togglePinComponent: (componentId: string) => {
    const { pinnedComponentIds, currentPlan } = get();
    const isPinned = pinnedComponentIds.includes(componentId);
    const nextPinned = !isPinned;
    const action: ReversibleAction = {
      type: 'pin',
      componentId,
      before: isPinned,
      after: nextPinned
    };
    set({
      pinnedComponentIds: updatePinnedIds(pinnedComponentIds, componentId, nextPinned),
      currentPlan: withPinnedState(currentPlan, componentId, nextPinned),
      undoStack: [...get().undoStack, action].slice(-MAX_ACTION_HISTORY),
      redoStack: [],
      notification: {
        message: isPinned ? 'Component unpinned' : 'Component pinned to persist across goals',
        type: 'info'
      }
    });
  },

  setIncidentStatus: async (incidentId: string, before: string, after: string) => {
    if (!incidentId || before === after) return;
    try {
      const res = await axios.post('/api/actions/set_incident_status', { incidentId, status: after });
      const ticketNumber = res.data.incident?.ticketNumber;
      const statusById = { ...get().incidentStatusById, [incidentId]: after };
      if (typeof ticketNumber === 'string') statusById[ticketNumber] = after;
      const action: ReversibleAction = { type: 'incident-status', incidentId, before, after };
      set(state => ({
        incidentStatusById: statusById,
        undoStack: [...state.undoStack, action].slice(-MAX_ACTION_HISTORY),
        redoStack: [],
        notification: {
          message: res.data.message || `Incident status changed to ${after}.`,
          type: 'success'
        }
      }));
    } catch (err: any) {
      set({
        notification: {
          message: `Could not update incident status: ${err.response?.data?.error || err.message}`,
          type: 'error'
        }
      });
    }
  },

  undo: async () => {
    const { undoStack, isHistoryActionPending } = get();
    const action = undoStack[undoStack.length - 1];
    if (!action || isHistoryActionPending) return;
    set({ isHistoryActionPending: true });
    try {
      if (action.type === 'incident-status') {
        const res = await axios.post('/api/actions/set_incident_status', {
          incidentId: action.incidentId,
          status: action.before
        });
        const ticketNumber = res.data.incident?.ticketNumber;
        set(state => {
          const incidentStatusById = { ...state.incidentStatusById, [action.incidentId]: action.before };
          if (typeof ticketNumber === 'string') incidentStatusById[ticketNumber] = action.before;
          return {
            incidentStatusById,
            undoStack: state.undoStack.slice(0, -1),
            redoStack: [...state.redoStack, action].slice(-MAX_ACTION_HISTORY),
            isHistoryActionPending: false,
            notification: { message: `Undo: incident status restored to ${action.before}.`, type: 'info' }
          };
        });
      } else {
        set(state => ({
          pinnedComponentIds: updatePinnedIds(state.pinnedComponentIds, action.componentId, action.before),
          currentPlan: withPinnedState(state.currentPlan, action.componentId, action.before),
          undoStack: state.undoStack.slice(0, -1),
          redoStack: [...state.redoStack, action].slice(-MAX_ACTION_HISTORY),
          isHistoryActionPending: false,
          notification: { message: `Undo: component ${action.before ? 'pinned' : 'unpinned'}.`, type: 'info' }
        }));
      }
    } catch (err: any) {
      set({
        isHistoryActionPending: false,
        notification: {
          message: `Undo failed: ${err.response?.data?.error || err.message}`,
          type: 'error'
        }
      });
    }
  },

  redo: async () => {
    const { redoStack, isHistoryActionPending } = get();
    const action = redoStack[redoStack.length - 1];
    if (!action || isHistoryActionPending) return;
    set({ isHistoryActionPending: true });
    try {
      if (action.type === 'incident-status') {
        const res = await axios.post('/api/actions/set_incident_status', {
          incidentId: action.incidentId,
          status: action.after
        });
        const ticketNumber = res.data.incident?.ticketNumber;
        set(state => {
          const incidentStatusById = { ...state.incidentStatusById, [action.incidentId]: action.after };
          if (typeof ticketNumber === 'string') incidentStatusById[ticketNumber] = action.after;
          return {
            incidentStatusById,
            redoStack: state.redoStack.slice(0, -1),
            undoStack: [...state.undoStack, action].slice(-MAX_ACTION_HISTORY),
            isHistoryActionPending: false,
            notification: { message: `Redo: incident status changed to ${action.after}.`, type: 'info' }
          };
        });
      } else {
        set(state => ({
          pinnedComponentIds: updatePinnedIds(state.pinnedComponentIds, action.componentId, action.after),
          currentPlan: withPinnedState(state.currentPlan, action.componentId, action.after),
          redoStack: state.redoStack.slice(0, -1),
          undoStack: [...state.undoStack, action].slice(-MAX_ACTION_HISTORY),
          isHistoryActionPending: false,
          notification: { message: `Redo: component ${action.after ? 'pinned' : 'unpinned'}.`, type: 'info' }
        }));
      }
    } catch (err: any) {
      set({
        isHistoryActionPending: false,
        notification: {
          message: `Redo failed: ${err.response?.data?.error || err.message}`,
          type: 'error'
        }
      });
    }
  },

  hideComponent: (componentId: string) => {
    const { hiddenComponentIds } = get();
    set({
      hiddenComponentIds: [...hiddenComponentIds, componentId],
      notification: {
        message: 'Component hidden from canvas',
        type: 'info'
      }
    });
  },

  unhideAllComponents: () => {
    set({
      hiddenComponentIds: [],
      notification: {
        message: 'All hidden components restored',
        type: 'info'
      }
    });
  },

  restoreFromHistory: (index: number) => {
    const { history, currentPlan } = get();
    const target = history[index];
    if (target) {
      set({
        previousPlan: currentPlan,
        currentPlan: target.plan,
        notification: {
          message: `Restored workspace for earlier goal: "${target.intentLabel}"`,
          type: 'info'
        }
      });
    }
  },

  executeMockAction: async (actionId: string, payload: any = {}) => {
    if (actionId === 'run_prompt') {
      if (typeof payload.prompt !== 'string' || !payload.prompt.trim()) {
        set({
          notification: {
            message: 'Could not open the suggested workspace because its prompt is missing.',
            type: 'error'
          }
        });
        return;
      }
      await get().submitPrompt(payload.prompt.trim());
      return;
    }

    try {
      const res = await axios.post(`/api/actions/${actionId}`, payload);
      set({
        notification: {
          message: res.data.message || 'Action executed successfully',
          type: 'success'
        }
      });
    } catch (err: any) {
      set({
        notification: {
          message: `Action failed: ${err.message}`,
          type: 'error'
        }
      });
    }
  },

  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleExplanationPanel: () => set(state => ({ explanationPanelExpanded: !state.explanationPanelExpanded })),
  clearNotification: () => set({ notification: null })
}));
