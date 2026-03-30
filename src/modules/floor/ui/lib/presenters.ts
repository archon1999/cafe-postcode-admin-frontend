import type { AdminLayoutObjectKind, AdminTableSessionStatus } from 'shared/api/admin-types';

export function getLayoutObjectKindTranslationKey(kind: AdminLayoutObjectKind) {
  return `layoutObjectKinds.${kind}` as const;
}

export function getTableSessionStatusTranslationKey(status: AdminTableSessionStatus) {
  return `tableSessionStatuses.${status}` as const;
}
