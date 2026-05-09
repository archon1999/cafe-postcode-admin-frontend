import { useCurrentUser } from '../domain/services/current-user';
import { useAdminScopeStore } from '../domain/stores/admin-scope.store';

import { resolveAdminRestaurantScopeId } from './admin-scope.utils';

export function useAdminRestaurantScopeId() {
  const { profile } = useCurrentUser();
  const selectedRestaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);

  return resolveAdminRestaurantScopeId(profile, selectedRestaurantId);
}
