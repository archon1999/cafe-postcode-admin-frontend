import { describe, expect, it } from 'vitest';

import {
  canAccessAccessControl,
  canAccessAdminPath,
  canAccessMyRestaurantGeneral,
  canAccessMyRestaurantIntegrations,
  canAccessOrders,
  canAccessReports,
  canUpdateEmployees,
  getDefaultAdminPath,
  getDefaultMyRestaurantPath,
  type AdminAccessSnapshot,
} from './admin-access';
import { RoutePath } from './route-paths';

function createSnapshot(permissionCodes: string[], overrides: Partial<AdminAccessSnapshot> = {}): AdminAccessSnapshot {
  return {
    isSuperuser: false,
    permissionCodes,
    restaurantAccessActive: true,
    ...overrides,
  };
}

describe('admin access', () => {
  it('allows reports routes for consolidated report permissions', () => {
    const snapshot = createSnapshot(['reports.view']);
    expect(canAccessReports(snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.reports, snapshot)).toBe(true);
  });

  it('blocks restaurants routes without canonical restaurant permissions', () => {
    const snapshot = createSnapshot(['reports.view']);
    expect(canAccessAdminPath(RoutePath.organizationRestaurantList, snapshot)).toBe(false);
  });

  it('allows my restaurant general when settings permission exists', () => {
    const snapshot = createSnapshot(['restaurant_settings.view']);
    expect(canAccessMyRestaurantGeneral(snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.organizationMyRestaurantGeneral, snapshot)).toBe(true);
  });

  it('allows superuser to open my restaurant general through restaurant scope', () => {
    const snapshot = createSnapshot([], { isSuperuser: true, restaurantAccessActive: false });
    expect(canAccessMyRestaurantGeneral(snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.organizationMyRestaurantGeneral, snapshot)).toBe(true);
  });

  it('allows my restaurant integrations when integration config permission exists', () => {
    const snapshot = createSnapshot(['integration_configs.view']);
    expect(canAccessMyRestaurantIntegrations(snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.organizationMyRestaurantIntegrationConfigList, snapshot)).toBe(true);
  });

  it('picks the first reachable landing path from canonical permissions', () => {
    const snapshot = createSnapshot(['payments.view']);
    expect(getDefaultAdminPath(snapshot)).toBe(RoutePath.paymentList);
  });

  it('keeps employees under restaurant-admin and access-control under user-management', () => {
    const employeeSnapshot = createSnapshot(['employees.view']);
    const roleSnapshot = createSnapshot(['roles.view']);

    expect(canAccessAccessControl(employeeSnapshot)).toBe(false);
    expect(canAccessAdminPath(RoutePath.employeeList, employeeSnapshot)).toBe(true);
    expect(canAccessAccessControl(roleSnapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.roleList, roleSnapshot)).toBe(true);
  });

  it('requires employees.update for employee edit affordances', () => {
    const viewOnlySnapshot = createSnapshot(['employees.view']);
    const updateSnapshot = createSnapshot(['employees.update']);

    expect(canUpdateEmployees(viewOnlySnapshot)).toBe(false);
    expect(canUpdateEmployees(updateSnapshot)).toBe(true);
  });

  it('keeps product-owner scope limited to business partners and tariffs', () => {
    const snapshot = createSnapshot(['business_partners.view', 'tariffs.view']);

    expect(getDefaultAdminPath(snapshot)).toBe(RoutePath.platformBusinessPartnerList);
    expect(canAccessAdminPath(RoutePath.platformBusinessPartnerList, snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.platformTariffList, snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.organizationRestaurantList, snapshot)).toBe(false);
    expect(canAccessAdminPath(RoutePath.userList, snapshot)).toBe(false);
  });

  it('keeps restaurant-admin scope away from roles and permissions pages', () => {
    const snapshot = createSnapshot(['reports.view', 'employees.view', 'orders.view']);

    expect(canAccessAdminPath(RoutePath.reports, snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.employeeList, snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.roleList, snapshot)).toBe(false);
    expect(canAccessAdminPath(RoutePath.permissionList, snapshot)).toBe(false);
  });

  it('prefers my restaurant setup as the restaurant-admin landing page', () => {
    const snapshot = createSnapshot(['reports.view', 'restaurant_settings.view', 'cash_desks.view']);

    expect(getDefaultAdminPath(snapshot)).toBe(RoutePath.organizationMyRestaurant);
    expect(getDefaultMyRestaurantPath(snapshot)).toBe(RoutePath.organizationMyRestaurantSetup);
  });

  it('keeps fast-food admin on restaurant management and catalog without floor access', () => {
    const snapshot = createSnapshot([
      'reports.view',
      'employees.view',
      'restaurant_settings.view',
      'cash_desks.view',
      'catalog_items.view',
    ]);

    expect(canAccessAdminPath(RoutePath.organizationMyRestaurantGeneral, snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.organizationMyRestaurantCashDeskList, snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.catalogBrowser, snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.floorHallList, snapshot)).toBe(false);
    expect(canAccessAdminPath(RoutePath.floorTableSessionList, snapshot)).toBe(false);
  });

  it('does not unlock admin orders route with pos-only mutation permissions', () => {
    const snapshot = createSnapshot(['orders.create']);
    expect(canAccessOrders(snapshot)).toBe(false);
    expect(canAccessAdminPath(RoutePath.orderList, snapshot)).toBe(false);
  });

  it('keeps table sessions admin route read-only', () => {
    const createOnlySnapshot = createSnapshot(['table_sessions.create']);
    const viewSnapshot = createSnapshot(['table_sessions.view']);

    expect(canAccessAdminPath(RoutePath.floorTableSessionList, createOnlySnapshot)).toBe(false);
    expect(canAccessAdminPath(RoutePath.floorTableSessionList, viewSnapshot)).toBe(true);
    expect(getDefaultAdminPath(viewSnapshot)).toBe(RoutePath.floorTableSessionList);
  });
});
