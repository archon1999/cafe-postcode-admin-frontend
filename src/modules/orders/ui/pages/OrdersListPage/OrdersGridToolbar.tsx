import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { ORDER_CHANNEL_VALUES, ORDER_STATUS_VALUES } from '../../../domain';

export type OrdersGridFilters = {
  search: string;
  statuses: string[];
  channels: string[];
};

export const DEFAULT_ORDERS_GRID_FILTERS: OrdersGridFilters = {
  search: '',
  statuses: [],
  channels: [],
};

type OrdersGridToolbarProps = {
  value: OrdersGridFilters;
  onChange: (next: OrdersGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function OrdersGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: OrdersGridToolbarProps) {
  const { t } = useTranslate('orders');
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'statuses',
        label: t('filters.status'),
        value: value.statuses,
        options: ORDER_STATUS_VALUES.map((status) => ({
          value: status,
          label: t(`statuses.${status}`),
        })),
        onApply: (statuses) => onChange({ ...value, statuses }),
        testId: 'orders-status-filter',
        emptyLabel: t('filters.all'),
      },
      {
        id: 'channels',
        label: t('filters.channel'),
        value: value.channels,
        options: ORDER_CHANNEL_VALUES.map((channel) => ({
          value: channel,
          label: t(`channels.${channel}`),
        })),
        onApply: (channels) => onChange({ ...value, channels }),
        testId: 'orders-channel-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [onChange, t, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchOrdersPlaceholder')}
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
