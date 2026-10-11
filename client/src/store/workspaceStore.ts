import { create } from 'zustand';
import axios from 'axios';
import { UIPlan, HistoryItem } from '../types/workspace';

const MINIMUM_SEARCH_LOADING_MS = 700;

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
    if (saved === 'light' || saved === 'dark') return saved;
  }
  return 'dark';
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  currentPlan: null,
  previousPlan: null,
  history: [],
  pinnedComponentIds: [],
  hiddenComponentIds: [],
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
    const updated = isPinned
      ? pinnedComponentIds.filter(id => id !== componentId)
      : [...pinnedComponentIds, componentId];

    // Also update pinned property on component
    let updatedPlan = currentPlan;
    if (currentPlan) {
      updatedPlan = {
        ...currentPlan,
        components: currentPlan.components.map(c =>
          c.id === componentId ? { ...c, pinned: !isPinned } : c
        )
      };
    }

    set({
      pinnedComponentIds: updated,
      currentPlan: updatedPlan,
      notification: {
        message: isPinned ? 'Component unpinned' : 'Component pinned to persist across goals',
        type: 'info'
      }
    });
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
