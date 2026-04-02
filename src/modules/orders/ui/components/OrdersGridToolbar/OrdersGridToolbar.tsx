import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

type OrdersGridToolbarProps = {
  searchLabel: string;
  searchPlaceholder: string;
  clearSearchLabel: string;
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  filters?: DataGridToolbarFilter[];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function OrdersGridToolbar({
  searchLabel,
  searchPlaceholder,
  clearSearchLabel,
  search,
  onSearchChange,
  onClearSearch,
  filters = [],
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: OrdersGridToolbarProps) {
  return (
    <DataGridFiltersToolbar
      searchLabel={searchLabel}
      searchPlaceholder={searchPlaceholder}
      clearSearchLabel={clearSearchLabel}
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      filters={filters}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      defaultColumnVisibilityModel={defaultColumnVisibilityModel}
      onSaveColumns={onSaveColumns}
    />
  );
}
