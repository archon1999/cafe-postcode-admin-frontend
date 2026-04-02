import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import type { AdminHall } from 'shared/api/admin-types';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import { FLOOR_TABLE_SESSION_STATUS_VALUES, getTableSessionStatusTranslationKey } from '../../../domain';

export type TableSessionsGridFilters = {
  search: string;
  halls: string[];
  statuses: string[];
};

export const DEFAULT_TABLE_SESSIONS_GRID_FILTERS: TableSessionsGridFilters = {
  search: '',
  halls: [],
  statuses: [],
};

type TableSessionsGridToolbarProps = {
  halls: AdminHall[];
  value: TableSessionsGridFilters;
  onChange: (next: TableSessionsGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function TableSessionsGridToolbar({
  halls,
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: TableSessionsGridToolbarProps) {
  const { t } = useTranslate('floor');
  const hallOptions = useMemo<DataGridToolbarFilter['options']>(
    () =>
      halls.map((hall) => ({
        value: hall.id,
        label: formatHallDisplayName(hall.name),
      })),
    [halls],
  );
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'halls',
        label: t('filters.hall'),
        value: value.halls,
        options: hallOptions,
        onApply: (hallsValues) => onChange({ ...value, halls: hallsValues }),
        testId: 'table-sessions-hall-filter',
        emptyLabel: t('filters.all'),
      },
      {
        id: 'statuses',
        label: t('filters.status'),
        value: value.statuses,
        options: FLOOR_TABLE_SESSION_STATUS_VALUES.map((status) => ({
          value: status,
          label: t(getTableSessionStatusTranslationKey(status)),
        })),
        onApply: (statuses) => onChange({ ...value, statuses }),
        testId: 'table-sessions-status-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [hallOptions, onChange, t, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchTableSessionsPlaceholder')}
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
