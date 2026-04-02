import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import type { AdminPermission } from 'shared/api/admin-types';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';
import {
  getAdminPermissionAction,
  getAdminPermissionActionLabel,
  getAdminPermissionScope,
  getAdminPermissionScopeLabel,
} from 'shared/utils/admin-permission';

export type PermissionsGridFilters = {
  search: string;
  scopes: string[];
  actions: string[];
};

export const DEFAULT_PERMISSIONS_GRID_FILTERS: PermissionsGridFilters = {
  search: '',
  scopes: [],
  actions: [],
};

type PermissionsGridToolbarProps = {
  permissions: AdminPermission[];
  value: PermissionsGridFilters;
  onChange: (next: PermissionsGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function PermissionsGridToolbar({
  permissions,
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: PermissionsGridToolbarProps) {
  const { t } = useTranslate('users');
  const scopeOptions = useMemo<DataGridToolbarFilter['options']>(() => {
    const scopesSet = new Set(
      permissions.map((permission) => permission.scope ?? getAdminPermissionScope(permission.code)),
    );

    return Array.from(scopesSet)
      .filter(Boolean)
      .map((scope) => ({
        value: scope,
        label: getAdminPermissionScopeLabel(scope, t),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [permissions, t]);
  const actionOptions = useMemo<DataGridToolbarFilter['options']>(() => {
    const actionsSet = new Set(permissions.map((permission) => getAdminPermissionAction(permission.code)));

    return Array.from(actionsSet)
      .filter(Boolean)
      .map((action) => ({
        value: action,
        label: getAdminPermissionActionLabel(action, t),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [permissions, t]);
  const filters: DataGridToolbarFilter[] = [
    {
      id: 'scopes',
      label: t('filters.scope'),
      value: value.scopes,
      options: scopeOptions,
      onApply: (scopes) => onChange({ ...value, scopes }),
      emptyLabel: t('filters.all'),
      testId: 'permissions-list-filter-scope',
    },
    {
      id: 'actions',
      label: t('filters.action'),
      value: value.actions,
      options: actionOptions,
      onApply: (actions) => onChange({ ...value, actions }),
      emptyLabel: t('filters.all'),
      testId: 'permissions-list-filter-action',
    },
  ];

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchPermissionsPlaceholder')}
      clearSearchLabel={t('filters.clearSearch')}
      search={value.search}
      onSearchChange={(search) => onChange({ ...value, search: search.trim() })}
      onClearSearch={() => onChange({ ...value, search: '' })}
      filters={filters}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      defaultColumnVisibilityModel={defaultColumnVisibilityModel}
      onSaveColumns={onSaveColumns}
    />
  );
}
