import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import type { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminZoneOrCabin } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { useDataGridPreferences } from 'shared/hooks/use-data-grid-preferences';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteZoneMutation, useGetZonesListQuery } from '../../../application';

import { DEFAULT_ZONES_GRID_FILTERS, type ZonesGridFilters, ZonesGridToolbar } from './ZonesGridToolbar';

const DEFAULT_SORT_MODEL: GridSortModel = [{ field: 'sortOrder', sort: 'asc' }];

export const ZonesGrid = () => {
  const { t, currentLang } = useTranslate('floor');
  const { t: tCommon } = useTranslate('common');
  const deleteMutation = useDeleteZoneMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const { filters, setFilters, paginationModel, setPaginationModel, columnVisibilityModel, setColumnVisibilityModel } =
    useDataGridPreferences<ZonesGridFilters>('floor-zones', {
      filters: DEFAULT_ZONES_GRID_FILTERS,
      paginationModel: DEFAULT_PAGINATION_MODEL,
      columnVisibilityModel: DEFAULT_COLUMN_VISIBILITY_MODEL,
    });
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [zoneToDelete, setZoneToDelete] = useState<AdminZoneOrCabin | null>(null);
  const query = useGetZonesListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    isActive: filters.statuses.length === 1 ? filters.statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const hasActiveFilters = Boolean(filters.search || filters.statuses.length);
  const handleFiltersChange = useCallback(
    (next: ZonesGridFilters) => {
      setFilters(next);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    },
    [setFilters, setPaginationModel],
  );

  const columns = useMemo<GridColDef<AdminZoneOrCabin>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 1 },
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
            href={RouterPathHelper.floorZoneEdit(params.row.id)}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete')}
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setZoneToDelete(params.row)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <DataGrid
          rows={query.data?.data ?? []}
          columns={columns}
          rowCount={query.data?.total ?? 0}
          loading={query.isLoading}
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
          slots={{
            noRowsOverlay: () => (
              <DataGridEmptyState
                hasActiveFilters={hasActiveFilters}
                noData={{ title: t('empty.zones.noData.title'), description: t('empty.zones.noData.description') }}
                noResults={{
                  title: t('empty.zones.noResults.title'),
                  description: t('empty.zones.noResults.description'),
                }}
              />
            ),
            noResultsOverlay: () => (
              <DataGridEmptyState
                forceFiltered
                noData={{ title: t('empty.zones.noData.title'), description: t('empty.zones.noData.description') }}
                noResults={{
                  title: t('empty.zones.noResults.title'),
                  description: t('empty.zones.noResults.description'),
                }}
              />
            ),
            toolbar: () => (
              <ZonesGridToolbar
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
        open={Boolean(zoneToDelete)}
        onClose={() => setZoneToDelete(null)}
        title={t('dialogs.deleteZone.title')}
        content={t('dialogs.deleteZone.description', { name: zoneToDelete?.name ?? '' })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteMutation.isPending}
            onClick={async () => {
              if (!zoneToDelete) return;
              await deleteMutation.mutateAsync(zoneToDelete.id);
              setZoneToDelete(null);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />
    </>
  );
};
