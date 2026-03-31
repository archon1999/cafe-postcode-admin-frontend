import { describe, expect, it } from "vitest";

import { RoutePath } from "./route-paths";
import { canAccessAdminPath, canAccessMyRestaurantGeneral, canAccessReports, getDefaultAdminPath, type AdminAccessSnapshot } from "./admin-access";

function createSnapshot(permissionCodes: string[], overrides: Partial<AdminAccessSnapshot> = {}): AdminAccessSnapshot {
  return {
    isSuperuser: false,
    permissionCodes,
    restaurantAccessActive: true,
    ...overrides,
  };
}

describe("admin access", () => {
  it("allows reports routes for report view permissions", () => {
    const snapshot = createSnapshot(["reports.sales.view"]);
    expect(canAccessReports(snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.reports, snapshot)).toBe(true);
  });

  it("blocks restaurants routes without canonical restaurant permissions", () => {
    const snapshot = createSnapshot(["reports.sales.view"]);
    expect(canAccessAdminPath(RoutePath.organizationRestaurantList, snapshot)).toBe(false);
  });

  it("allows my restaurant general when settings permission exists", () => {
    const snapshot = createSnapshot(["restaurant_settings.view"]);
    expect(canAccessMyRestaurantGeneral(snapshot)).toBe(true);
    expect(canAccessAdminPath(RoutePath.organizationMyRestaurantGeneral, snapshot)).toBe(true);
  });

  it("picks the first reachable landing path from canonical permissions", () => {
    const snapshot = createSnapshot(["payments.list"]);
    expect(getDefaultAdminPath(snapshot)).toBe(RoutePath.paymentList);
  });
});
