import { matchPath } from 'react-router';

import type { AdminSessionUser } from 'shared/api/admin-types';

import { RoutePath } from './route-paths';

export type AdminAccessSnapshot = Pick<AdminSessionUser, 'isSuperuser' | 'permissionCodes' | 'restaurantAccessActive'>;

type PermissionCode = string;

const BUSINESS_PARTNER_PERMISSION_CODES: PermissionCode[] = [
  'business_partners.view',
  'business_partners.create',
  'business_partners.update',
  'business_partners.activate',
  'business_partners.deactivate',
  'business_partners.reset_password',
];
const TARIFF_PERMISSION_CODES: PermissionCode[] = ['tariffs.view', 'tariffs.create', 'tariffs.update'];
const RESTAURANT_PERMISSION_CODES: PermissionCode[] = [
  'restaurants.view',
  'restaurants.create',
  'restaurants.update',
  'restaurants.activate',
  'restaurants.deactivate',
  'restaurants.reset_password',
  'restaurants.rotate_auth_code',
];
const REPORT_PERMISSION_CODES: PermissionCode[] = ['reports.view'];
const ORDER_PERMISSION_CODES: PermissionCode[] = ['orders.view'];
const PAYMENT_PERMISSION_CODES: PermissionCode[] = ['payments.view', 'receipts.view'];
const KITCHEN_PERMISSION_CODES: PermissionCode[] = ['kitchen_tickets.view'];
const CATALOG_PERMISSION_CODES: PermissionCode[] = [
  'catalog_categories.view',
  'catalog_categories.create',
  'catalog_categories.update',
  'catalog_items.view',
  'catalog_items.create',
  'catalog_items.update',
];
const FLOOR_LAYOUT_PERMISSION_CODES: PermissionCode[] = [
  'halls.view',
  'halls.create',
  'halls.update',
  'zones.view',
  'zones.create',
  'zones.update',
  'tables.view',
  'tables.create',
  'tables.update',
];
const TABLE_SESSION_PERMISSION_CODES: PermissionCode[] = ['table_sessions.view'];
const MY_RESTAURANT_GENERAL_PERMISSION_CODES: PermissionCode[] = [
  'restaurant_settings.view',
  'restaurant_settings.update',
];
const MY_RESTAURANT_CASH_DESK_PERMISSION_CODES: PermissionCode[] = [
  'cash_desks.view',
  'cash_desks.create',
  'cash_desks.update',
];
const MY_RESTAURANT_PREP_STATION_PERMISSION_CODES: PermissionCode[] = [
  'prep_stations.view',
  'prep_stations.create',
  'prep_stations.update',
];
const MY_RESTAURANT_INTEGRATION_CONFIG_PERMISSION_CODES: PermissionCode[] = [
  'integration_configs.view',
  'integration_configs.create',
  'integration_configs.update',
];
const MY_RESTAURANT_PRINT_TEMPLATE_PERMISSION_CODES: PermissionCode[] = [
  'print_templates.view',
  'print_templates.create',
  'print_templates.update',
];
const EMPLOYEE_PERMISSION_CODES: PermissionCode[] = ['employees.view', 'employees.create', 'employees.update'];

const ADMIN_LANDING_CANDIDATES = [
  RoutePath.platformBusinessPartnerList,
  RoutePath.platformLocalAgentList,
  RoutePath.platformTariffList,
  RoutePath.organizationRestaurantList,
  RoutePath.organizationMyRestaurant,
  RoutePath.reports,
  RoutePath.orderList,
  RoutePath.paymentList,
  RoutePath.kitchenTicketList,
  RoutePath.catalogBrowser,
  RoutePath.floorHallList,
  RoutePath.floorTableSessionList,
  RoutePath.employeeList,
  RoutePath.userList,
  RoutePath.roleList,
  RoutePath.permissionList,
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

export function canAccessLocalAgents(snapshot?: AdminAccessSnapshot | null) {
  return Boolean(snapshot?.isSuperuser);
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
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, FLOOR_LAYOUT_PERMISSION_CODES);
}

export function canAccessTableSessions(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, TABLE_SESSION_PERMISSION_CODES);
}

export function canAccessUsers(snapshot?: AdminAccessSnapshot | null) {
  return hasAnyPermission(snapshot, ['users.view', 'users.create', 'users.update']);
}

export function canAccessEmployees(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, EMPLOYEE_PERMISSION_CODES);
}

export function canUpdateEmployees(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, ['employees.update']);
}

export function canAccessRoles(snapshot?: AdminAccessSnapshot | null) {
  return (
    hasActiveRestaurantAccess(snapshot) &&
    hasAnyPermission(snapshot, ['roles.view', 'roles.create', 'roles.update', 'roles.delete'])
  );
}

export function canAccessPermissions(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, ['permissions.view']);
}

export function canAccessMyRestaurant(snapshot?: AdminAccessSnapshot | null) {
  return (
    canAccessMyRestaurantSetup(snapshot) ||
    canAccessMyRestaurantGeneral(snapshot) ||
    canAccessMyRestaurantCashDesks(snapshot) ||
    canAccessMyRestaurantPrepStations(snapshot) ||
    canAccessMyRestaurantIntegrations(snapshot) ||
    canAccessMyRestaurantPrintTemplates(snapshot)
  );
}

