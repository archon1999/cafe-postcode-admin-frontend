import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminTariff } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatMoney } from 'shared/utils/format-money';

import { useGetTariffsListQuery } from '../../../application';

import { DEFAULT_TARIFFS_GRID_FILTERS, type TariffsGridFilters, TariffsGridToolbar } from './TariffsGridToolbar';

export function TariffsGrid() {
  const { t, currentLang } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<TariffsGridFilters>(DEFAULT_TARIFFS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const query = useGetTariffsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    isActive: filters.statuses.length === 1 ? filters.statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const handleFiltersChange = useCallback((next: TariffsGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<AdminTariff>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 200, flex: 1 },
      { field: 'classification', headerName: t('fields.classification'), minWidth: 160, flex: 0.7 },
      {
        field: 'monthlyPrice',
        headerName: t('fields.monthlyPrice'),
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ row }) => formatMoney(row.monthlyPrice),
      },
      {
        field: 'yearlyPrice',
        headerName: t('fields.yearlyPrice'),
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ row }) => formatMoney(row.yearlyPrice),
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
        field: 'permissionsCount',
        headerName: t('fields.permissions'),
        minWidth: 160,
        flex: 0.5,
        sortable: false,
        valueGetter: (_value, row) => row.permissions.length,
      },
      {
        field: 'allowedRolesCount',
        headerName: t('fields.allowedRoles'),
        minWidth: 160,
        flex: 0.5,
        sortable: false,
        valueGetter: (_value, row) => row.allowedRoles.length,
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
            href={RouterPathHelper.platformTariffEdit(params.row.id)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <DataGrid
        checkboxSelection
        rows={query.data?.data ?? []}
        columns={columns}
        rowCount={query.data?.total ?? 0}
        loading={query.isLoading}
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
              hasActiveFilters={Boolean(filters.search || filters.statuses.length)}
              noData={{
                title: t('empty.tariffs.noData.title'),
                description: t('empty.tariffs.noData.description'),
              }}
              noResults={{
                title: t('empty.tariffs.noResults.title'),
                description: t('empty.tariffs.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{
                title: t('empty.tariffs.noData.title'),
                description: t('empty.tariffs.noData.description'),
              }}
              noResults={{
                title: t('empty.tariffs.noResults.title'),
                description: t('empty.tariffs.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <TariffsGridToolbar
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
  );
}
