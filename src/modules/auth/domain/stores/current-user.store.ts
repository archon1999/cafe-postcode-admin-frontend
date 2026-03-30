import { create } from 'zustand';

import type { AdminSessionUser } from 'shared/api/admin-types';
import { AUTH_STORAGE_KEYS } from 'shared/lib/auth/keys';
import { StorageService } from 'shared/lib/storage';

export interface CurrentUserState {
  currentUser: AdminSessionUser | null;
  setCurrentUser: (user: AdminSessionUser | null) => void;
  clearCurrentUser: () => void;
}

const persistedCurrentUser = StorageService.getItem<AdminSessionUser>(AUTH_STORAGE_KEYS.CURRENT_USER);

export const useCurrentUserStore = create<CurrentUserState>((set) => ({
  currentUser: persistedCurrentUser,
  setCurrentUser: (user) => {
    if (user) {
      StorageService.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, user);
    } else {
      StorageService.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    }

    set({ currentUser: user ?? null });
  },
  clearCurrentUser: () => {
    StorageService.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    set({ currentUser: null });
  },
}));

export const currentUserStore = {
  getState: useCurrentUserStore.getState,
  setState: useCurrentUserStore.setState,
  subscribe: useCurrentUserStore.subscribe,
};
