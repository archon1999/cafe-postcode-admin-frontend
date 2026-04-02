import { RoutePath } from 'app/routes';

const NO_SCOPE_PREFIXES = [
  RoutePath.roleList,
  RoutePath.permissionList,
  RoutePath.platformBusinessPartnerList,
  RoutePath.platformTariffList,
  RoutePath.organizationRestaurantList,
];

export type AdminScopeRequirement = 'none' | 'restaurant';

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function getAdminScopeRequirement(pathname: string): AdminScopeRequirement {
  if (!pathname?.endsWith('/add')) {
    return 'none';
  }

  if (NO_SCOPE_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    return 'none';
  }

  return 'restaurant';
}
