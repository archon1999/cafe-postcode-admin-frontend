import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { useBranchScopeColumns } from 'app/layouts/components/branch-scope-columns';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminOrder } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { useDataGridPreferences } from 'shared/hooks/use-data-grid-preferences';
import { DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import { formatOrderNumberCellValue, OrderNumberCell } from 'shared/ui/OrderNumberCell';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import { useGetOrdersQuery } from '../../../application';
import { getOrderChannelTranslationKey, getOrderStatusColor } from '../../lib/presenters';

import { DEFAULT_ORDERS_GRID_FILTERS, type OrdersGridFilters, OrdersGridToolbar } from './OrdersGridToolbar';

export const OrdersGrid = () => {
  const { t, currentLang } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const { filters, setFilters, paginationModel, setPaginationModel, columnVisibilityModel, setColumnVisibilityModel } =
    useDataGridPreferences<OrdersGridFilters>('restaurant-orders', {
      filters: DEFAULT_ORDERS_GRID_FILTERS,
      paginationModel: DEFAULT_PAGINATION_MODEL,
      columnVisibilityModel: DEFAULT_COLUMN_VISIBILITY_MODEL,
    });
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
  const handleFiltersChange = useCallback(
    (next: OrdersGridFilters) => {
      setFilters(next);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    },
    [setFilters, setPaginationModel],
  );

  const baseColumns = useMemo<GridColDef<AdminOrder>[]>(
    () => [
      withDetailLink(
        {
          field: 'orderNumber',
          headerName: t('fields.orderNumber'),
          minWidth: 105,
          flex: 0.35,
          valueGetter: (_v, row) => formatOrderNumberCellValue(row.orderNumber, row.displayName),
          renderCell: ({ row }) => <OrderNumberCell orderNumber={row.orderNumber} displayName={row.displayName} />,
        },
        (row) => RouterPathHelper.orderView(row.id),
      ),
      {
        field: 'status',
        headerName: t('fields.status'),
        minWidth: 120,
        flex: 0.45,
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
        renderCell: ({ row }) => (
          <Chip size="small" label={t(getOrderChannelTranslationKey(row.channel))} variant="soft" />
        ),
      },
      {
        field: 'createdAt',
        headerName: t('fields.createdAt'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_v, row) => formatDateTime(row.createdAt),
      },
      {
        field: 'itemsAndTotal',
        headerName: t('fields.total'),
        minWidth: 180,
        flex: 0.65,
        valueGetter: (_v, row) => `${row.itemsCount} • ${formatMoney(row.total)}`,
        renderCell: ({ row }) => (
          <Stack spacing={0.25}>
            <Typography variant="body2">{formatMoney(row.total)}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t('fields.itemsCount')}: {row.itemsCount}
            </Typography>
          </Stack>
        ),
      },
      {
        field: 'cashierAndOpenedBy',
        headerName: t('fields.cashierAndOpenedBy'),
        minWidth: 220,
        flex: 0.9,
        sortable: false,
        valueGetter: (_v, row) => {
          const names = [row.cashierName, row.openedByName].filter(
            (name, index, values): name is string => Boolean(name) && values.indexOf(name) === index,
          );
          return names.length ? names.join(' / ') : '-';
        },
      },
      {
        field: 'hallAndTable',
        headerName: `${t('fields.hall')} / ${t('fields.table')}`,
        minWidth: 220,
        flex: 0.8,
        sortable: false,
        valueGetter: (_v, row) => {
          const hallName = formatHallDisplayName(row.hallName, undefined, tCommon);
          if (hallName === '-') return row.tableName || '-';
          return row.tableName ? `${hallName} / ${row.tableName}` : hallName;
        },
      },
      {
        field: 'closedAt',
        headerName: t('fields.closedAt'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_v, row) => formatDateTime(row.closedAt),
      },
    ],
    [t, tCommon],
  );
  const columns = useBranchScopeColumns(baseColumns);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <DataGrid
        rows={ordersQuery.data?.data ?? []}
        columns={columns}
        rowCount={ordersQuery.data?.total ?? 0}
        loading={ordersQuery.isLoading}
        onRefresh={() => void ordersQuery.refetch()}
        refreshing={ordersQuery.isFetching}
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
