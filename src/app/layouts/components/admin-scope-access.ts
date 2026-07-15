import { useMemo } from 'react';

import type { AdminAccessSnapshot } from 'app/routes';
import { useAdminScopeStore, useCurrentUser } from 'modules/auth';
import type { AdminSessionUser } from 'shared/api/admin-types';

import { getAdminScopeRequirement, type AdminScopeRequirement } from './admin-scope-requirements';

type ScopeSnapshot = {
  restaurantId: string | null;
};

type AdminAccessProfile = Pick<AdminSessionUser, 'isSuperuser' | 'permissionCodes' | 'restaurantAccessActive'>;

type BlockingAdminScopeRequirement = Exclude<AdminScopeRequirement, 'none'>;

export function resolveAdminAccessSnapshot(
  profile: AdminAccessProfile | null | undefined,
): AdminAccessSnapshot | undefined {
  if (!profile) {
    return undefined;
  }

  return {
    isSuperuser: profile.isSuperuser,
    permissionCodes: profile.permissionCodes,
    restaurantAccessActive: profile.restaurantAccessActive,
  };
}

export function getMissingAdminScopeRequirement(
  requirement: AdminScopeRequirement,
  { restaurantId }: ScopeSnapshot,
): BlockingAdminScopeRequirement | null {
  if (requirement === 'none' || restaurantId) {
    return null;
  }

  return requirement;
}

export function hasRequiredAdminScope(requirement: AdminScopeRequirement, scope: ScopeSnapshot): boolean {
  return getMissingAdminScopeRequirement(requirement, scope) === null;
}

export function useAdminCreateAccess(pathname: string) {
  const { profile } = useCurrentUser();
  const selectedRestaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);

  return useMemo(() => {
    const requirement = getAdminScopeRequirement(pathname);

    if (!profile) {
      return { requirement, disabled: false };
    }

    const scope = profile.isSuperuser
      ? {
          restaurantId: selectedRestaurantId,
        }
      : {
          restaurantId: profile.restaurantId ?? null,
        };

    return {
      requirement,
      disabled: !hasRequiredAdminScope(requirement, scope),
    };
  }, [pathname, profile, selectedRestaurantId]);
}
