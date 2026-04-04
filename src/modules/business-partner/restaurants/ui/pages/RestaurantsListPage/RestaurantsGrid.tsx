import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import {
  useResetRestaurantPasswordMutation,
  useRotateRestaurantAuthCodeMutation,
} from 'modules/product-owner/business-partners/application';
import type { AdminRestaurant } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useGetRestaurantsListQuery } from '../../../application';
import {
  RestaurantActivateDialog,
  RestaurantCredentialsDialog,
  RestaurantDeactivateDialog,
  RestaurantDeleteDialog,
  type RestaurantCredentialsDialogState,
} from '../../components';

import {
  DEFAULT_RESTAURANTS_GRID_FILTERS,
  type RestaurantsGridFilters,
  RestaurantsGridToolbar,
} from './RestaurantsGridToolbar';

export function RestaurantsGrid() {
  const { t, currentLang } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const resetPasswordMutation = useResetRestaurantPasswordMutation();
  const rotateAuthCodeMutation = useRotateRestaurantAuthCodeMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<RestaurantsGridFilters>(DEFAULT_RESTAURANTS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToDelete, setRowToDelete] = useState<AdminRestaurant | null>(null);
  const [rowToDeactivate, setRowToDeactivate] = useState<AdminRestaurant | null>(null);
  const [rowToActivate, setRowToActivate] = useState<AdminRestaurant | null>(null);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState<RestaurantCredentialsDialogState>(null);
  const query = useGetRestaurantsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    isActive: filters.statuses.length === 1 ? filters.statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const hasActiveFilters = Boolean(filters.search || filters.statuses.length);
  const handleFiltersChange = useCallback((next: RestaurantsGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<AdminRestaurant>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 1 },
      { field: 'legalName', headerName: t('fields.legalName'), minWidth: 200, flex: 1 },
      { field: 'phone', headerName: t('fields.phone'), minWidth: 160, flex: 0.7 },
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
            href={RouterPathHelper.organizationRestaurantEdit(params.row.id)}
          />,
          <CustomGridActionsCellItem
            actionKind="view"
            key="reset-password"
            label={tPlatform('actions.resetPassword')}
            icon={<Iconify icon="solar:refresh-bold" />}
            showInMenu
            disabled={!params.row.isActive}
            onClick={async () => {
              const result = await resetPasswordMutation.mutateAsync(params.row.id);
              setCredentialsDialogOpen({
                credentials: { username: result.username, password: result.password },
                authCode: null,
                mode: 'reset',
              });
            }}
          />,
          <CustomGridActionsCellItem
            actionKind="view"
            key="rotate-auth-code"
            label={tPlatform('actions.rotateAuthCode', { defaultValue: 'Aktivatsiya kodini yangilash' })}
            icon={<Iconify icon="solar:refresh-bold" />}
            showInMenu
            onClick={async () => {
              const result = await rotateAuthCodeMutation.mutateAsync(params.row.id);
              setCredentialsDialogOpen({
                credentials: null,
                authCode: result.authCode ?? null,
                mode: 'auth_code',
              });
            }}
          />,
          <CustomGridActionsCellItem
            actionKind={params.row.isActive ? 'delete' : 'view'}
            key="activate"
            label={params.row.isActive ? tPlatform('actions.deactivate') : tPlatform('actions.activate')}
            icon={<Iconify icon={params.row.isActive ? 'solar:lock-keyhole-bold' : 'solar:play-bold'} />}
            onClick={() => {
              if (params.row.isActive) {
                setRowToDeactivate(params.row);
                return;
              }

              setRowToActivate(params.row);
            }}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete')}
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setRowToDelete(params.row)}
          />,
        ],
      },
    ],
    [resetPasswordMutation, rotateAuthCodeMutation, t, tCommon, tPlatform],
  );

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <DataGrid
          checkboxSelection
          rows={query.data?.data ?? []}
          columns={columns}
          rowCount={query.data?.total ?? 0}
          loading={query.isLoading || resetPasswordMutation.isPending || rotateAuthCodeMutation.isPending}
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
                noData={{
                  title: t('empty.restaurants.noData.title'),
                  description: t('empty.restaurants.noData.description'),
                }}
                noResults={{
                  title: t('empty.restaurants.noResults.title'),
                  description: t('empty.restaurants.noResults.description'),
                }}
              />
            ),
            noResultsOverlay: () => (
              <DataGridEmptyState
                forceFiltered
                noData={{
                  title: t('empty.restaurants.noData.title'),
                  description: t('empty.restaurants.noData.description'),
                }}
                noResults={{
                  title: t('empty.restaurants.noResults.title'),
                  description: t('empty.restaurants.noResults.description'),
                }}
              />
            ),
            toolbar: () => (
              <RestaurantsGridToolbar
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

      <RestaurantDeleteDialog
        open={rowToDelete}
        onClose={() => setRowToDelete(null)}
        onSuccess={() => setRowToDelete(null)}
      />

      <RestaurantDeactivateDialog
        open={rowToDeactivate}
        onClose={() => setRowToDeactivate(null)}
        onSuccess={() => setRowToDeactivate(null)}
      />

      <RestaurantActivateDialog
        open={rowToActivate}
        onClose={() => setRowToActivate(null)}
        onSuccess={(result) => {
          setRowToActivate(null);
          setCredentialsDialogOpen({
            credentials: { username: result.username, password: result.password },
            authCode: result.restaurant.authCode ?? null,
            mode: 'activation',
          });
        }}
      />

      <RestaurantCredentialsDialog
        open={credentialsDialogOpen}
        onClose={() => setCredentialsDialogOpen(null)}
      />
    </>
  );
}
