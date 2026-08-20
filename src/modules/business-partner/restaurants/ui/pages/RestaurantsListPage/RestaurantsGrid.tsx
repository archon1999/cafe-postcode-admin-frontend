import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import type { GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import type { AdminRestaurantBranchType, AdminRestaurantListItem } from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL } from 'shared/constants';
import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useGetRestaurantsListQuery } from '../../../application';
import {
  RestaurantActivateDialog,
  RestaurantBranchCreateDialog,
  RestaurantCredentialsDialog,
  type RestaurantCredentialsDialogState,
  RestaurantDeactivateDialog,
  RestaurantTariffChangeDialog,
} from '../../components';
import { canUseRestaurantPermission } from '../../shared/restaurant-helpers';

import {
  DEFAULT_RESTAURANTS_GRID_FILTERS,
  type RestaurantsGridFilters,
  RestaurantsGridToolbar,
} from './RestaurantsGridToolbar';
import { useRestaurantsGridColumns } from './useRestaurantsGridColumns';

type RestaurantsGridProps = {
  summaryError: boolean;
  onRetrySummary: () => void;
};

export function RestaurantsGrid({ summaryError, onRetrySummary }: RestaurantsGridProps) {
  const { t, currentLang } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<RestaurantsGridFilters>(DEFAULT_RESTAURANTS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [branchParent, setBranchParent] = useState<AdminRestaurantListItem | null>(null);
  const [rowToDeactivate, setRowToDeactivate] = useState<AdminRestaurantListItem | null>(null);
  const [rowToActivate, setRowToActivate] = useState<AdminRestaurantListItem | null>(null);
  const [rowToChangeTariff, setRowToChangeTariff] = useState<AdminRestaurantListItem | null>(null);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState<RestaurantCredentialsDialogState>(null);
  const columnActions = useMemo(
    () => ({
      onCreateBranch: setBranchParent,
      onActivate: setRowToActivate,
      onCredentials: setCredentialsDialogOpen,
      onDeactivate: setRowToDeactivate,
      onChangeTariff: setRowToChangeTariff,
    }),
    [],
  );
  const capabilities = useMemo(
    () => ({
      canCreate: canUseRestaurantPermission(profile, 'create'),
      canUpdate: canUseRestaurantPermission(profile, 'update'),
      canActivate: canUseRestaurantPermission(profile, 'activate'),
      canDeactivate: canUseRestaurantPermission(profile, 'deactivate'),
      canResetPassword: canUseRestaurantPermission(profile, 'reset_password'),
      canChangeTariff: canUseRestaurantPermission(profile, 'change_tariff'),
    }),
    [profile],
  );
  const { columns, isMutating } = useRestaurantsGridColumns(columnActions, capabilities);
  const query = useGetRestaurantsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    isActive: filters.statuses.length === 1 ? filters.statuses[0] === 'active' : undefined,
    branchType: filters.branchTypes.length === 1 ? (filters.branchTypes[0] as AdminRestaurantBranchType) : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const hasActiveFilters = Boolean(filters.search || filters.statuses.length || filters.branchTypes.length);
  const handleFiltersChange = useCallback((next: RestaurantsGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: 2 }}>
        {query.isError || summaryError ? (
          <Alert
            severity="error"
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  void query.refetch();
                  onRetrySummary();
                }}>
                {t('portfolio.retry')}
              </Button>
            }>
            {t('portfolio.loadFailed')}
          </Alert>
        ) : null}

        <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 420, overflow: 'hidden' }}>
          <DataGrid
            rows={query.data?.data ?? []}
            columns={columns}
            rowCount={query.data?.total ?? 0}
            loading={query.isLoading || isMutating}
            onRefresh={() => void query.refetch()}
            refreshing={query.isFetching}
            localeText={localeText}
            paginationMode="server"
            sortingMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel}
            onSortModelChange={setSortModel}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={setColumnVisibilityModel}
            disableColumnMenu
            rowHeight={72}
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
      </Box>

      <RestaurantBranchCreateDialog
        parentId={branchParent?.id ?? null}
        parentName={branchParent?.name}
        onClose={() => setBranchParent(null)}
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
            mode: 'activation',
          });
        }}
      />

      <RestaurantTariffChangeDialog
        open={rowToChangeTariff}
        onClose={() => setRowToChangeTariff(null)}
        onSuccess={() => setRowToChangeTariff(null)}
      />

      <RestaurantCredentialsDialog open={credentialsDialogOpen} onClose={() => setCredentialsDialogOpen(null)} />
    </>
  );
}
