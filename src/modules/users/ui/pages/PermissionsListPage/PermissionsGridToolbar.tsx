import { useTranslate } from 'app/providers/locales';
import {
  DataGridFiltersToolbar,
  type DataGridToolbarFilter,
} from 'shared/ui/CustomDataGrid';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

type PermissionsGridToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  scopes: string[];
  onScopesApply: (values: string[]) => void;
  actions: string[];
  onActionsApply: (values: string[]) => void;
  scopeOptions: DataGridToolbarFilter['options'];
  actionOptions: DataGridToolbarFilter['options'];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function PermissionsGridToolbar({
  search,
  onSearchChange,
  onClearSearch,
  scopes,
  onScopesApply,
  actions,
  onActionsApply,
  scopeOptions,
  actionOptions,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: PermissionsGridToolbarProps) {
  const { t } = useTranslate('users');
  const filters: DataGridToolbarFilter[] = [
    {
      id: 'scopes',
      label: t('filters.scope'),
      value: scopes,
      options: scopeOptions,
      onApply: onScopesApply,
      emptyLabel: t('filters.all'),
      testId: 'permissions-list-filter-scope',
    },
    {
      id: 'actions',
      label: t('filters.action'),
      value: actions,
      options: actionOptions,
      onApply: onActionsApply,
      emptyLabel: t('filters.all'),
      testId: 'permissions-list-filter-action',
    },
  ];

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchPermissionsPlaceholder')}
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
