import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { ORGANIZATION_BRANCH_KIND_FILTER_VALUES } from '../../../domain';

export type BranchesGridFilters = {
  search: string;
  defaults: string[];
};

export const DEFAULT_BRANCHES_GRID_FILTERS: BranchesGridFilters = {
  search: '',
  defaults: [],
};

type BranchesGridToolbarProps = {
  value: BranchesGridFilters;
  onChange: (next: BranchesGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function BranchesGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: BranchesGridToolbarProps) {
  const { t } = useTranslate('organizations');
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'defaults',
        label: t('filters.default'),
        value: value.defaults,
        options: ORGANIZATION_BRANCH_KIND_FILTER_VALUES.map((branchKind) => ({
          value: branchKind,
          label: t(`labels.${branchKind === 'default' ? 'defaultBranch' : 'regularBranch'}`),
        })),
        onApply: (defaults) => onChange({ ...value, defaults }),
        testId: 'branches-default-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [onChange, t, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchBranchesPlaceholder')}
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
