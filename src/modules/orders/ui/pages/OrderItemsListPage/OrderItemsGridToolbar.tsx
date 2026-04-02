import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { ORDER_ITEM_STATUS_VALUES } from '../../../domain';

export type OrderItemsGridFilters = {
  search: string;
  statuses: string[];
};

export const DEFAULT_ORDER_ITEMS_GRID_FILTERS: OrderItemsGridFilters = {
  search: '',
  statuses: [],
};

type OrderItemsGridToolbarProps = {
  value: OrderItemsGridFilters;
  onChange: (next: OrderItemsGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function OrderItemsGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: OrderItemsGridToolbarProps) {
  const { t } = useTranslate('orders');
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'statuses',
        label: t('filters.status'),
        value: value.statuses,
        options: ORDER_ITEM_STATUS_VALUES.map((status) => ({
          value: status,
          label: t(`orderItemStatuses.${status}`),
        })),
        onApply: (statuses) => onChange({ ...value, statuses }),
        testId: 'order-items-status-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [onChange, t, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchOrderItemsPlaceholder')}
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
