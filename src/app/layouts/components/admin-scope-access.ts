import { useMemo } from 'react';

import { useAdminScopeStore, useCurrentUser } from 'modules/auth';

import { getAdminScopeRequirement, type AdminScopeRequirement } from './admin-scope-requirements';

type ScopeSnapshot = {
  restaurantId: string | null;
};

export function hasRequiredAdminScope(requirement: AdminScopeRequirement, { restaurantId }: ScopeSnapshot): boolean {
  if (requirement === 'none') {
    return true;
  }

  return Boolean(restaurantId);
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
