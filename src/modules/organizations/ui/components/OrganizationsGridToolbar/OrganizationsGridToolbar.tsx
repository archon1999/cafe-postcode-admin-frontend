import {
  DataGridFiltersToolbar,
  type DataGridToolbarFilter,
} from 'shared/ui/CustomDataGrid';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

type OrganizationsGridToolbarProps = {
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
  onSave: (nextModel: GridColumnVisibilityModel) => void;
};

export function OrganizationsGridToolbar({
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
  onSave,
}: OrganizationsGridToolbarProps) {
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
      onSaveColumns={onSave}
    />
  );
}
