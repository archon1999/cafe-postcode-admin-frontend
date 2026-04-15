import type { AdminUser } from 'shared/api/admin-types';

import type { UserManagementSurface } from '../../../domain';

export type UsersGridActionKey = 'view' | 'edit' | 'change-pin' | 'archive';

type GetUsersGridActionKeysParams = {
  surface: UserManagementSurface;
  canEditEmployee: boolean;
  employmentStatus?: AdminUser['employmentStatus'];
};

export function getUsersGridActionKeys({
  surface,
  canEditEmployee,
  employmentStatus,
}: GetUsersGridActionKeysParams): UsersGridActionKey[] {
  const actions: UsersGridActionKey[] = ['view'];

  if (surface !== 'employee' || canEditEmployee) {
    actions.push('edit');
  }

  if (surface === 'employee' && canEditEmployee) {
    actions.push('change-pin');
  }

  if (employmentStatus !== 'archived') {
    actions.push('archive');
  }

  return actions;
}
