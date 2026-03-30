import type { TFunction } from 'i18next';

import type { AdminRole } from 'shared/api/admin-types';

export function getAdminRoleLabel(role: AdminRole | null | undefined, _t: TFunction<'users'>) {
  if (!role) {
    return null;
  }

  return role.name;
}
