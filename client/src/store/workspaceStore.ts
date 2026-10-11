import { create } from 'zustand';
import axios from 'axios';
import { UIPlan, HistoryItem } from '../types/workspace';

const MAX_ACTION_HISTORY = 100;
let workspaceRequestId = 0;

const normalizePrompt = (prompt: string) => prompt.trim().replace(/\s+/g, ' ').toLocaleLowerCase();

type ReversibleAction =
  | { type: 'pin'; componentId: string; before: boolean; after: boolean }
  | { type: 'incident-status'; incidentId: string; before: string; after: string };

interface PromptSuggestion {
  label: string;
  prompt: string;
}

interface PromptFeedback {
  message: string;
  suggestedPrompts: PromptSuggestion[];
}

function getPromptFeedback(error: unknown): PromptFeedback | null {
  if (!axios.isAxiosError<{ error?: unknown; suggestedPrompts?: unknown }>(error)) return null;
  const data = error.response?.data;
  if (error.response?.status !== 422 || typeof data?.error !== 'string') return null;
  const suggestedPrompts = Array.isArray(data.suggestedPrompts)
    ? data.suggestedPrompts.filter((item): item is PromptSuggestion =>
        typeof item === 'object' &&
        item !== null &&
        'label' in item &&
        typeof item.label === 'string' &&
        'prompt' in item &&
        typeof item.prompt === 'string'
      )
    : [];
  return { message: data.error, suggestedPrompts };
}

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

interface WorkspaceState {
  currentPlan: UIPlan | null;
  previousPlan: UIPlan | null;
  history: HistoryItem[];
  selectedAttendeeIds: string[];
  pinnedComponentIds: string[];
  hiddenComponentIds: string[];
  incidentStatusById: Record<string, string>;
  undoStack: ReversibleAction[];
  redoStack: ReversibleAction[];
  isHistoryActionPending: boolean;
  isAdapting: boolean;
  pendingPrompt: string | null;
  promptFeedback: PromptFeedback | null;
  error: string | null;
  provider: 'llm' | 'deterministic';
  notification: { message: string; type: 'success' | 'info' | 'error' } | null;
  sidebarOpen: boolean;
  explanationPanelExpanded: boolean;
  theme: 'dark' | 'light';

