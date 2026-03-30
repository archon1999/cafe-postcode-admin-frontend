import type { AdminSessionUser } from 'shared/api/admin-types';

import { AppRoutesRoot, RoutePath, RouteRootPath } from './route-paths';

export type AdminAccessSnapshot = Pick<AdminSessionUser, 'isSuperuser' | 'permissionCodes' | 'restaurantAccessActive'>;

type PermissionCode = string;

const PARTNER_PERMISSION_CODES: PermissionCode[] = ['partners.view', 'partners.manage'];
const TARIFF_PERMISSION_CODES: PermissionCode[] = ['tariffs.view', 'tariffs.manage'];
const RESTAURANT_PERMISSION_CODES: PermissionCode[] = [
  'restaurants.view',
  'restaurants.manage',
  'restaurants.activate',
  'restaurants.deactivate',
  'restaurants.reset_password',
];
const ORDER_PERMISSION_CODES: PermissionCode[] = ['orders.view', 'orders.manage'];
const PAYMENT_PERMISSION_CODES: PermissionCode[] = ['payments.view', 'payments.manage', 'payments.create'];
const KITCHEN_PERMISSION_CODES: PermissionCode[] = ['kitchen.view', 'kitchen.update', 'kitchen.manage'];
const CATALOG_PERMISSION_CODES: PermissionCode[] = ['catalog.view', 'catalog.manage'];
const FLOOR_PERMISSION_CODES: PermissionCode[] = ['hall.view', 'hall.manage', 'table.manage'];
const MY_RESTAURANT_GENERAL_PERMISSION_CODES: PermissionCode[] = [
  'restaurants.view',
  'restaurants.manage',
  'integrations.manage',
  'cashdesk.manage',
];
const MY_RESTAURANT_CASH_DESK_PERMISSION_CODES: PermissionCode[] = ['cashdesk.manage'];
const MY_RESTAURANT_INTEGRATION_PERMISSION_CODES: PermissionCode[] = ['integrations.manage'];
const SYSTEM_PERMISSION_CODES: PermissionCode[] = ['users.manage', 'permissions.view', 'roles.view'];

const ADMIN_LANDING_CANDIDATES = [
  RoutePath.platformBusinessPartnerList,
  RoutePath.organizationRestaurantList,
  RoutePath.organizationMyRestaurant,
  RoutePath.reports,
  RoutePath.orderList,
  RoutePath.paymentList,
  RoutePath.kitchenTicketList,
  RoutePath.catalogItemList,
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
  return hasAnyPermission(snapshot, PARTNER_PERMISSION_CODES);
}

export function canAccessTariffs(snapshot?: AdminAccessSnapshot | null) {
  return hasAnyPermission(snapshot, TARIFF_PERMISSION_CODES);
}

export function canAccessRestaurants(snapshot?: AdminAccessSnapshot | null) {
  return hasAnyPermission(snapshot, RESTAURANT_PERMISSION_CODES);
}

export function canAccessReports(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, ['reports.view']);
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
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, ['users.manage']);
}

export function canAccessRoles(snapshot?: AdminAccessSnapshot | null) {
  return Boolean(snapshot?.isSuperuser) || hasAnyPermission(snapshot, ['roles.view']);
}

export function canAccessPermissions(snapshot?: AdminAccessSnapshot | null) {
  return Boolean(snapshot?.isSuperuser) || hasAnyPermission(snapshot, ['permissions.view']);
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
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_INTEGRATION_PERMISSION_CODES);
}

export function canAccessMyRestaurantPrepStations(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_INTEGRATION_PERMISSION_CODES);
}

export function canAccessMyRestaurantDistributionPoints(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_INTEGRATION_PERMISSION_CODES);
}

const MY_RESTAURANT_LANDING_CANDIDATES = [
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

  if (
    pathname !== RoutePath.organizationRestaurantList &&
    pathname !== RoutePath.organizationRestaurantCreate &&
    (matchesPrefix(pathname, `${RouteRootPath[AppRoutesRoot.ORGANIZATIONS]}/restaurants/`) ||
      matchesPrefix(pathname, `${RouteRootPath[AppRoutesRoot.ORGANIZATIONS]}/restaurants`))
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
