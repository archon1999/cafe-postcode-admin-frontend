import type { AdminSessionUser } from 'shared/api/admin-types';

type AdminRestaurantScopeProfile = Pick<AdminSessionUser, 'isSuperuser' | 'restaurantId'>;

export function resolveAdminRestaurantScopeId(
  profile: AdminRestaurantScopeProfile | null | undefined,
  selectedRestaurantId: string | null,
) {
  if (profile?.isSuperuser) {
    return selectedRestaurantId;
  }

  return profile?.restaurantId ?? null;
}
