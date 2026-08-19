import { canUpdateEmployees, type AdminAccessSnapshot } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';

export function canManageEmployee(snapshot?: AdminAccessSnapshot | null) {
  return canUpdateEmployees(snapshot);
}

export function useEmployeeUpdateAccess() {
  const { profile } = useCurrentUser();

  return canManageEmployee(profile);
}
