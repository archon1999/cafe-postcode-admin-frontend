import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import type { AdminRole } from 'shared/api/admin-types';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { USER_EMPLOYMENT_STATUS_VALUES, type UserManagementSurface } from '../../../domain';

export type UsersGridFilters = {
  search: string;
  roleIds: string[];
  statuses: string[];
};

export const DEFAULT_USERS_GRID_FILTERS: UsersGridFilters = {
  search: '',
  roleIds: [],
  statuses: [],
};

export type UsersGridToolbarProps = {
  surface?: UserManagementSurface;
  roles: AdminRole[];
  value: UsersGridFilters;
  onChange: (next: UsersGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function UsersGridToolbar({
  surface = 'user',
  roles,
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: UsersGridToolbarProps) {
  const { t } = useTranslate('users');
  const roleOptions = useMemo<DataGridToolbarFilter['options']>(
    () =>
      roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [roles],
  );
  const filters: DataGridToolbarFilter[] = [
    {
      id: 'roles',
      label: t('filters.role'),
      value: value.roleIds,
      options: roleOptions,
      onApply: (roleIds) => onChange({ ...value, roleIds }),
      emptyLabel: t('filters.all'),
      testId: 'users-list-filter-role',
    },
    {
      id: 'statuses',
      label: t('filters.status'),
      value: value.statuses,
      options: USER_EMPLOYMENT_STATUS_VALUES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      })),
      onApply: (statuses) => onChange({ ...value, statuses }),
      emptyLabel: t('filters.all'),
      testId: 'users-list-filter-status',
    },
  ];

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={
        surface === 'employee' ? t('filters.employeeSearchPlaceholder') : t('filters.searchPlaceholder')
      }
      clearSearchLabel={t('filters.clearSearch')}
      search={value.search}
      onSearchChange={(search) => onChange({ ...value, search: search.trim() })}
      onClearSearch={() => onChange({ ...value, search: '' })}
      searchInputTestId="users-list-search"
      filters={filters}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      defaultColumnVisibilityModel={defaultColumnVisibilityModel}
      onSaveColumns={onSaveColumns}
    />
  );
}
