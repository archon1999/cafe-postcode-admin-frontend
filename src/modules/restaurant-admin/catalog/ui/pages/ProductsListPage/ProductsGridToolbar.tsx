import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import type { CatalogCategory } from 'shared/api/admin-types';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { CATALOG_ITEM_STOPLIST_FILTER_VALUES } from '../../../domain';

export type ProductsGridFilters = {
  search: string;
  categories: string[];
  stoplistStatuses: string[];
};

export const DEFAULT_PRODUCTS_GRID_FILTERS: ProductsGridFilters = {
  search: '',
  categories: [],
  stoplistStatuses: [],
};

type ProductsGridToolbarProps = {
  categories: CatalogCategory[];
  value: ProductsGridFilters;
  onChange: (next: ProductsGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function ProductsGridToolbar({
  categories,
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: ProductsGridToolbarProps) {
  const { t } = useTranslate('catalog');
  const categoryOptions = useMemo<DataGridToolbarFilter['options']>(
    () => categories.map((category) => ({ value: category.id, label: category.name })),
    [categories],
  );
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'categories',
        label: t('filters.category'),
        value: value.categories,
        options: categoryOptions,
        onApply: (categoriesValues) => onChange({ ...value, categories: categoriesValues }),
        testId: 'catalog-items-category-filter',
        emptyLabel: t('filters.all'),
      },
      {
        id: 'stoplistStatuses',
        label: t('filters.stoplist'),
        value: value.stoplistStatuses,
        options: CATALOG_ITEM_STOPLIST_FILTER_VALUES.map((status) => ({
          value: status,
          label: t(`labels.${status}`),
        })),
        onApply: (stoplistStatuses) => onChange({ ...value, stoplistStatuses }),
        testId: 'catalog-items-stoplist-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [categoryOptions, onChange, t, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchItemsPlaceholder')}
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
