import { describe, expect, it } from 'vitest';

import { resolveAdminRestaurantScopeId } from './admin-scope.utils';

describe('resolveAdminRestaurantScopeId', () => {
  it('uses selected restaurant scope for superusers', () => {
    expect(resolveAdminRestaurantScopeId({ isSuperuser: true, restaurantId: null }, 'restaurant-1')).toBe(
      'restaurant-1',
    );
  });

  it('uses profile restaurant for non-superusers', () => {
    expect(resolveAdminRestaurantScopeId({ isSuperuser: false, restaurantId: 'restaurant-2' }, 'restaurant-1')).toBe(
      'restaurant-2',
    );
  });

  it('returns null when superuser has not selected a restaurant', () => {
    expect(resolveAdminRestaurantScopeId({ isSuperuser: true, restaurantId: null }, null)).toBeNull();
  });
});
