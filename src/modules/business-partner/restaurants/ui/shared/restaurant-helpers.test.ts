import { describe, expect, it } from 'vitest';

import { canUseRestaurantPermission, getRestaurantLifecycleStatus } from './restaurant-helpers';

describe('restaurant helpers', () => {
  it('resolves lifecycle states without hiding access drift', () => {
    expect(getRestaurantLifecycleStatus({ isActive: true, restaurantAccessActive: true, activatedAt: 'now' })).toBe(
      'active',
    );
    expect(getRestaurantLifecycleStatus({ isActive: false, restaurantAccessActive: false, activatedAt: null })).toBe(
      'draft',
    );
    expect(getRestaurantLifecycleStatus({ isActive: true, restaurantAccessActive: false, activatedAt: 'now' })).toBe(
      'attention',
    );
    expect(getRestaurantLifecycleStatus({ isActive: false, restaurantAccessActive: false, activatedAt: 'now' })).toBe(
      'inactive',
    );
  });

  it('gates individual actions while allowing a superuser', () => {
    expect(canUseRestaurantPermission({ permissionCodes: ['restaurants.view'] }, 'view')).toBe(true);
    expect(canUseRestaurantPermission({ permissionCodes: ['restaurants.view'] }, 'update')).toBe(false);
    expect(canUseRestaurantPermission({ isSuperuser: true }, 'change_tariff')).toBe(true);
  });
});
