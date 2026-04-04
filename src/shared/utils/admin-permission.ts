import type { TFunction } from 'i18next';

import type { AdminPermission } from 'shared/api/admin-types';

const SCOPE_TRANSLATION_KEYS: Record<string, string> = {
  admin: 'permissionScopes.admin',
  pos: 'permissionScopes.pos',
  dashboard: 'permissionScopes.dashboard',
};

const ACTION_TRANSLATION_KEYS: Record<string, string> = {
  list: 'permissionActions.list',
  view: 'permissionActions.view',
  manage: 'permissionActions.manage',
  create: 'permissionActions.create',
  update: 'permissionActions.update',
  delete: 'permissionActions.delete',
  activate: 'permissionActions.activate',
  deactivate: 'permissionActions.deactivate',
  reset_password: 'permissionActions.resetPassword',
  rotate_auth_code: 'permissionActions.rotateAuthCode',
  open: 'permissionActions.open',
  close: 'permissionActions.close',
  refund: 'permissionActions.refund',
  reprint: 'permissionActions.reprint',
};

const POS_PERMISSION_PREFIXES = [
  'halls.',
  'table_sessions.',
  'catalog_menu.',
  'open_checks.',
  'orders.',
  'payments.',
  'kitchen_queue.',
  'kitchen_tickets.',
] as const;

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

export function getAdminPermissionScope(code: string) {
  if (code.startsWith('dashboard.')) {
    return 'dashboard';
  }

  if (POS_PERMISSION_PREFIXES.some((prefix) => code.startsWith(prefix))) {
    return 'pos';
  }

  return 'admin';
}

export function getAdminPermissionAction(code: string) {
  const segments = code.split('.');
  return segments[segments.length - 1] ?? '';
}

export function getAdminPermissionScopeLabel(scope: string, t: TFunction) {
  return getTranslationOrUndefined(t, SCOPE_TRANSLATION_KEYS[scope]) ?? titleCase(scope);
}

export function getAdminPermissionActionLabel(action: string, t: TFunction) {
  return getTranslationOrUndefined(t, ACTION_TRANSLATION_KEYS[action]) ?? titleCase(action);
}

export function getAdminPermissionLabel(permission: Pick<AdminPermission, 'code' | 'name'> | string, t: TFunction) {
  if (typeof permission !== 'string' && permission.name) {
    return permission.name;
  }

  const code = typeof permission === 'string' ? permission : permission.code;
  const scope = getAdminPermissionScope(code);
  const action = getAdminPermissionAction(code);

  if (scope && action) {
    return `${getAdminPermissionScopeLabel(scope, t)} / ${getAdminPermissionActionLabel(action, t)}`;
  }

  return titleCase(code);
}
