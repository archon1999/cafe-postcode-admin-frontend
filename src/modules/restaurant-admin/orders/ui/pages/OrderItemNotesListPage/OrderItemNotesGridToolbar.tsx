import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar } from 'shared/ui/CustomDataGrid';

export type OrderItemNotesGridFilters = {
  search: string;
};

export const DEFAULT_ORDER_ITEM_NOTES_GRID_FILTERS: OrderItemNotesGridFilters = {
  search: '',
};

type OrderItemNotesGridToolbarProps = {
  value: OrderItemNotesGridFilters;
  onChange: (next: OrderItemNotesGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function OrderItemNotesGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: OrderItemNotesGridToolbarProps) {
  const { t } = useTranslate('orders');

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchOrderItemNotesPlaceholder')}
      clearSearchLabel={t('filters.clearSearch')}
      search={value.search}
      onSearchChange={(search) => onChange({ search: search.trim() })}
      onClearSearch={() => onChange(DEFAULT_ORDER_ITEM_NOTES_GRID_FILTERS)}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      defaultColumnVisibilityModel={defaultColumnVisibilityModel}
      onSaveColumns={onSaveColumns}
    />
  );
}
