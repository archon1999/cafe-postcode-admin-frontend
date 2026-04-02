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
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminOrder } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatMoney } from 'shared/utils/format-money';

import { useGetOrdersQuery } from '../../../application';
import { formatDateTime, getOrderChannelTranslationKey, getOrderStatusColor } from '../../lib/presenters';

import { DEFAULT_ORDERS_GRID_FILTERS, type OrdersGridFilters, OrdersGridToolbar } from './OrdersGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

export const OrdersGrid = () => {
  const { t, currentLang } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const router = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<OrdersGridFilters>(DEFAULT_ORDERS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const ordersQuery = useGetOrdersQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    statusIn: filters.statuses.length ? filters.statuses.join(',') : undefined,
    channelIn: filters.channels.length ? filters.channels.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const hasActiveFilters = Boolean(filters.search || filters.statuses.length || filters.channels.length);
  const handleFiltersChange = useCallback((next: OrdersGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<AdminOrder>[]>(
    () => [
      withDetailLink(
        {
          field: 'orderNumber',
          headerName: t('fields.orderNumber'),
          minWidth: 120,
          flex: 0.4,
          valueGetter: (_v, row) => `#${row.orderNumber}`,
        },
        (row) => RouterPathHelper.orderView(row.id),
      ),
      {
        field: 'status',
        headerName: t('fields.status'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={t(`statuses.${row.status}`)}
            color={getOrderStatusColor(row.status)}
            variant="soft"
          />
        ),
      },
      {
        field: 'channel',
        headerName: t('fields.channel'),
        minWidth: 140,
        flex: 0.5,
        valueGetter: (_v, row) => t(getOrderChannelTranslationKey(row.channel)),
      },
      {
        field: 'hallName',
        headerName: t('fields.hall'),
        minWidth: 160,
        flex: 0.6,
        valueGetter: (_v, row) => formatHallDisplayName(row.hallName, undefined, tCommon),
      },
      {
        field: 'tableName',
        headerName: t('fields.table'),
        minWidth: 140,
        flex: 0.5,
        valueGetter: (_v, row) => row.tableName || '-',
      },
      {
        field: 'openedByName',
        headerName: t('fields.openedBy'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_v, row) => row.openedByName || '-',
      },
      {
        field: 'cashierName',
        headerName: t('fields.cashier'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_v, row) => row.cashierName || '-',
      },
      { field: 'itemsCount', headerName: t('fields.itemsCount'), minWidth: 120, flex: 0.4 },
      {
        field: 'total',
        headerName: t('fields.total'),
        minWidth: 160,
        flex: 0.5,
        valueGetter: (_v, row) => formatMoney(row.total),
      },
      {
        field: 'createdAt',
        headerName: t('fields.createdAt'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_v, row) => formatDateTime(row.createdAt),
      },
      {
        field: 'closedAt',
        headerName: t('fields.closedAt'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_v, row) => formatDateTime(row.closedAt),
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
            href={RouterPathHelper.orderView(params.row.id)}
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
        rows={ordersQuery.data?.data ?? []}
        columns={columns}
        rowCount={ordersQuery.data?.total ?? 0}
        loading={ordersQuery.isLoading}
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
        onRowClick={(params) => router.push(RouterPathHelper.orderView(params.row.id))}
        slots={{
          noRowsOverlay: () => (
            <DataGridEmptyState
              hasActiveFilters={hasActiveFilters}
              noData={{ title: t('empty.orders.noData.title'), description: t('empty.orders.noData.description') }}
              noResults={{
                title: t('empty.orders.noResults.title'),
                description: t('empty.orders.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{ title: t('empty.orders.noData.title'), description: t('empty.orders.noData.description') }}
              noResults={{
                title: t('empty.orders.noResults.title'),
                description: t('empty.orders.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <OrdersGridToolbar
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
