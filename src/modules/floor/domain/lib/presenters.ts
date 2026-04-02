import type { AdminTableSessionStatus } from 'shared/api/admin-types';

export function getTableSessionStatusTranslationKey(status: AdminTableSessionStatus) {
  return `tableSessionStatuses.${status}` as const;
}
