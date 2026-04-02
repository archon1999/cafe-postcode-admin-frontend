import { create } from 'zustand';

import { AUTH_STORAGE_KEYS } from 'shared/lib/auth/keys';
import { StorageService } from 'shared/lib/storage';

type PersistedAdminScope = {
  selectedRestaurantId: string | null;
};

interface AdminScopeState extends PersistedAdminScope {
  setSelectedRestaurantId: (restaurantId: string | null) => void;
  clearScope: () => void;
}

const persistedScope = StorageService.getItem<PersistedAdminScope>(AUTH_STORAGE_KEYS.ADMIN_SCOPE);

const defaultScope: PersistedAdminScope = {
  selectedRestaurantId: persistedScope?.selectedRestaurantId ?? null,
};

function persistScope(scope: PersistedAdminScope) {
  if (!scope.selectedRestaurantId) {
    StorageService.removeItem(AUTH_STORAGE_KEYS.ADMIN_SCOPE);
    return;
  }

  StorageService.setItem(AUTH_STORAGE_KEYS.ADMIN_SCOPE, {
    selectedRestaurantId: scope.selectedRestaurantId,
  });
}

export const useAdminScopeStore = create<AdminScopeState>((set) => ({
  ...defaultScope,
  setSelectedRestaurantId: (restaurantId) => {
    const selectedRestaurantId = restaurantId ?? null;
    persistScope({ selectedRestaurantId });
    set({ selectedRestaurantId });
  },
  clearScope: () => {
    StorageService.removeItem(AUTH_STORAGE_KEYS.ADMIN_SCOPE);
    set({ selectedRestaurantId: null });
  },
}));

export const adminScopeStore = {
  getState: useAdminScopeStore.getState,
  setState: useAdminScopeStore.setState,
  subscribe: useAdminScopeStore.subscribe,
};
