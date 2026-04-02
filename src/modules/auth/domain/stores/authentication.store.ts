import { create } from 'zustand';

import { queryClient } from 'shared/api';
import { sessionService } from 'shared/lib/auth/session.service';

import { adminScopeStore } from './admin-scope.store';
import { currentUserStore } from './current-user.store';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;

  setAccessToken: (accessToken: string) => void;
  logout: () => void;
  checkAuth: () => void;

  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: sessionService.isSessionActive(),
  isLoading: false,

  setAccessToken: (accessToken: string) => {
    sessionService.setAccessToken(accessToken);
    set({ isAuthenticated: true, isLoading: false });

    void queryClient.invalidateQueries();
  },

  logout: () => {
    sessionService.clearSession();
    adminScopeStore.getState().clearScope();
    currentUserStore.getState().clearCurrentUser();
    set({ isAuthenticated: false, isLoading: false });
    queryClient.clear();
  },

  checkAuth: () => {
    const isActive = sessionService.isSessionActive();
    set({
      isAuthenticated: isActive,
      isLoading: false,
    });
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
