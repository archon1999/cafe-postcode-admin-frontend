import { describe, expect, it } from 'vitest';

import {
  canAccessAccessControl,
  canAccessAdminPath,
  canAccessMyRestaurantGeneral,
  canAccessOrders,
  canAccessReports,
  getDefaultAdminPath,
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
