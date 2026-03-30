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
import type { CatalogCategory } from 'shared/api/admin-types';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteCatalogCategoryMutation, useGetCatalogCategoriesListQuery } from '../../../application';
import { CatalogGridToolbar } from '../../components/CatalogGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const CategoriesListPage = () => {
  const { t, currentLang } = useTranslate('catalog');
  const { t: tCommon } = useTranslate('common');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.catalogCategoryCreate);
  const deleteCategoryMutation = useDeleteCatalogCategoryMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<CatalogCategory | null>(null);
  const categoriesQuery = useGetCatalogCategoriesListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    isActive: statuses.length === 1 ? statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'active', label: tCommon('status.active') },
      { value: 'inactive', label: tCommon('status.inactive') },
    ],
    [tCommon],
  );

  const hasActiveFilters = Boolean(search || statuses.length);

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
      { field: 'sortOrder', headerName: t('fields.sortOrder'), minWidth: 120, flex: 0.4 },
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
            label={t('actions.edit', { defaultValue: 'Tahrirlash' })}
            icon={<Iconify icon="solar:pen-bold" />}
            href={RouterPathHelper.catalogCategoryEdit(params.row.id)}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete', { defaultValue: "O'chirish" })}
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

  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.categories.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.catalogCategoryCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createCategory', { defaultValue: 'Yangi kategoriya' })}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <ListPageBody>
        <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            checkboxSelection
            rows={categoriesQuery.data?.data ?? []}
            columns={columns}
            rowCount={categoriesQuery.data?.total ?? 0}
            loading={categoriesQuery.isLoading}
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
                  searchPlaceholder={t('filters.searchCategoriesPlaceholder')}
                  clearSearchLabel={t('filters.clearSearch')}
                  search={search}
                  onSearchChange={handleSearchChange}
                  onClearSearch={() => handleSearchChange('')}
                  filters={[
                    {
                      label: t('filters.status'),
                      value: statuses,
                      options: statusOptions,
                      onChange: setStatuses,
                      onApply: (values) => {
                        setStatuses(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'catalog-categories-status-filter',
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
        open={Boolean(categoryToDelete)}
        onClose={() => setCategoryToDelete(null)}
        title={t('dialogs.deleteCategory.title', { defaultValue: "Kategoriyani o'chirish" })}
        content={t('dialogs.deleteCategory.description', {
          defaultValue: `"{{name}}" kategoriyasi o'chiriladi. Davom etilsinmi?`,
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
            {t('actions.delete', { defaultValue: "O'chirish" })}
          </Button>
        }
      />
    </ListPageContent>
  );
};

export default CategoriesListPage;
