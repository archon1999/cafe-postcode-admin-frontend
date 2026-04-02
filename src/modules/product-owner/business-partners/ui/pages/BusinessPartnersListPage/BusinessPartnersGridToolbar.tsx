import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { PLATFORM_RECORD_STATUS_FILTER_VALUES } from '../../../domain';

export type BusinessPartnersGridFilters = {
  search: string;
  statuses: string[];
};

export const DEFAULT_BUSINESS_PARTNERS_GRID_FILTERS: BusinessPartnersGridFilters = {
  search: '',
  statuses: [],
};

type BusinessPartnersGridToolbarProps = {
  value: BusinessPartnersGridFilters;
  onChange: (next: BusinessPartnersGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function BusinessPartnersGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: BusinessPartnersGridToolbarProps) {
  const { t } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'statuses',
        label: t('filters.status'),
        value: value.statuses,
        options: PLATFORM_RECORD_STATUS_FILTER_VALUES.map((status) => ({
          value: status,
          label: tCommon(`status.${status}`),
        })),
        onApply: (statuses) => onChange({ ...value, statuses }),
        testId: 'business-partners-status-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [onChange, t, tCommon, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchBusinessPartnersPlaceholder')}
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
