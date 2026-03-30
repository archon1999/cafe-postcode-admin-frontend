import type { TFunction } from 'i18next';

import type { AdminRole } from 'shared/api/admin-types';

const ROLE_TRANSLATION_KEYS: Record<string, string> = {
  admin: 'roles.admin',
  owner: 'roles.owner',
  manager: 'roles.manager',
  waiter: 'roles.waiter',
  cashier: 'roles.cashier',
  chef: 'roles.chef',
  barman: 'roles.barman',
  universal_operator: 'roles.universalOperator',
};

export function getAdminRoleLabel(role: AdminRole | null | undefined, t: TFunction<'users'>) {
  if (!role) {
    return null;
  }

  const translationKey = ROLE_TRANSLATION_KEYS[role.code];

  if (!translationKey) {
    return role.name;
  }

  return t(translationKey, { defaultValue: role.name });
}
