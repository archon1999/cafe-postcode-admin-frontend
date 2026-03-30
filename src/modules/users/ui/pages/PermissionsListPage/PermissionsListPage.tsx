import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminPermission } from 'shared/api/admin-types';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import {
  getAdminPermissionAction,
  getAdminPermissionActionLabel,
  getAdminPermissionCategory,
  getAdminPermissionCategoryLabel,
  getAdminPermissionLabel,
} from 'shared/utils/admin-permission';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useGetPermissionsListQuery, useGetPermissionsQuery } from '../../../application';

import { PermissionsGridToolbar } from './PermissionsGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = {
  type: 'include',
  ids: new Set(),
};

const PermissionsListPage = () => {
  const { t, currentLang } = useTranslate('users');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const permissionsQuery = useGetPermissionsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    categoryIn: categories.length ? categories.join(',') : undefined,
    actionIn: actions.length ? actions.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const permissionsOptionsQuery = useGetPermissionsQuery();

  const categoryOptions = useMemo<FilterOption[]>(() => {
    const categoriesSet = new Set(
      (permissionsOptionsQuery.data ?? []).map((permission) => getAdminPermissionCategory(permission.code)),
    );

    return Array.from(categoriesSet)
      .filter(Boolean)
      .map((category) => ({
        value: category,
        label: getAdminPermissionCategoryLabel(category, t),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [permissionsOptionsQuery.data, t]);

  const actionOptions = useMemo<FilterOption[]>(() => {
    const actionsSet = new Set(
      (permissionsOptionsQuery.data ?? []).map((permission) => getAdminPermissionAction(permission.code)),
    );

    return Array.from(actionsSet)
      .filter(Boolean)
      .map((action) => ({
        value: action,
        label: getAdminPermissionActionLabel(action, t),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [permissionsOptionsQuery.data, t]);
  const hasActiveFilters = Boolean(search || categories.length || actions.length);

  const columns = useMemo<GridColDef<AdminPermission>[]>(
    () => [
      {
        field: 'label',
        headerName: t('fields.permission'),
        minWidth: 260,
        flex: 1,
        valueGetter: (_value, row) => getAdminPermissionLabel(row, t),
      },
      {
        field: 'code',
        headerName: t('fields.code'),
        minWidth: 220,
        flex: 0.9,
      },
      {
        field: 'category',
        headerName: t('fields.category'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (_value, row) => getAdminPermissionCategoryLabel(getAdminPermissionCategory(row.code), t),
      },
      {
        field: 'action',
        headerName: t('fields.action'),
        minWidth: 140,
        flex: 0.5,
        valueGetter: (_value, row) => getAdminPermissionActionLabel(getAdminPermissionAction(row.code), t),
      },
      {
        field: 'description',
        headerName: t('fields.description'),
        minWidth: 320,
        flex: 1.2,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.description || '-'}
          </Typography>
        ),
      },
    ],
    [t],
  );

  const emptyStateMessages = useMemo(
    () => ({
      noData: {
        title: t('empty.permissions.noData.title'),
        description: t('empty.permissions.noData.description'),
      },
      noResults: {
        title: t('empty.permissions.noResults.title'),
        description: t('empty.permissions.noResults.description'),
      },
    }),
    [t],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleClearSearch = () => {
    setSearch('');
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleCategoriesApply = (values: string[]) => {
    setCategories(values);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleActionsApply = (values: string[]) => {
    setActions(values);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.permissions.title')} sx={{ mb: { xs: 3, md: 5 } }} />

      <ListPageBody>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}>
          <DataGrid
            checkboxSelection
            rows={permissionsQuery.data?.data ?? []}
            columns={columns}
            rowCount={permissionsQuery.data?.total ?? 0}
            loading={permissionsQuery.isLoading}
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
                <PermissionsGridToolbar
                  search={search}
                  onSearchChange={handleSearchChange}
                  onClearSearch={handleClearSearch}
                  categories={categories}
                  onCategoriesChange={setCategories}
                  onCategoriesApply={handleCategoriesApply}
                  actions={actions}
                  onActionsChange={setActions}
                  onActionsApply={handleActionsApply}
                  categoryOptions={categoryOptions}
                  actionOptions={actionOptions}
                  columns={columns}
                  columnVisibilityModel={columnVisibilityModel}
                  defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
                  onSaveColumns={setColumnVisibilityModel}
                />
              ),
            }}
            sx={{
              border: 'none',
              [`& .${gridClasses.cell}`]: {
                display: 'flex',
                alignItems: 'center',
              },
              '& .MuiDataGrid-toolbarContainer': {
                px: 2.5,
                py: 2,
              },
            }}
          />
        </Card>
      </ListPageBody>
    </ListPageContent>
  );
};

export default PermissionsListPage;
