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
import { useEffect, useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import {
  useActivateRestaurantMutation,
  useDeactivateRestaurantMutation,
  useGetTariffsListQuery,
  useResetRestaurantPasswordMutation,
} from 'modules/platform/application';
import { CredentialsRevealDialog } from 'modules/platform/ui/components/CredentialsRevealDialog';
import { RestaurantActivationDialog } from 'modules/platform/ui/components/RestaurantActivationDialog';
import type { AdminRestaurant } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteRestaurantMutation, useGetRestaurantsListQuery } from '../../../application';
import { OrganizationsGridToolbar } from '../../components/OrganizationsGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const RestaurantsListPage = () => {
  const { t, currentLang } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const canManageRestaurants = canAccessRestaurants(profile);
  const deleteMutation = useDeleteRestaurantMutation();
  const activateMutation = useActivateRestaurantMutation();
  const deactivateMutation = useDeactivateRestaurantMutation();
  const resetPasswordMutation = useResetRestaurantPasswordMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToDelete, setRowToDelete] = useState<AdminRestaurant | null>(null);
  const [rowToDeactivate, setRowToDeactivate] = useState<AdminRestaurant | null>(null);
  const [rowToActivate, setRowToActivate] = useState<AdminRestaurant | null>(null);
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(null);
  const [credentialsDialogTitle, setCredentialsDialogTitle] = useState('');
  const [credentialsDialogDescription, setCredentialsDialogDescription] = useState('');
  const query = useGetRestaurantsListQuery(
    {
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      isActive: statuses.length === 1 ? statuses[0] === 'active' : undefined,
      ordering: getOrderingFromSortModel(sortModel),
    },
    { enabled: canManageRestaurants },
  );
  const tariffsQuery = useGetTariffsListQuery(
    {
      page: 1,
      pageSize: 100,
      isActive: true,
    },
    { enabled: canManageRestaurants },
  );

  useEffect(() => {
    if (profile && !canManageRestaurants) {
      replace(RoutePath.main);
    }
  }, [canManageRestaurants, profile, replace]);

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'active', label: tCommon('status.active') },
      { value: 'inactive', label: tCommon('status.inactive') },
    ],
    [tCommon],
  );

  const hasActiveFilters = Boolean(search || statuses.length);

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
              setCredentials({ username: result.username, password: result.password });
              setCredentialsDialogTitle(tPlatform('dialogs.restaurantCredentials.title'));
              setCredentialsDialogDescription(tPlatform('dialogs.restaurantCredentials.resetDescription'));
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
    [resetPasswordMutation, t, tCommon, tPlatform],
  );

  if (profile && !canManageRestaurants) {
    return null;
  }

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.restaurants.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.organizationRestaurantCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}>
            {t('actions.createRestaurant')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <ListPageBody>
        <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            checkboxSelection
            rows={query.data?.data ?? []}
            columns={columns}
            rowCount={query.data?.total ?? 0}
            loading={
              query.isLoading ||
              activateMutation.isPending ||
              deactivateMutation.isPending ||
              resetPasswordMutation.isPending
            }
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
                <OrganizationsGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchRestaurantsPlaceholder')}
                  clearSearchLabel={t('filters.clearSearch')}
                  search={search}
                  onSearchChange={setSearch}
                  onClearSearch={() => setSearch('')}
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
                      testId: 'restaurants-status-filter',
                      emptyLabel: t('filters.all'),
                    },
                  ]}
                  columns={columns}
                  columnVisibilityModel={columnVisibilityModel}
                  defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
                  onSave={setColumnVisibilityModel}
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
        open={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        title={t('dialogs.deleteRestaurant.title')}
        content={t('dialogs.deleteRestaurant.description', { name: rowToDelete?.name ?? '' })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteMutation.isPending}
            onClick={async () => {
              if (!rowToDelete) return;
              await deleteMutation.mutateAsync(rowToDelete.id);
              setRowToDelete(null);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />

      <ConfirmDialog
        open={Boolean(rowToDeactivate)}
        onClose={() => setRowToDeactivate(null)}
        title={tPlatform('dialogs.deactivateRestaurant.title')}
        content={tPlatform('dialogs.deactivateRestaurant.description', { name: rowToDeactivate?.name ?? '' })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deactivateMutation.isPending}
            onClick={async () => {
              if (!rowToDeactivate) return;
              await deactivateMutation.mutateAsync(rowToDeactivate.id);
              setRowToDeactivate(null);
            }}>
            {tPlatform('actions.deactivate')}
          </Button>
        }
      />

      <RestaurantActivationDialog
        open={Boolean(rowToActivate)}
        tariffs={tariffsQuery.data?.data ?? []}
        isSubmitting={activateMutation.isPending}
        onClose={() => setRowToActivate(null)}
        onSubmit={async (payload) => {
          if (!rowToActivate) {
            return;
          }

          const result = await activateMutation.mutateAsync({ id: rowToActivate.id, payload });
          setRowToActivate(null);
          setCredentials({ username: result.username, password: result.password });
          setCredentialsDialogTitle(tPlatform('dialogs.restaurantCredentials.title'));
          setCredentialsDialogDescription(tPlatform('dialogs.restaurantCredentials.description'));
        }}
      />

      <CredentialsRevealDialog
        open={Boolean(credentials)}
        title={credentialsDialogTitle}
        description={credentialsDialogDescription}
        credentials={credentials}
        onClose={() => {
          setCredentials(null);
          setCredentialsDialogTitle('');
          setCredentialsDialogDescription('');
        }}
      />
    </ListPageContent>
  );
};

export default RestaurantsListPage;