export function canAccessMyRestaurantSetup(snapshot?: AdminAccessSnapshot | null) {
  return (
    hasActiveRestaurantAccess(snapshot) &&
    (hasAnyPermission(snapshot, MY_RESTAURANT_GENERAL_PERMISSION_CODES) ||
      hasAnyPermission(snapshot, MY_RESTAURANT_CASH_DESK_PERMISSION_CODES) ||
      hasAnyPermission(snapshot, MY_RESTAURANT_PREP_STATION_PERMISSION_CODES) ||
      hasAnyPermission(snapshot, MY_RESTAURANT_INTEGRATION_CONFIG_PERMISSION_CODES))
  );
}

export function canAccessAccessControl(snapshot?: AdminAccessSnapshot | null) {
  return canAccessUsers(snapshot) || canAccessRoles(snapshot) || canAccessPermissions(snapshot);
}

export function canAccessMyRestaurantGeneral(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_GENERAL_PERMISSION_CODES);
}

export function canAccessMyRestaurantCashDesks(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_CASH_DESK_PERMISSION_CODES);
}

export function canAccessMyRestaurantPrepStations(snapshot?: AdminAccessSnapshot | null) {
  return hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_PREP_STATION_PERMISSION_CODES);
}

export function canAccessMyRestaurantIntegrations(snapshot?: AdminAccessSnapshot | null) {
  return (
    hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_INTEGRATION_CONFIG_PERMISSION_CODES)
  );
}

export function canAccessMyRestaurantPrintTemplates(snapshot?: AdminAccessSnapshot | null) {
  return (
    hasActiveRestaurantAccess(snapshot) && hasAnyPermission(snapshot, MY_RESTAURANT_PRINT_TEMPLATE_PERMISSION_CODES)
  );
}

const MY_RESTAURANT_LANDING_CANDIDATES = [
  RoutePath.organizationMyRestaurantSetup,
  RoutePath.organizationMyRestaurantGeneral,
  RoutePath.organizationMyRestaurantCashDeskList,
  RoutePath.organizationMyRestaurantPrepStationList,
  RoutePath.organizationMyRestaurantIntegrationConfigList,
  RoutePath.organizationMyRestaurantPrintTemplateList,
] as const;

function matchesRoute(pathname: string, path: string) {
  return Boolean(matchPath({ path, end: true }, pathname));
}

export function canAccessAdminPath(pathname: string, snapshot?: AdminAccessSnapshot | null) {
  if (!pathname || pathname === RoutePath.main) {
    return true;
  }

  if (matchesPrefix(pathname, RoutePath.platformBusinessPartnerList)) {
    return canAccessBusinessPartners(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.platformLocalAgentList)) {
    return canAccessLocalAgents(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.platformTariffList)) {
    return canAccessTariffs(snapshot);
  }

  if (pathname === RoutePath.organizationMyRestaurant) {
    return canAccessMyRestaurant(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantSetup)) {
    return canAccessMyRestaurantSetup(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantGeneral)) {
    return canAccessMyRestaurantGeneral(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantCashDeskList)) {
    return canAccessMyRestaurantCashDesks(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantPrepStationList)) {
    return canAccessMyRestaurantPrepStations(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantIntegrationConfigList)) {
    return canAccessMyRestaurantIntegrations(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationMyRestaurantPrintTemplateList)) {
    return canAccessMyRestaurantPrintTemplates(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.organizationRestaurantList)) {
    return canAccessRestaurants(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.reports)) {
    return canAccessReports(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.paymentList) || matchesPrefix(pathname, RoutePath.receiptList)) {
    return canAccessPayments(snapshot);
  }

  if (
    matchesPrefix(pathname, RoutePath.orderItemNoteList) ||
    matchesPrefix(pathname, RoutePath.orderItemList) ||
    pathname === RoutePath.orderList ||
    matchesRoute(pathname, RoutePath.orderView)
  ) {
    return canAccessOrders(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.kitchenTicketList)) {
    return canAccessKitchen(snapshot);
  }

  if (
    matchesPrefix(pathname, RoutePath.catalogBrowser) ||
    matchesPrefix(pathname, RoutePath.catalogCategoryList) ||
    matchesPrefix(pathname, RoutePath.catalogItemList)
  ) {
    return canAccessCatalog(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.floorHallList) || matchesPrefix(pathname, RoutePath.floorZoneList)) {
    return canAccessFloor(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.floorTableSessionList)) {
    return canAccessTableSessions(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.employeeList)) {
    return canAccessEmployees(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.userList)) {
    return canAccessUsers(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.roleList)) {
    return canAccessRoles(snapshot);
  }

  if (matchesPrefix(pathname, RoutePath.permissionList)) {
    return canAccessPermissions(snapshot);
  }

  return true;
}

export function getDefaultAdminPath(snapshot?: AdminAccessSnapshot | null) {
  return ADMIN_LANDING_CANDIDATES.find((path) => canAccessAdminPath(path, snapshot)) ?? null;
}

export function getDefaultMyRestaurantPath(snapshot?: AdminAccessSnapshot | null) {
  return MY_RESTAURANT_LANDING_CANDIDATES.find((path) => canAccessAdminPath(path, snapshot)) ?? null;
}
