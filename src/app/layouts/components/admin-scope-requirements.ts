import { AppRoutesRoot, RoutePath, RouteRootPath } from 'app/routes';

const NO_SCOPE_PREFIXES = [
  RouteRootPath[AppRoutesRoot.ROLES],
  RouteRootPath[AppRoutesRoot.PERMISSIONS],
  RouteRootPath[AppRoutesRoot.PLATFORM],
  RoutePath.organizationRestaurantList,
];

export type AdminScopeRequirement = 'none' | 'restaurant';

export function getAdminScopeRequirement(pathname: string): AdminScopeRequirement {
  if (!pathname?.endsWith('/add')) {
    return 'none';
  }

  if (NO_SCOPE_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return 'none';
  }

  return 'restaurant';
}
