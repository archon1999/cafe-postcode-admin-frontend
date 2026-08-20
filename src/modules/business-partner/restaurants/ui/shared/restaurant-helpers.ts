import type { AdminRestaurant, AdminRestaurantListItem, AdminRestaurantTariff } from 'shared/api/admin-types';

export type RestaurantActionTarget = {
  id: string;
  name: string;
  isActive: boolean;
  parentId?: string | null;
  tariff?: AdminRestaurantTariff | null;
};

type RestaurantPermissionProfile = {
  isSuperuser?: boolean;
  permissionCodes?: string[];
};

export type RestaurantPermissionAction =
  | 'view'
  | 'create'
  | 'update'
  | 'activate'
  | 'deactivate'
  | 'change_tariff'
  | 'reset_password';

export type RestaurantLifecycleStatus = 'active' | 'inactive' | 'draft' | 'attention';

export function canUseRestaurantPermission(
  profile: RestaurantPermissionProfile | null | undefined,
  action: RestaurantPermissionAction,
) {
  return Boolean(profile?.isSuperuser || profile?.permissionCodes?.includes(`restaurants.${action}`));
}

export function getRestaurantLifecycleStatus(
  restaurant: Pick<AdminRestaurant | AdminRestaurantListItem, 'activatedAt' | 'isActive' | 'restaurantAccessActive'>,
): RestaurantLifecycleStatus {
  const accessActive = Boolean(restaurant.isActive && restaurant.restaurantAccessActive);

  if (accessActive) {
    return 'active';
  }

  if (!restaurant.activatedAt && !restaurant.isActive) {
    return 'draft';
  }

  if (restaurant.isActive !== Boolean(restaurant.restaurantAccessActive)) {
    return 'attention';
  }

  return 'inactive';
}
