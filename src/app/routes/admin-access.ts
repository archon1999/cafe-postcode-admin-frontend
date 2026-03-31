import type { AdminSessionUser } from "shared/api/admin-types";

import { AppRoutesRoot, RoutePath, RouteRootPath } from "./route-paths";

export type AdminAccessSnapshot = Pick<AdminSessionUser, "isSuperuser" | "permissionCodes" | "restaurantAccessActive">;

type PermissionCode = string;

const BUSINESS_PARTNER_PERMISSION_CODES: PermissionCode[] = [
  "business_partners.list",
  "business_partners.view",
  "business_partners.create",
  "business_partners.update",
  "business_partners.activate",
  "business_partners.deactivate",
  "business_partners.reset_password",
];
const TARIFF_PERMISSION_CODES: PermissionCode[] = ["tariffs.list", "tariffs.view", "tariffs.create", "tariffs.update"];
const RESTAURANT_PERMISSION_CODES: PermissionCode[] = [
  "restaurants.list",
  "restaurants.view",
  "restaurants.create",
  "restaurants.update",
  "restaurants.delete",
  "restaurants.activate",
  "restaurants.deactivate",
  "restaurants.reset_password",
];
const REPORT_PERMISSION_CODES: PermissionCode[] = [
  "reports.summary.view",
  "reports.sales.view",
  "reports.open_checks.view",
  "reports.top_items.view",
  "reports.top_staff.view",
  "reports.payment_breakdown.view",
  "reports.shifts.view",
];
const ORDER_PERMISSION_CODES: PermissionCode[] = [
  "orders.list",
  "orders.view",
  "order_items.list",
  "order_items.view",
  "order_item_notes.list",
  "order_item_notes.view",
];
const PAYMENT_PERMISSION_CODES: PermissionCode[] = ["payments.list", "payments.view", "receipts.list", "receipts.view"];
const KITCHEN_PERMISSION_CODES: PermissionCode[] = ["kitchen_tickets.list", "kitchen_tickets.view"];
const CATALOG_PERMISSION_CODES: PermissionCode[] = [
  "catalog_categories.list",
  "catalog_categories.view",
  "catalog_categories.create",
  "catalog_categories.update",
  "catalog_items.list",
  "catalog_items.view",
  "catalog_items.create",
  "catalog_items.update",
];
const FLOOR_PERMISSION_CODES: PermissionCode[] = [
  "halls.list",
  "halls.view",
  "halls.create",
  "halls.update",
  "zones.list",
  "zones.view",
  "zones.create",
  "zones.update",
  "tables.list",
  "tables.view",
  "tables.create",
  "tables.update",
  "table_sessions.list",
  "table_sessions.view",
  "table_sessions.create",
  "table_sessions.update",
  "halls.update_layout",
];
const MY_RESTAURANT_GENERAL_PERMISSION_CODES: PermissionCode[] = [
  "restaurant_settings.view",
  "restaurant_settings.update",
  "restaurant_feature_configs.view",
  "restaurant_feature_configs.update",
];
const MY_RESTAURANT_CASH_DESK_PERMISSION_CODES: PermissionCode[] = [
  "cash_desks.list",
  "cash_desks.view",
  "cash_desks.create",
  "cash_desks.update",
];
const MY_RESTAURANT_DEVICE_PERMISSION_CODES: PermissionCode[] = ["devices.list", "devices.view", "devices.create", "devices.update"];
const MY_RESTAURANT_PREP_STATION_PERMISSION_CODES: PermissionCode[] = [
  "prep_stations.list",
  "prep_stations.view",
  "prep_stations.create",
  "prep_stations.update",
];
const MY_RESTAURANT_DISTRIBUTION_POINT_PERMISSION_CODES: PermissionCode[] = [
  "distribution_points.list",
  "distribution_points.view",
  "distribution_points.create",
  "distribution_points.update",
];
const SYSTEM_PERMISSION_CODES: PermissionCode[] = [
  "users.list",
  "users.view",
  "users.create",
  "users.update",
  "roles.list",
  "roles.view",
  "roles.create",
  "roles.update",
  "permissions.list",
];

const ADMIN_LANDING_CANDIDATES = [
  RoutePath.platformBusinessPartnerList,
  RoutePath.organizationRestaurantList,
  RoutePath.organizationMyRestaurant,
  RoutePath.reports,
  RoutePath.orderList,
  RoutePath.paymentList,
  RoutePath.kitchenTicketList,
  RoutePath.catalogBrowser,
  RoutePath.floorHallList,
  RoutePath.userList,
  RoutePath.roleList,
] as const;

function hasActiveRestaurantAccess(snapshot?: AdminAccessSnapshot | null) {
  return Boolean(snapshot?.isSuperuser) || snapshot?.restaurantAccessActive !== false;
}

function hasAnyPermission(snapshot: AdminAccessSnapshot | null | undefined, codes: PermissionCode[]) {
  if (snapshot?.isSuperuser) {
    return true;
  }

  if (!snapshot?.permissionCodes?.length) {
    return false;
  }

  return codes.some((code) => snapshot.permissionCodes.includes(code));
}

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function canAccessBusinessPartners(snapshot?: AdminAccessSnapshot | null) {
  return hasAnyPermission(snapshot, BUSINESS_PARTNER_PERMISSION_CODES);
}

export function canAccessTariffs(snapshot?: AdminAccessSnapshot | null) {
  return hasAnyPermission(snapshot, TARIFF_PERMISSION_CODES);
}

export function canAccessRestaurants(snapshot?: AdminAccessSnapshot | null) {
  return hasAnyPermission(snapshot, RESTAURANT_PERMISSION_CODES);
}

export function canAccessReports(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, REPORT_PERMISSION_CODES);
}

