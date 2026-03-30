import type { TFunction } from 'i18next';

import type { AdminPermission } from 'shared/api/admin-types';

const CATEGORY_TRANSLATION_KEYS: Record<string, string> = {
  dashboard: 'permissionCategories.dashboard',
  constructor: 'permissionCategories.constructor',
  hall: 'permissionCategories.hall',
  table: 'permissionCategories.table',
  users: 'permissionCategories.users',
  roles: 'permissionCategories.roles',
  catalog: 'permissionCategories.catalog',
  stoplist: 'permissionCategories.stoplist',
  orders: 'permissionCategories.orders',
  payments: 'permissionCategories.payments',
  kitchen: 'permissionCategories.kitchen',
  reports: 'permissionCategories.reports',
  integrations: 'permissionCategories.integrations',
};

const ACTION_TRANSLATION_KEYS: Record<string, string> = {
  view: 'permissionActions.view',
  manage: 'permissionActions.manage',
  create: 'permissionActions.create',
  update: 'permissionActions.update',
};

function titleCase(value: string) {
  return value
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

function getTranslationOrUndefined(t: TFunction, key: string | undefined) {
  if (!key) {
    return undefined;
  }

  const translated = t(key);
  return translated === key ? undefined : translated;
}

export function getAdminPermissionCategory(code: string) {
  return code.split('.')[0] ?? '';
}

export function getAdminPermissionAction(code: string) {
  return code.split('.')[1] ?? '';
}

export function getAdminPermissionCategoryLabel(category: string, t: TFunction) {
  return getTranslationOrUndefined(t, CATEGORY_TRANSLATION_KEYS[category]) ?? titleCase(category);
}

export function getAdminPermissionActionLabel(action: string, t: TFunction) {
  return getTranslationOrUndefined(t, ACTION_TRANSLATION_KEYS[action]) ?? titleCase(action);
}

export function getAdminPermissionLabel(permission: Pick<AdminPermission, 'code' | 'name'> | string, t: TFunction) {
  const code = typeof permission === 'string' ? permission : permission.code;
  const category = getAdminPermissionCategory(code);
  const action = getAdminPermissionAction(code);

  if (category && action) {
    return `${getAdminPermissionCategoryLabel(category, t)} / ${getAdminPermissionActionLabel(action, t)}`;
  }

  if (typeof permission !== 'string' && permission.name) {
    return permission.name;
  }

  return titleCase(code);
}
