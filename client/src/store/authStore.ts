import { create } from 'zustand';
import axios from 'axios';
import { useWorkspaceStore } from './workspaceStore';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  onboardingComplete: boolean;
  createdAt: string;
}

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated' | 'unavailable';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  error: string | null;
  showAuthSuccessAnimation: boolean;
  checkSession: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  uploadDataset: (file: File) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  signOut: () => Promise<boolean>;
  dismissAuthSuccessAnimation: () => void;
}

function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || 'Unable to connect to the authentication service.';
  }
  return 'An unexpected authentication error occurred.';
}

export const useAuthStore = create<AuthState>(set => ({
  status: 'checking',
  user: null,
  error: null,
  showAuthSuccessAnimation: false,

  checkSession: async () => {
    try {
      const response = await axios.get('/api/auth/session');
      set({ status: 'authenticated', user: response.data.user, error: null });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        set({ status: 'unauthenticated', user: null, error: null });
        return;
      }
      set({ status: 'unavailable', user: null, error: getApiError(error) });
    }
  },

  signIn: async (email, password) => {
    set({ error: null });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      set({
        status: 'authenticated',
        user: response.data.user,
        error: null,
        showAuthSuccessAnimation: true,
      });
    } catch (error) {
      const message = getApiError(error);
      set({ error: message });
      throw new Error(message);
    }
  },

  signUp: async (name, email, password) => {
    set({ error: null });
    try {
      const response = await axios.post('/api/auth/signup', { name, email, password });
      set({
        status: 'authenticated',
        user: response.data.user,
        error: null,
        showAuthSuccessAnimation: true,
      });
    } catch (error) {
      const message = getApiError(error);
      set({ error: message });
      throw new Error(message);
    }
  },

  uploadDataset: async file => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Files must be 5 MB or smaller.');
    }
    const format = file.name.toLowerCase().endsWith('.csv')
      ? 'csv'
      : file.name.toLowerCase().endsWith('.json')
      ? 'json'
      : null;
    if (!format) throw new Error('Choose a CSV or JSON file.');

    set({ error: null });
    try {
      const response = await axios.post('/api/user-data', {
        name: file.name,
        format,
        content: await file.text(),
      });
      set(state => ({
        user: state.user
          ? { ...state.user, onboardingComplete: response.data.onboardingComplete }
          : state.user,
      }));
    } catch (error) {
      const message = getApiError(error);
      set({ error: message });
      throw new Error(message);
    }
  },

  completeOnboarding: async () => {
    set({ error: null });
    try {
      await axios.post('/api/user-data/complete');
      set(state => ({
        user: state.user ? { ...state.user, onboardingComplete: true } : state.user,
      }));
    } catch (error) {
      const message = getApiError(error);
      set({ error: message });
      throw new Error(message);
    }
  },

  signOut: async () => {
    set({ error: null });
    try {
      await axios.post('/api/auth/logout');
      useWorkspaceStore.getState().clearWorkspace();
      set({ status: 'unauthenticated', user: null, error: null });
      return true;
    } catch (error) {
      set({ error: getApiError(error) });
      return false;
    }
  },

  dismissAuthSuccessAnimation: () => set({ showAuthSuccessAnimation: false }),
}));
