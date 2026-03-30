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
import { useMemo, useState } from 'react';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import type { CatalogItem } from 'shared/api/admin-types';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatMoney } from 'shared/utils/format-money';

import {
  useDeleteCatalogItemMutation,
  useGetCatalogCategoriesQuery,
  useGetCatalogItemsListQuery,
} from '../../../application';
import { CatalogGridToolbar } from '../../components/CatalogGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const ItemsListPage = () => {
  const { t, currentLang } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.catalogItemCreate);
  const deleteItemMutation = useDeleteCatalogItemMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stoplistStatuses, setStoplistStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [itemToDelete, setItemToDelete] = useState<CatalogItem | null>(null);
  const itemsQuery = useGetCatalogItemsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    kindIn: kinds.length ? kinds.join(',') : undefined,
    categoryIdIn: categories.length ? categories.join(',') : undefined,
    isStoplisted: stoplistStatuses.length === 1 ? stoplistStatuses[0] === 'stoplisted' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const categoriesQuery = useGetCatalogCategoriesQuery();

  const kindOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'dish', label: t('kinds.dish') },
      { value: 'drink', label: t('kinds.drink') },
      { value: 'service', label: t('kinds.service') },
      { value: 'penalty', label: t('kinds.penalty') },
    ],
    [t],
  );

  const categoryOptions = useMemo<FilterOption[]>(() => {
    return (categoriesQuery.data ?? []).map((category) => ({ value: category.id, label: category.name }));
  }, [categoriesQuery.data]);

  const stoplistOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'stoplisted', label: t('labels.stoplisted') },
      { value: 'available', label: t('labels.available') },
    ],
    [t],
  );

  const hasActiveFilters = Boolean(search || kinds.length || categories.length || stoplistStatuses.length);

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
        field: 'kind',
        headerName: t('fields.kind'),
        minWidth: 140,
        flex: 0.6,
        valueGetter: (_value, row) => t(`kinds.${row.kind}`),
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
      { field: 'sku', headerName: t('fields.sku'), minWidth: 120, flex: 0.5, valueGetter: (_v, row) => row.sku || '-' },
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

  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.items.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.catalogItemCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createItem', { defaultValue: 'Yangi mahsulot' })}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <ListPageBody>
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
                <CatalogGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchItemsPlaceholder')}
                  clearSearchLabel={t('filters.clearSearch')}
                  search={search}
                  onSearchChange={handleSearchChange}
                  onClearSearch={() => handleSearchChange('')}
                  filters={[
                    {
                      label: t('filters.kind'),
                      value: kinds,
                      options: kindOptions,
                      onChange: setKinds,
                      onApply: (values) => {
                        setKinds(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'catalog-items-kind-filter',
                      emptyLabel: t('filters.all'),
                    },
                    {
                      label: t('filters.category'),
                      value: categories,
                      options: categoryOptions,
                      onChange: setCategories,
                      onApply: (values) => {
                        setCategories(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'catalog-items-category-filter',
                      emptyLabel: t('filters.all'),
                    },
                    {
                      label: t('filters.stoplist'),
                      value: stoplistStatuses,
                      options: stoplistOptions,
                      onChange: setStoplistStatuses,
                      onApply: (values) => {
                        setStoplistStatuses(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'catalog-items-stoplist-filter',
                      emptyLabel: t('filters.all'),
                    },
                  ]}
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
      </ListPageBody>

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
    </ListPageContent>
  );
};

export default ItemsListPage;
