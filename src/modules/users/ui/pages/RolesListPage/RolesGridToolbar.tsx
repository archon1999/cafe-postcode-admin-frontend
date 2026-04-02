import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { USER_ROLE_TYPE_VALUES } from '../../../domain';

export type RolesGridFilters = {
  search: string;
  types: string[];
};

export const DEFAULT_ROLES_GRID_FILTERS: RolesGridFilters = {
  search: '',
  types: [],
};

type RolesGridToolbarProps = {
  value: RolesGridFilters;
  onChange: (next: RolesGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function RolesGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: RolesGridToolbarProps) {
  const { t } = useTranslate('users');
  const typeOptions = useMemo<DataGridToolbarFilter['options']>(
    () => [
      { value: USER_ROLE_TYPE_VALUES[0], label: t('labels.system') },
      { value: USER_ROLE_TYPE_VALUES[1], label: t('labels.custom') },
    ],
    [t],
  );
  const filters: DataGridToolbarFilter[] = [
    {
      id: 'types',
      label: t('filters.type'),
      value: value.types,
      options: typeOptions,
      onApply: (types) => onChange({ ...value, types }),
      emptyLabel: t('filters.all'),
      testId: 'roles-list-filter-type',
    },
  ];

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchRolesPlaceholder')}
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
