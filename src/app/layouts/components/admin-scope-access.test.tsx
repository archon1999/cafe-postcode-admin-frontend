/* @vitest-environment jsdom */

import { cleanup, renderHook } from '@testing-library/react';
import type { TFunction } from 'i18next';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RoutePath } from 'app/routes';
import type { AdminSessionUser } from 'shared/api/admin-types';

import { navData } from '../nav-config-dashboard';

import {
  getMissingAdminScopeRequirement,
  hasRequiredAdminScope,
  resolveAdminAccessSnapshot,
  useAdminCreateAccess,
} from './admin-scope-access';
import { getAdminScopeRequirement } from './admin-scope-requirements';

const authState = vi.hoisted(() => ({
  profile: null as AdminSessionUser | null,
  selectedRestaurantId: null as string | null,
}));

vi.mock('modules/auth', () => ({
  useCurrentUser: () => ({ profile: authState.profile }),
  useAdminScopeStore: <T,>(selector: (state: { selectedRestaurantId: string | null }) => T) =>
    selector({ selectedRestaurantId: authState.selectedRestaurantId }),
}));

function createProfile(overrides: Partial<AdminSessionUser> = {}): AdminSessionUser {
  return {
    id: 'user-1',
    username: 'admin',
    fullName: 'Admin User',
    phone: '+998901234567',
    isActive: true,
    role: null,
    permissionCodes: [],
    isSuperuser: false,
    restaurantId: null,
    ...overrides,
  };
}

function getCreateAccess(pathname: string) {
  const { result } = renderHook(() => useAdminCreateAccess(pathname));

  return result.current;
}

beforeEach(() => {
  authState.profile = null;
  authState.selectedRestaurantId = null;
});

afterEach(() => {
  cleanup();
});

describe('getAdminScopeRequirement', () => {
  it.each([
    RoutePath.roleCreate,
    `${RoutePath.permissionList}/add`,
    RoutePath.platformBusinessPartnerCreate,
    `${RoutePath.platformLocalAgentList}/add`,
    RoutePath.platformTariffCreate,
    RoutePath.organizationRestaurantCreate,
  ])('does not require a restaurant for platform-scoped create path %s', (pathname) => {
    expect(getAdminScopeRequirement(pathname)).toBe('none');
  });

  it.each([RoutePath.userCreate, RoutePath.employeeCreate, RoutePath.catalogItemCreate, RoutePath.floorHallCreate])(
    'requires a restaurant for restaurant-scoped create path %s',
    (pathname) => {
      expect(getAdminScopeRequirement(pathname)).toBe('restaurant');
    },
  );

  it('does not require a restaurant outside create pages', () => {
    expect(getAdminScopeRequirement(RoutePath.catalogItemList)).toBe('none');
  });
});

describe('hasRequiredAdminScope', () => {
  it('always allows routes with no scope requirement', () => {
    expect(hasRequiredAdminScope('none', { restaurantId: null })).toBe(true);
    expect(hasRequiredAdminScope('none', { restaurantId: 'restaurant-1' })).toBe(true);
  });

  it('allows restaurant routes only when a restaurant scope exists', () => {
    expect(hasRequiredAdminScope('restaurant', { restaurantId: null })).toBe(false);
    expect(hasRequiredAdminScope('restaurant', { restaurantId: 'restaurant-1' })).toBe(true);
  });
});

describe('getMissingAdminScopeRequirement', () => {
  it('returns only the exact requirement that should render a blocker', () => {
    expect(getMissingAdminScopeRequirement('none', { restaurantId: null })).toBeNull();
    expect(getMissingAdminScopeRequirement('restaurant', { restaurantId: 'restaurant-1' })).toBeNull();
    expect(getMissingAdminScopeRequirement('restaurant', { restaurantId: null })).toBe('restaurant');
  });
});

describe('resolveAdminAccessSnapshot', () => {
  it('keeps the unauthenticated navigation snapshot absent', () => {
    expect(resolveAdminAccessSnapshot(null)).toBeUndefined();
  });

  it('passes only canonical access fields from a loaded profile', () => {
    expect(
      resolveAdminAccessSnapshot(
        createProfile({
          isSuperuser: false,
          permissionCodes: ['reports.view'],
          restaurantAccessActive: true,
          restaurantId: 'restaurant-1',
        }),
      ),
    ).toEqual({
      isSuperuser: false,
      permissionCodes: ['reports.view'],
      restaurantAccessActive: true,
    });
  });
});

describe('useAdminCreateAccess', () => {
  it('uses the selected restaurant for superusers', () => {
    authState.profile = createProfile({ isSuperuser: true });
    authState.selectedRestaurantId = 'restaurant-1';

    expect(getCreateAccess(RoutePath.catalogItemCreate)).toEqual({ requirement: 'restaurant', disabled: false });
  });

  it('blocks a superuser when no restaurant is selected', () => {
    authState.profile = createProfile({ isSuperuser: true });

    expect(getCreateAccess(RoutePath.catalogItemCreate)).toEqual({ requirement: 'restaurant', disabled: true });
  });

  it('uses the assigned restaurant for restaurant admins', () => {
    authState.profile = createProfile({ restaurantId: 'restaurant-2' });

    expect(getCreateAccess(RoutePath.catalogItemCreate)).toEqual({ requirement: 'restaurant', disabled: false });
  });

  it('blocks a restaurant admin whose profile has no restaurant', () => {
    authState.profile = createProfile({ restaurantId: null });

    expect(getCreateAccess(RoutePath.catalogItemCreate)).toEqual({ requirement: 'restaurant', disabled: true });
  });

  it('leaves create actions enabled while the profile is loading', () => {
    expect(getCreateAccess(RoutePath.catalogItemCreate)).toEqual({ requirement: 'restaurant', disabled: false });
  });

  it('does not block platform-scoped create routes without a restaurant', () => {
    authState.profile = createProfile({ restaurantId: null });

    expect(getCreateAccess(RoutePath.roleCreate)).toEqual({ requirement: 'none', disabled: false });
  });
});

describe('dashboard navigation access snapshot', () => {
  const t = ((key: string) => key) as TFunction;

  it('shows no protected navigation sections when a non-superuser has no permissions', () => {
    expect(
      navData(t, {
        isSuperuser: false,
        permissionCodes: [],
        restaurantAccessActive: true,
      }),
    ).toEqual([]);
  });

  it('keeps superuser navigation available even with an empty permission list', () => {
    const titles = navData(t, {
      isSuperuser: true,
      permissionCodes: [],
      restaurantAccessActive: true,
    }).flatMap((section) => section.items.map((item) => item.title));

    expect(titles).toContain('localAgents');
    expect(titles).toContain('businessPartners');
  });
});