export function canAccessOrders(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, ORDER_PERMISSION_CODES);
}

export function canAccessPayments(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, PAYMENT_PERMISSION_CODES);
}

export function canAccessKitchen(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, KITCHEN_PERMISSION_CODES);
}

export function canAccessCatalog(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, CATALOG_PERMISSION_CODES);
}

export function canAccessFloor(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, FLOOR_PERMISSION_CODES);
}

export function canAccessUsers(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, ["users.list", "users.view", "users.create", "users.update"]);
}

export function canAccessRoles(snapshot?: AdminAccessSnapshot | null) {
  return Boolean(snapshot?.isSuperuser) || hasAnyPermission(snapshot, ["roles.list", "roles.view", "roles.create", "roles.update"]);
}

export function canAccessPermissions(snapshot?: AdminAccessSnapshot | null) {
  return Boolean(snapshot?.isSuperuser) || hasAnyPermission(snapshot, ["permissions.list"]);
}

export function canAccessFeatureConfigs(_snapshot?: AdminAccessSnapshot | null) {
  return false;
}

export function canAccessMyRestaurant(snapshot?: AdminAccessSnapshot | null) {
  return (
    canAccessMyRestaurantGeneral(snapshot) ||
    canAccessMyRestaurantCashDesks(snapshot) ||
    canAccessMyRestaurantDevices(snapshot) ||
    canAccessMyRestaurantPrepStations(snapshot) ||
    canAccessMyRestaurantDistributionPoints(snapshot)
  );
}

export function canAccessSystem(snapshot?: AdminAccessSnapshot | null) {
  return Boolean(snapshot?.isSuperuser) || hasAnyPermission(snapshot, SYSTEM_PERMISSION_CODES);
}

export function canAccessMyRestaurantGeneral(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_GENERAL_PERMISSION_CODES);
}

export function canAccessMyRestaurantCashDesks(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_CASH_DESK_PERMISSION_CODES);
}

export function canAccessMyRestaurantDevices(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_DEVICE_PERMISSION_CODES);
}

export function canAccessMyRestaurantPrepStations(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_PREP_STATION_PERMISSION_CODES);
}

export function canAccessMyRestaurantDistributionPoints(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_DISTRIBUTION_POINT_PERMISSION_CODES);
}

const MY_RESTAURANT_LANDING_CANDIDATES = [
  RoutePath.organizationMyRestaurantGeneral,
  RoutePath.organizationMyRestaurantCashDeskList,
  RoutePath.organizationMyRestaurantPrepStationList,
  RoutePath.organizationMyRestaurantDeviceList,
  RoutePath.organizationMyRestaurantDistributionPointList,
] as const;

export function canAccessAdminPath(pathname: string, snapshot?: AdminAccessSnapshot | null) {
  if (!pathname || pathname === RoutePath.main) {
    return true;
  }

  if (matchesPrefix(pathname, RoutePath.platformBusinessPartnerList)) {
    return canAccessBusinessPartners(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.platformTariffList)) {
    return canAccessTariffs(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationFeatureConfigList)) {
    return canAccessFeatureConfigs(snapshot);
  }

  if (pathname === RoutePath.organizationMyRestaurant) {
    return canAccessMyRestaurant(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantGeneral)) {
    return canAccessMyRestaurantGeneral(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantCashDeskList)) {
    return canAccessMyRestaurantCashDesks(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantDeviceList)) {
    return canAccessMyRestaurantDevices(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantPrepStationList)) {
    return canAccessMyRestaurantPrepStations(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantDistributionPointList)) {
    return canAccessMyRestaurantDistributionPoints(snapshot);
  }

  if (pathname.includes("/restaurants/") && pathname.endsWith("/feature-config")) {
    return canAccessMyRestaurantGeneral(snapshot) || canAccessRestaurants(snapshot);
  }

  if (
    pathname !== RoutePath.organizationRestaurantList &&
    pathname !== RoutePath.organizationRestaurantCreate &&
    matchesPrefix(pathname, `${RouteRootPath[AppRoutesRoot.ORGANIZATIONS]}/restaurants`)
  ) {
    return canAccessRestaurants(snapshot) || canAccessMyRestaurant(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationRestaurantList)) {
    return canAccessRestaurants(snapshot);
  }

  if (matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.ROLES])) {
    return canAccessRoles(snapshot);
  }

  if (matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.PERMISSIONS])) {
    return canAccessPermissions(snapshot);
  }

  if (matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.REPORTS])) {
    return canAccessReports(snapshot);
  }

  if (
    matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.ORDERS]) ||
    matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.ORDER_ITEMS]) ||
    matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.ORDER_ITEM_NOTES])
  ) {
    return canAccessOrders(snapshot);
  }

  if (
    matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.PAYMENTS]) ||
    matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.RECEIPTS])
  ) {
    return canAccessPayments(snapshot);
  }

  if (matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.KITCHEN])) {
    return canAccessKitchen(snapshot);
  }

  if (matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.CATALOG])) {
    return canAccessCatalog(snapshot);
  }

  if (matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.FLOOR])) {
    return canAccessFloor(snapshot);
  }

  if (matchesPrefix(pathname, RouteRootPath[AppRoutesRoot.USERS])) {
    return canAccessUsers(snapshot);
  }

  return true;
}

export function getDefaultAdminPath(snapshot?: AdminAccessSnapshot | null) {
  return ADMIN_LANDING_CANDIDATES.find((path) => canAccessAdminPath(path, snapshot)) ?? null;
}

export function getDefaultMyRestaurantPath(snapshot?: AdminAccessSnapshot | null) {
  return MY_RESTAURANT_LANDING_CANDIDATES.find((path) => canAccessAdminPath(path, snapshot)) ?? null;
}