  // Actions
  clearWorkspace: () => void;
  setSelectedAttendeeIds: (attendeeIds: string[]) => void;
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
  clearPromptFeedback: () => void;
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
  selectedAttendeeIds: [],
  pinnedComponentIds: [],
  hiddenComponentIds: [],
  incidentStatusById: {},
  undoStack: [],
  redoStack: [],
  isHistoryActionPending: false,
  isAdapting: false,
  pendingPrompt: null,
  promptFeedback: null,
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
    workspaceRequestId += 1;
    set({
      currentPlan: null,
      previousPlan: null,
      history: [],
      selectedAttendeeIds: [],
      pinnedComponentIds: [],
      hiddenComponentIds: [],
      incidentStatusById: {},
      undoStack: [],
      redoStack: [],
      isHistoryActionPending: false,
      isAdapting: false,
      pendingPrompt: null,
      promptFeedback: null,
      error: null,
      notification: null
    });
  },

  setSelectedAttendeeIds: (attendeeIds: string[]) => {
    set({ selectedAttendeeIds: Array.from(new Set(attendeeIds)) });
  },

  submitPrompt: async (prompt: string) => {
    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt) return;
    const state = get();
    if (
      state.isAdapting &&
      state.pendingPrompt &&
      normalizePrompt(state.pendingPrompt) === normalizePrompt(normalizedPrompt)
    ) return;
    const requestId = ++workspaceRequestId;
    const { currentPlan, pinnedComponentIds } = state;
    set({ isAdapting: true, pendingPrompt: normalizedPrompt, error: null, promptFeedback: null });

    try {
      const res = await axios.post('/api/workspace/generate', {
        prompt: normalizedPrompt,
        previousPlan: currentPlan,
        pinnedComponentIds
      });

      const newPlan: UIPlan = res.data.plan;
      if (requestId !== workspaceRequestId) return;

      set(currentState => ({
        previousPlan: currentState.currentPlan,
        currentPlan: newPlan,
        selectedAttendeeIds: newPlan.intent === 'schedule_meeting' ? [] : currentState.selectedAttendeeIds,
        provider: res.data.provider,
        isAdapting: false,
        pendingPrompt: null,
        history: [
          {
            timestamp: new Date().toLocaleTimeString(),
            prompt: normalizedPrompt,
            intent: newPlan.intent,
            intentLabel: newPlan.intentLabel,
            plan: newPlan
          },
          ...currentState.history
        ],
        notification: {
          message: newPlan.changeSummary?.reason || `Workspace reshaped for: ${newPlan.intentLabel}`,
          type: 'info'
        }
      }));
    } catch (err: any) {
      if (requestId !== workspaceRequestId) return;
      const promptFeedback = getPromptFeedback(err);
      if (!promptFeedback) console.error('Failed to adapt workspace:', err);
      set({
        error: promptFeedback ? null : err.message || 'Error communicating with AI engine',
        isAdapting: false,
        pendingPrompt: null,
        promptFeedback,
      });
    }
  },

  submitRefinement: async (prompt: string) => {
    const { currentPlan, pinnedComponentIds } = get();
    if (!currentPlan) return;
    const requestId = ++workspaceRequestId;

    set({ isAdapting: true, pendingPrompt: prompt, error: null, promptFeedback: null });

    try {
      const res = await axios.post('/api/workspace/refine', {
        prompt,
        previousPlan: currentPlan,
        pinnedComponentIds
      });

      const refinedPlan: UIPlan = res.data.plan;
      if (requestId !== workspaceRequestId) return;

      set(state => ({
        previousPlan: state.currentPlan,
        currentPlan: refinedPlan,
        provider: res.data.provider,
        isAdapting: false,
        pendingPrompt: null,
        history: [
          {
            timestamp: new Date().toLocaleTimeString(),
            prompt: `Refinement: ${prompt}`,
            intent: refinedPlan.intent,
            intentLabel: refinedPlan.intentLabel,
            plan: refinedPlan
          },
          ...state.history
        ],
        notification: {
          message: refinedPlan.changeSummary?.reason || 'Workspace refined with updated criteria',
          type: 'info'
        }
      }));
    } catch (err: any) {
      if (requestId !== workspaceRequestId) return;
      const promptFeedback = getPromptFeedback(err);
      if (!promptFeedback) console.error('Failed to refine workspace:', err);
      set({
        error: promptFeedback ? null : err.message,
        isAdapting: false,
        pendingPrompt: null,
        promptFeedback,
      });
    }
  },

  answerClarification: async (entityKey: string, selectedId: string) => {
    const { currentPlan, previousPlan, pinnedComponentIds } = get();
    const requestId = ++workspaceRequestId;
    set({ isAdapting: true, pendingPrompt: `Clarifying ${entityKey}`, error: null });

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
      if (requestId !== workspaceRequestId) return;

      set(state => ({
        previousPlan: state.currentPlan,
        currentPlan: resolvedPlan,
        provider: res.data.provider,
        isAdapting: false,
        pendingPrompt: null,
        history: [
          {
            timestamp: new Date().toLocaleTimeString(),
            prompt: `Clarified ${entityKey}: ${selectedId}`,
            intent: resolvedPlan.intent,
            intentLabel: resolvedPlan.intentLabel,
            plan: resolvedPlan
          },
          ...state.history
        ],
        notification: {
          message: `Entity clarified. Assembled custom workspace for ${selectedId}`,
          type: 'success'
        }
      }));
    } catch (err: any) {
      if (requestId !== workspaceRequestId) return;
      set({ error: err.message, isAdapting: false, pendingPrompt: null });
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
      workspaceRequestId += 1;
      set({
        previousPlan: currentPlan,
        currentPlan: target.plan,
        isAdapting: false,
        pendingPrompt: null,
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
  clearNotification: () => set({ notification: null }),
  clearPromptFeedback: () => set({ promptFeedback: null })
}));
