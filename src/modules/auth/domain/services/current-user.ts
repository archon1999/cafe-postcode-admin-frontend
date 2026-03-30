import { useMemo } from 'react';

import type { AdminSessionUser } from 'shared/api/admin-types';

import { useAuthStore } from '../stores/authentication.store';
import { useCurrentUserStore } from '../stores/current-user.store';

export interface CurrentUser {
  id: string;
  displayName: string;
  photoURL: string | null;
  role: string | null;
  roleLabel?: string | null;
  actorType?: string | null;
  username?: string;
  phone?: string | null;
  uiMode?: string | null;
  isActive?: boolean;
  isSuperuser?: boolean;
  restaurantAccessActive?: boolean;
}

export function useCurrentUser() {
  const profile = useCurrentUserStore((state) => state.currentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const user = useMemo(() => {
    if (!profile || !isAuthenticated) {
      return null;
    }

    return mapProfileToUser(profile);
  }, [isAuthenticated, profile]);

  return { user, profile };
}

function mapProfileToUser(profile: AdminSessionUser): CurrentUser {
  return {
    id: profile.id,
    displayName: profile.fullName || profile.username || 'User',
    photoURL: null,
    role: profile.role?.code ?? null,
    roleLabel: profile.role?.name ?? null,
    actorType: profile.actorType ?? null,
    username: profile.username,
    phone: profile.phone,
    uiMode: profile.uiMode,
    isActive: profile.isActive,
    isSuperuser: profile.isSuperuser,
    restaurantAccessActive: profile.restaurantAccessActive,
  };
}
