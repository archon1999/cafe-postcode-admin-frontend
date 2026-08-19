import { create } from 'zustand';

import { sessionService } from 'shared/lib/auth/session.service';

import type { AdminCredentialResponse } from '../entities/admin-auth.types';

export type AdminAuthStatus = 'bootstrapping' | 'anonymous' | 'authenticated' | 'locked';

export interface AuthState {
  status: AdminAuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBootstrapping: boolean;
  lockedAt: string | null;
  accessExpiresAt: string | null;

  setCredentials: (credentials: AdminCredentialResponse) => void;
  setAccessToken: (accessToken: string, options?: { bootstrapping?: boolean; expiresAt?: string }) => void;
  markLocked: (lockedAt?: string | null) => void;
  logout: () => void;
  checkAuth: () => void;
  setBootstrapping: (isBootstrapping: boolean) => void;
  getAccessToken: () => string | null;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'bootstrapping',
  isAuthenticated: false,
  isLoading: false,
  isBootstrapping: true,
  lockedAt: null,
  accessExpiresAt: null,

  setCredentials: (credentials) => {
    sessionService.setAccessToken(credentials.accessToken, credentials.accessExpiresAt);
    set({
      status: 'authenticated',
      isAuthenticated: true,
      isLoading: false,
      isBootstrapping: false,
      lockedAt: null,
      accessExpiresAt: credentials.accessExpiresAt,
    });
  },

  setAccessToken: (accessToken, options) => {
    sessionService.setAccessToken(accessToken, options?.expiresAt);
    set({
      status: 'authenticated',
      isAuthenticated: true,
      isLoading: false,
      isBootstrapping: options?.bootstrapping ?? false,
      lockedAt: null,
      accessExpiresAt: options?.expiresAt ?? null,
    });
  },

  markLocked: (lockedAt) => {
    sessionService.clearSession();
    set({
      status: 'locked',
      isAuthenticated: true,
      isLoading: false,
      isBootstrapping: false,
      lockedAt: lockedAt ?? new Date().toISOString(),
      accessExpiresAt: null,
    });
  },

  logout: () => {
    sessionService.clearSession();
    set({
      status: 'anonymous',
      isAuthenticated: false,
      isLoading: false,
      isBootstrapping: false,
      lockedAt: null,
      accessExpiresAt: null,
    });
  },

  checkAuth: () => {
    const active = sessionService.isSessionActive();
    set({
      status: active ? 'authenticated' : 'anonymous',
      isAuthenticated: active,
      isLoading: false,
      isBootstrapping: false,
    });
  },

  setBootstrapping: (isBootstrapping) => {
    set((state) => ({
      isBootstrapping,
      status: isBootstrapping
        ? 'bootstrapping'
        : state.status === 'locked'
          ? 'locked'
          : state.isAuthenticated
            ? 'authenticated'
            : 'anonymous',
    }));
  },

  getAccessToken: () => sessionService.getAccessToken(),
}));

export const authStore = {
  getState: useAuthStore.getState,
  setState: useAuthStore.setState,
  subscribe: useAuthStore.subscribe,
};
