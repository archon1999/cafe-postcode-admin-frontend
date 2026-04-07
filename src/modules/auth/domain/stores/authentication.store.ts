import { create } from 'zustand';

import { queryClient } from 'shared/api';
import { sessionService } from 'shared/lib/auth/session.service';

import { adminScopeStore } from './admin-scope.store';
import { currentUserStore } from './current-user.store';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;

  setAccessToken: (accessToken: string, options?: { bootstrapping?: boolean }) => void;
  logout: () => void;
  checkAuth: () => void;
  setBootstrapping: (isBootstrapping: boolean) => void;

  getAccessToken: () => string | null;
}

const hasActiveSession = sessionService.isSessionActive();

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: hasActiveSession,
  isLoading: false,
  isBootstrapping: hasActiveSession,

  setAccessToken: (accessToken: string, options) => {
    sessionService.setAccessToken(accessToken);
    set({
      isAuthenticated: true,
      isLoading: false,
      isBootstrapping: options?.bootstrapping ?? false,
    });
    queryClient.clear();
  },

  logout: () => {
    sessionService.clearSession();
    adminScopeStore.getState().clearScope();
    currentUserStore.getState().clearCurrentUser();
    set({ isAuthenticated: false, isLoading: false, isBootstrapping: false });
    queryClient.clear();
  },

  checkAuth: () => {
    const isActive = sessionService.isSessionActive();
    set({
      isAuthenticated: isActive,
      isLoading: false,
      isBootstrapping: false,
    });
  },

  setBootstrapping: (isBootstrapping: boolean) => {
    set({ isBootstrapping });
  },

  getAccessToken: () => {
    return sessionService.getAccessToken();
  },
}));

export const authStore = {
  getState: useAuthStore.getState,
  setState: useAuthStore.setState,
  subscribe: useAuthStore.subscribe,
};
