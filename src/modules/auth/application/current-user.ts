import type { AdminSessionUser } from 'shared/api/admin-types';

import { getCurrentUserRequest } from '../data-access';
import { adminScopeStore } from '../domain/stores/admin-scope.store';
import { authStore } from '../domain/stores/authentication.store';
import { currentUserStore } from '../domain/stores/current-user.store';

type SyncCurrentUserOptions = {
  fallbackUser?: AdminSessionUser;
  logoutOnError?: boolean;
};

let currentUserSyncPromise: Promise<AdminSessionUser> | null = null;

function applyCurrentUser(profile: AdminSessionUser) {
  currentUserStore.getState().setCurrentUser(profile);

  if (!profile.isSuperuser) {
    adminScopeStore.getState().clearScope();
  }
}

export async function syncCurrentUser(options: SyncCurrentUserOptions = {}) {
  const { fallbackUser, logoutOnError = false } = options;

  if (!currentUserSyncPromise) {
    currentUserSyncPromise = getCurrentUserRequest()
      .then((profile) => {
        applyCurrentUser(profile);
        return profile;
      })
      .catch((error) => {
        if (fallbackUser) {
          applyCurrentUser(fallbackUser);
          return fallbackUser;
        }

        if (logoutOnError) {
          authStore.getState().logout();
        }

        throw error;
      })
      .finally(() => {
        currentUserSyncPromise = null;
      });
  }

  return currentUserSyncPromise;
}
