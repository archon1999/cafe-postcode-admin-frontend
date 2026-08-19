import { create } from 'zustand';

import type { AdminSessionUser } from 'shared/api/admin-types';
import { AUTH_STORAGE_KEYS } from 'shared/lib/auth/keys';

export interface CurrentUserState {
  currentUser: AdminSessionUser | null;
  setCurrentUser: (user: AdminSessionUser | null) => void;
  clearCurrentUser: () => void;
}

if (typeof window !== 'undefined') {
  window.localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
}

export const useCurrentUserStore = create<CurrentUserState>((set) => ({
  currentUser: null,
  setCurrentUser: (user) => {
    set({ currentUser: user ?? null });
  },
  clearCurrentUser: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
      window.sessionStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    }
    set({ currentUser: null });
  },
}));

export const currentUserStore = {
  getState: useCurrentUserStore.getState,
  setState: useCurrentUserStore.setState,
  subscribe: useCurrentUserStore.subscribe,
};
