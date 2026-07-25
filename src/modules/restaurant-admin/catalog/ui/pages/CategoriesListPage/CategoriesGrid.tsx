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
import type { CatalogCategory } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteCatalogCategoryMutation, useGetCatalogCategoriesListQuery } from '../../../application';

import {
  CategoriesGridToolbar,
  type CategoriesGridFilters,
  DEFAULT_CATEGORIES_GRID_FILTERS,
} from './CategoriesGridToolbar';

export function CategoriesGrid() {
  const { t, currentLang } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const deleteCategoryMutation = useDeleteCatalogCategoryMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<CategoriesGridFilters>(DEFAULT_CATEGORIES_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<CatalogCategory | null>(null);
  const categoriesQuery = useGetCatalogCategoriesListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    isActive: filters.statuses.length === 1 ? filters.statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const hasActiveFilters = Boolean(filters.search || filters.statuses.length);
  const handleFiltersChange = useCallback((next: CategoriesGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<CatalogCategory>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 1 },
      { field: 'mxikCode', headerName: t('fields.mxikCode'), minWidth: 180, flex: 0.75 },
      {
        field: 'mxikName',
        headerName: t('fields.mxikName'),
        minWidth: 240,
        flex: 1,
        valueGetter: (_value, row) => row.mxikName || '-',
      },
      {
        field: 'isActive',
        headerName: t('fields.status'),
        minWidth: 130,
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
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        getActions: (params) => [
          <CustomGridActionsCellItem
            actionKind="edit"
            key="edit"
            label={t('actions.edit')}
            icon={<Iconify icon="solar:pen-bold" />}
            href={RouterPathHelper.catalogCategoryEdit(params.row.id)}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete')}
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setCategoryToDelete(params.row)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  const emptyStateMessages = useMemo(
    () => ({
      noData: {
        title: t('empty.categories.noData.title'),
        description: t('empty.categories.noData.description'),
      },
      noResults: {
        title: t('empty.categories.noResults.title'),
        description: t('empty.categories.noResults.description'),
      },
    }),
    [t],
  );

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <DataGrid
          checkboxSelection
          rows={categoriesQuery.data?.data ?? []}
          columns={columns}
          rowCount={categoriesQuery.data?.total ?? 0}
          loading={categoriesQuery.isLoading}
          onRefresh={() => void categoriesQuery.refetch()}
          refreshing={categoriesQuery.isFetching}
          localeText={localeText}
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
              <CategoriesGridToolbar
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
        open={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        title={t('dialogs.deleteCategory.title')}
        content={t('dialogs.deleteCategory.description', {
          name: categoryToDelete?.name ?? '',
        })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteCategoryMutation.isPending}
            onClick={async () => {
              if (!categoryToDelete) return;
              await deleteCategoryMutation.mutateAsync(categoryToDelete.id);
              setCategoryToDelete(null);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />
    </>
  );
}
