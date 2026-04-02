import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { USER_EMPLOYMENT_STATUS_VALUES, type UserManagementSurface } from '../../../domain';

type UsersGridToolbarProps = {
  surface?: UserManagementSurface;
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  roleIds: string[];
  statuses: string[];
  roleOptions: DataGridToolbarFilter['options'];
  onRoleIdsApply: (values: string[]) => void;
  onStatusesApply: (values: string[]) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function UsersGridToolbar({
  surface = 'user',
  search,
  onSearchChange,
  onClearSearch,
  roleIds,
  onRoleIdsApply,
  statuses,
  onStatusesApply,
  roleOptions,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: UsersGridToolbarProps) {
  const { t } = useTranslate('users');
  const filters: DataGridToolbarFilter[] = [
    {
      id: 'roles',
      label: t('filters.role'),
      value: roleIds,
      options: roleOptions,
      onApply: onRoleIdsApply,
      emptyLabel: t('filters.all'),
      testId: 'users-list-filter-role',
    },
    {
      id: 'statuses',
      label: t('filters.status'),
      value: statuses,
      options: USER_EMPLOYMENT_STATUS_VALUES.map((status) => ({
        value: status,
        label: t(`status.${status}`),
      })),
      onApply: onStatusesApply,
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
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchInputTestId="users-list-search"
      filters={filters}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      defaultColumnVisibilityModel={defaultColumnVisibilityModel}
      onSaveColumns={onSaveColumns}
    />
  );
}
