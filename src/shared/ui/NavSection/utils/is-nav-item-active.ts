import { isActiveLink } from 'minimal-shared/utils';

import type { NavItemDataProps } from '../model/types.ts';

const resolveDeepMatch = (item: NavItemDataProps) => item.deepMatch ?? true;

export function isNavItemActive(pathname: string, item: NavItemDataProps): boolean {
  if (isActiveLink(pathname, item.path, resolveDeepMatch(item))) {
    return true;
  }

  if (!item.children?.length) {
    return false;
  }

  return item.children.some((child) => isNavItemActive(pathname, child));
}
