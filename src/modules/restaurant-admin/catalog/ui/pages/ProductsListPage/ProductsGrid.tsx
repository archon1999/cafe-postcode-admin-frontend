import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { CatalogItem } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatMoney } from 'shared/utils/format-money';

import {
  useDeleteCatalogItemMutation,
  useGetCatalogCategoriesQuery,
  useGetCatalogItemsListQuery,
} from '../../../application';

import { DEFAULT_PRODUCTS_GRID_FILTERS, type ProductsGridFilters, ProductsGridToolbar } from './ProductsGridToolbar';

export const ProductsGrid = () => {
  const { t, currentLang } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const deleteItemMutation = useDeleteCatalogItemMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<ProductsGridFilters>(DEFAULT_PRODUCTS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const itemsQuery = useGetCatalogItemsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    categoryIdIn: filters.categories.length ? filters.categories.join(',') : undefined,
    isStoplisted: filters.stoplistStatuses.length === 1 ? filters.stoplistStatuses[0] === 'stoplisted' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const categoriesQuery = useGetCatalogCategoriesQuery();
  const hasActiveFilters = Boolean(filters.search || filters.categories.length || filters.stoplistStatuses.length);
  const handleFiltersChange = useCallback((next: ProductsGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<CatalogItem>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 1 },
      {
        field: 'mxikCode',
        headerName: t('fields.mxikCode'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_v, row) => row.mxikCode || '-',
      },
      {
        field: 'mxikName',
        headerName: t('fields.mxikName'),
        minWidth: 220,
        flex: 0.9,
        valueGetter: (_v, row) => row.mxikName || '-',
      },
      {
        field: 'categoryName',
        headerName: t('fields.category'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_value, row) => row.categoryName || '-',
      },
      {
        field: 'prepStationName',
        headerName: t('fields.prepStation'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_value, row) => row.prepStationName || '-',
      },
      {
        field: 'isActive',
        headerName: t('fields.status'),
        minWidth: 120,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isActive ? tCommon('status.active') : tCommon('status.inactive')}
            color={row.isActive ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        field: 'isStoplisted',
        headerName: t('fields.stoplist'),
        minWidth: 120,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isStoplisted ? t('labels.stoplisted') : t('labels.available')}
            color={row.isStoplisted ? 'error' : 'info'}
            variant="soft"
          />
        ),
      },
      {
        field: 'price',
        headerName: t('fields.price'),
        minWidth: 160,
        flex: 0.55,
        renderCell: ({ row }) => formatMoney(row.price),
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        getActions: (params) => [
          <CustomGridActionsCellItem
            actionKind="edit"
            key="edit"
            label={t('actions.edit', { defaultValue: 'Tahrirlash' })}
            icon={<Iconify icon="solar:pen-bold" />}
            href={RouterPathHelper.catalogItemEdit(params.row.id)}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete', { defaultValue: "O'chirish" })}
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setItemToDelete(params.row)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  const emptyStateMessages = useMemo(
    () => ({
      noData: {
        title: t('empty.items.noData.title'),
        description: t('empty.items.noData.description'),
      },
      noResults: {
        title: t('empty.items.noResults.title'),
        description: t('empty.items.noResults.description'),
      },
    }),
    [t],
  );

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <DataGrid
          checkboxSelection
          rows={itemsQuery.data?.data ?? []}
          columns={columns}
          rowCount={itemsQuery.data?.total ?? 0}
          loading={itemsQuery.isLoading}
          localeText={localeText}
          rowHeight={64}
          pageSizeOptions={[10, 20, 50]}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          rowSelectionModel={selectedRows}
          onRowSelectionModelChange={setSelectedRows}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          disableRowSelectionOnClick
          disableColumnFilter
          disableColumnMenu
          slots={{
            noRowsOverlay: () => (
              <DataGridEmptyState
                hasActiveFilters={hasActiveFilters}
                noData={emptyStateMessages.noData}
                noResults={emptyStateMessages.noResults}
              />
            ),
            noResultsOverlay: () => (
              <DataGridEmptyState
                forceFiltered
                noData={emptyStateMessages.noData}
                noResults={emptyStateMessages.noResults}
              />
            ),
            toolbar: () => (
              <ProductsGridToolbar
                categories={categoriesQuery.data ?? []}
                value={filters}
                onChange={handleFiltersChange}
                columns={columns}
                columnVisibilityModel={columnVisibilityModel}
                defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
                onSaveColumns={setColumnVisibilityModel}
              />
            ),
          }}
          sx={{
            border: 'none',
            [`& .${gridClasses.cell}`]: { display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-toolbarContainer': { px: 2.5, py: 2 },
          }}
        />
      </Card>

      <ConfirmDialog
        open={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        title={t('dialogs.deleteItem.title', { defaultValue: "Mahsulotni o'chirish" })}
        content={t('dialogs.deleteItem.description', {
          defaultValue: `"{{name}}" mahsuloti o'chiriladi. Davom etilsinmi?`,
          name: itemToDelete?.name ?? '',
        })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteItemMutation.isPending}
            onClick={async () => {
              if (!itemToDelete) return;
              await deleteItemMutation.mutateAsync(itemToDelete.id);
              setItemToDelete(null);
            }}>
            {t('actions.delete', { defaultValue: "O'chirish" })}
          </Button>
        }
      />
    </>
  );
};
