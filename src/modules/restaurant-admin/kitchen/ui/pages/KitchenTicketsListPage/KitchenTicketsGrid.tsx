import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import type { GridColDef, GridRenderCellParams, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { useBranchScopeColumns } from 'app/layouts/components/branch-scope-columns';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminKitchenTicket, KitchenTicketRouteMode, KitchenTicketStatus } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { useRouter } from 'shared/hooks/router';
import { useDataGridPreferences } from 'shared/hooks/use-data-grid-preferences';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { formatOrderNumberCellValue, OrderNumberCell } from 'shared/ui/OrderNumberCell';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatDateTime } from 'shared/utils/format-time';

import { useGetKitchenPrepStationsQuery, useGetKitchenTicketsQuery } from '../../../application';

import {
  DEFAULT_KITCHEN_TICKETS_GRID_FILTERS,
  type KitchenTicketsGridFilters,
  KitchenTicketsGridToolbar,
} from './KitchenTicketsGridToolbar';

function getStatusColor(status: KitchenTicketStatus) {
  switch (status) {
    case 'done':
      return 'success';
    case 'cooking':
      return 'info';
    default:
      return 'warning';
  }
}

function getRoutedViaColor(routedVia: KitchenTicketRouteMode) {
  switch (routedVia) {
    case 'both':
      return 'success';
    case 'printer':
      return 'secondary';
    default:
      return 'info';
  }
}

export function KitchenTicketsGrid() {
  const { t, currentLang } = useTranslate('kitchen');
  const { t: tCommon } = useTranslate('common');
  const router = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const { filters, setFilters, paginationModel, setPaginationModel, columnVisibilityModel, setColumnVisibilityModel } =
    useDataGridPreferences<KitchenTicketsGridFilters>('kitchen-tickets', {
      filters: DEFAULT_KITCHEN_TICKETS_GRID_FILTERS,
      paginationModel: DEFAULT_PAGINATION_MODEL,
      columnVisibilityModel: DEFAULT_COLUMN_VISIBILITY_MODEL,
    });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const ticketsQuery = useGetKitchenTicketsQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    statusIn: filters.statuses.length ? filters.statuses.join(',') : undefined,
    prepStationIdIn: filters.prepStationIds.length ? filters.prepStationIds.join(',') : undefined,
    routedViaIn: filters.routedViaValues.length ? filters.routedViaValues.join(',') : undefined,
    isPrinted: filters.printedValues.length === 1 ? filters.printedValues[0] === 'printed' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const prepStationsQuery = useGetKitchenPrepStationsQuery();
  const hasActiveFilters = Boolean(
    filters.search ||
      filters.statuses.length ||
      filters.prepStationIds.length ||
      filters.routedViaValues.length ||
      filters.printedValues.length,
  );
  const handleFiltersChange = useCallback(
    (next: KitchenTicketsGridFilters) => {
      setFilters(next);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    },
    [setFilters, setPaginationModel],
  );

  const baseColumns = useMemo<GridColDef<AdminKitchenTicket>[]>(
    () => [
      withDetailLink(
        {
          field: 'orderNumber',
          headerName: t('fields.orderNumber'),
          minWidth: 130,
          flex: 0.5,
          valueGetter: (_value, row) => formatOrderNumberCellValue(row.orderNumber, row.orderDisplayName),
          renderCell: ({ row }) => <OrderNumberCell orderNumber={row.orderNumber} displayName={row.orderDisplayName} />,
        },
        (row) => RouterPathHelper.kitchenTicketView(row.id),
      ),
      {
        field: 'prepStationName',
        headerName: t('fields.prepStation'),
        minWidth: 180,
        flex: 0.8,
      },
      {
        field: 'status',
        headerName: t('fields.status'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip size="small" label={t(`status.${row.status}`)} color={getStatusColor(row.status)} variant="soft" />
        ),
      },
      {
        field: 'routedVia',
        headerName: t('fields.routedVia'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={t(`routedVia.${row.routedVia}`)}
            color={getRoutedViaColor(row.routedVia)}
            variant="soft"
          />
        ),
      },
      {
        field: 'isPrinted',
        headerName: t('fields.printed'),
        minWidth: 120,
        flex: 0.4,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isPrinted ? t('printed.printed') : t('printed.notPrinted')}
            color={row.isPrinted ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        field: 'hallName',
        headerName: t('fields.hall'),
        minWidth: 160,
        flex: 0.7,
        valueGetter: (_value, row) => formatHallDisplayName(row.hallName, undefined, tCommon),
      },
      {
        field: 'tableName',
        headerName: t('fields.table'),
        minWidth: 140,
        flex: 0.6,
        valueGetter: (_value, row) => row.tableName || '-',
      },
      {
        field: 'waiterName',
        headerName: t('fields.waiter'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_value, row) => row.waiterName || '-',
      },
      {
        field: 'itemsCount',
        headerName: t('fields.itemsCount'),
        minWidth: 120,
        flex: 0.4,
        valueGetter: (_value, row) => row.items.length,
      },
      {
        field: 'createdAt',
        headerName: t('fields.createdAt'),
        minWidth: 170,
        flex: 0.7,
        renderCell: ({ row }: GridRenderCellParams<AdminKitchenTicket>) => formatDateTime(row.createdAt),
      },
      {
        field: 'completedAt',
        headerName: t('fields.completedAt'),
        minWidth: 170,
        flex: 0.7,
        renderCell: ({ row }: GridRenderCellParams<AdminKitchenTicket>) => formatDateTime(row.completedAt),
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        getActions: (params) => [
          <CustomGridActionsCellItem
            actionKind="view"
            key="view"
            label={tCommon('labels.details')}
            icon={<Iconify icon="solar:eye-bold" />}
            href={RouterPathHelper.kitchenTicketView(params.row.id)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  const emptyStateMessages = useMemo(
    () => ({
      noData: {
        title: t('empty.kitchenTickets.noData.title'),
        description: t('empty.kitchenTickets.noData.description'),
      },
      noResults: {
        title: t('empty.kitchenTickets.noResults.title'),
        description: t('empty.kitchenTickets.noResults.description'),
      },
    }),
    [t],
  );

  const columns = useBranchScopeColumns(baseColumns);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <DataGrid
        rows={ticketsQuery.data?.data ?? []}
        columns={columns}
        rowCount={ticketsQuery.data?.total ?? 0}
        loading={ticketsQuery.isLoading || prepStationsQuery.isLoading}
        onRefresh={() => void ticketsQuery.refetch()}
        refreshing={ticketsQuery.isFetching}
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
        onRowClick={(params) => router.push(RouterPathHelper.kitchenTicketView(params.row.id))}
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
            <KitchenTicketsGridToolbar
              prepStations={prepStationsQuery.data ?? []}
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
          [`& .${gridClasses.cell}`]: {
            display: 'flex',
            alignItems: 'center',
          },
          [`& .${gridClasses.actionsCell}`]: {
            gap: 0.25,
          },
          '& .MuiDataGrid-toolbarContainer': {
            px: 2.5,
            py: 2,
          },
          '& .MuiDataGrid-columnHeaders': {
            borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        }}
      />
    </Card>
  );
}
