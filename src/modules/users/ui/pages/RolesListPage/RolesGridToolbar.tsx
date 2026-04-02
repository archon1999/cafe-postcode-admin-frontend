import { useTranslate } from 'app/providers/locales';
import {
  DataGridFiltersToolbar,
  type DataGridToolbarFilter,
} from 'shared/ui/CustomDataGrid';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

type RolesGridToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  types: string[];
  onTypesApply: (values: string[]) => void;
  typeOptions: DataGridToolbarFilter['options'];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function RolesGridToolbar({
  search,
  onSearchChange,
  onClearSearch,
  types,
  onTypesApply,
  typeOptions,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: RolesGridToolbarProps) {
  const { t } = useTranslate('users');
  const filters: DataGridToolbarFilter[] = [
    {
      id: 'types',
      label: t('filters.type'),
      value: types,
      options: typeOptions,
      onApply: onTypesApply,
      emptyLabel: t('filters.all'),
      testId: 'roles-list-filter-type',
    },
  ];

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchRolesPlaceholder')}
      clearSearchLabel={t('filters.clearSearch')}
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
