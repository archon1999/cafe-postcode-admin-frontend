import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { FLOOR_RECORD_STATUS_FILTER_VALUES } from '../../../domain';

export type HallsGridFilters = {
  search: string;
  statuses: string[];
};

export const DEFAULT_HALLS_GRID_FILTERS: HallsGridFilters = {
  search: '',
  statuses: [],
};

type HallsGridToolbarProps = {
  value: HallsGridFilters;
  onChange: (next: HallsGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function HallsGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: HallsGridToolbarProps) {
  const { t } = useTranslate('floor');
  const { t: tCommon } = useTranslate('common');
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'statuses',
        label: t('filters.status'),
        value: value.statuses,
        options: FLOOR_RECORD_STATUS_FILTER_VALUES.map((status) => ({
          value: status,
          label: tCommon(`status.${status}`),
        })),
        onApply: (statuses) => onChange({ ...value, statuses }),
        testId: 'halls-status-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [onChange, t, tCommon, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchHallsPlaceholder')}
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
