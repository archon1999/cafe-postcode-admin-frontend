import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import type { GridColDef, GridColumnVisibilityModel, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminTableSession } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import { useGetFloorHallsQuery, useGetTableSessionsListQuery } from '../../../application';

import {
  DEFAULT_TABLE_SESSIONS_GRID_FILTERS,
  type TableSessionsGridFilters,
  TableSessionsGridToolbar,
} from './TableSessionsGridToolbar';

export const TableSessionsGrid = () => {
  const { t, currentLang } = useTranslate('floor');
  const hallsQuery = useGetFloorHallsQuery();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<TableSessionsGridFilters>(DEFAULT_TABLE_SESSIONS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const query = useGetTableSessionsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    hallIdIn: filters.halls.length ? filters.halls.join(',') : undefined,
    statusIn: filters.statuses.length ? filters.statuses.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const hasActiveFilters = Boolean(filters.search || filters.halls.length || filters.statuses.length);
  const handleFiltersChange = useCallback((next: TableSessionsGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<AdminTableSession>[]>(
    () => [
      {
        field: 'tableName',
        headerName: t('fields.table'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (_v, row) => row.tableName || '-',
      },
      {
        field: 'hallName',
        headerName: t('fields.hall'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (_v, row) => formatHallDisplayName(row.hallName),
      },
      {
        field: 'openedByName',
        headerName: t('fields.openedBy'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_v, row) => row.openedByName || '-',
      },
      {
        field: 'assignedWaiterName',
        headerName: t('fields.assignedWaiter'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_v, row) => row.assignedWaiterName || '-',
      },
      { field: 'guestCount', headerName: t('fields.guestCount'), minWidth: 120, flex: 0.4 },
      {
        field: 'status',
        headerName: t('fields.status'),
        minWidth: 150,
        flex: 0.6,
        renderCell: ({ row }) => (
          <Chip size="small" label={t(`tableSessionStatuses.${row.status}`)} variant="soft" color="info" />
        ),
      },
    ],
    [t],
  );

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <DataGrid
        checkboxSelection
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
                title: t('empty.tableSessions.noData.title'),
                description: t('empty.tableSessions.noData.description'),
              }}
              noResults={{
                title: t('empty.tableSessions.noResults.title'),
                description: t('empty.tableSessions.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{
                title: t('empty.tableSessions.noData.title'),
                description: t('empty.tableSessions.noData.description'),
              }}
              noResults={{
                title: t('empty.tableSessions.noResults.title'),
                description: t('empty.tableSessions.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <TableSessionsGridToolbar
              halls={hallsQuery.data ?? []}
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
};
