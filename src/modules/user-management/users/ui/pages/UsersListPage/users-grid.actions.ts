import type { AdminUser } from 'shared/api/admin-types';

import type { UserManagementSurface } from '../../../domain';

export type UsersGridActionKey = 'view' | 'edit' | 'change-pin' | 'activate' | 'deactivate' | 'archive';

type GetUsersGridActionKeysParams = {
  surface: UserManagementSurface;
  canEditEmployee: boolean;
  canChangePin?: boolean;
  employmentStatus?: AdminUser['employmentStatus'];
  isActive?: boolean;
};

export function getUsersGridActionKeys({
  surface,
  canEditEmployee,
  canChangePin = false,
  employmentStatus,
  isActive,
}: GetUsersGridActionKeysParams): UsersGridActionKey[] {
  const actions: UsersGridActionKey[] = ['view'];

  if (surface !== 'employee' || canEditEmployee) {
    actions.push('edit');
  }

  if (surface === 'employee' && canEditEmployee && canChangePin) {
    actions.push('change-pin');
  }

  if (employmentStatus !== 'archived' && (surface !== 'employee' || canEditEmployee)) {
    const currentlyActive = isActive ?? employmentStatus === 'active';
    actions.push(currentlyActive ? 'deactivate' : 'activate');
  }

  if (employmentStatus !== 'archived') {
    actions.push('archive');
  }

  return actions;
}
