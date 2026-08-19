import type { GridColDef } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { useAdminScopeStore } from 'modules/auth';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';

import { insertBranchColumn, type BranchScopedRow } from './branch-scope-columns.utils';

export function useShowAllBranches() {
  const { profile } = useCurrentUser();
  const selectedRestaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);

  return Boolean(profile?.isSuperuser && !selectedRestaurantId);
}

export function useBranchScopeColumns<R extends BranchScopedRow>(columns: GridColDef<R>[]): GridColDef<R>[] {
  const { t } = useTranslate('common');
  const showBranchColumn = useShowAllBranches();

  return useMemo(
    () => (showBranchColumn ? insertBranchColumn(columns, t('scope.branch')) : columns),
    [columns, showBranchColumn, t],
  );
}
