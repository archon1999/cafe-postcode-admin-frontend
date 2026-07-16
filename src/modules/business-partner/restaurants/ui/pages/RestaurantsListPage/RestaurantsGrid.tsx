import Card from '@mui/material/Card';
import type { GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminRestaurant } from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useGetRestaurantsListQuery } from '../../../application';
import {
  RestaurantActivateDialog,
  RestaurantCredentialsDialog,
  type RestaurantCredentialsDialogState,
  RestaurantDeactivateDialog,
  RestaurantDeleteDialog,
  RestaurantExtendDialog,
} from '../../components';

import {
  DEFAULT_RESTAURANTS_GRID_FILTERS,
  type RestaurantsGridFilters,
  RestaurantsGridToolbar,
} from './RestaurantsGridToolbar';
import { useRestaurantsGridColumns } from './useRestaurantsGridColumns';

export function RestaurantsGrid() {
  const { t, currentLang } = useTranslate('organizations');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<RestaurantsGridFilters>(DEFAULT_RESTAURANTS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToDelete, setRowToDelete] = useState<AdminRestaurant | null>(null);
  const [rowToDeactivate, setRowToDeactivate] = useState<AdminRestaurant | null>(null);
  const [rowToActivate, setRowToActivate] = useState<AdminRestaurant | null>(null);
  const [rowToExtend, setRowToExtend] = useState<AdminRestaurant | null>(null);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState<RestaurantCredentialsDialogState>(null);
  const columnActions = useMemo(
    () => ({
      onActivate: setRowToActivate,
      onCredentials: setCredentialsDialogOpen,
      onDeactivate: setRowToDeactivate,
      onDelete: setRowToDelete,
      onExtend: setRowToExtend,
    }),
    [],
  );
  const { columns, isMutating } = useRestaurantsGridColumns(columnActions);
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

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <DataGrid
          checkboxSelection
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

      <RestaurantExtendDialog
        open={rowToExtend}
        onClose={() => setRowToExtend(null)}
        onSuccess={() => setRowToExtend(null)}
      />

      <RestaurantCredentialsDialog open={credentialsDialogOpen} onClose={() => setCredentialsDialogOpen(null)} />
    </>
  );
}
