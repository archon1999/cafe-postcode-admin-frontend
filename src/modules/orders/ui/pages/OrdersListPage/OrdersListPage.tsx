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
import { useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminOrder } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatMoney } from 'shared/utils/format-money';

import { useGetOrdersQuery } from '../../../application';
import { OrdersGridToolbar } from '../../components/OrdersGridToolbar';
import { formatDateTime, getOrderChannelTranslationKey, getOrderStatusColor } from '../../lib/presenters';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const OrdersListPage = () => {
  const { t, currentLang } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const router = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const ordersQuery = useGetOrdersQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    statusIn: statuses.length ? statuses.join(',') : undefined,
    channelIn: channels.length ? channels.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const hasActiveFilters = Boolean(search || statuses.length || channels.length);

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'open', label: t('statuses.open') },
      { value: 'submitted', label: t('statuses.submitted') },
      { value: 'ready', label: t('statuses.ready') },
      { value: 'closed', label: t('statuses.closed') },
      { value: 'cancelled', label: t('statuses.cancelled') },
    ],
    [t],
  );

  const channelOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'hall', label: t('channels.hall') },
      { value: 'takeaway', label: t('channels.takeaway') },
      { value: 'online', label: t('channels.online') },
      { value: 'delivery', label: t('channels.delivery') },
    ],
    [t],
  );

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
        valueGetter: (_v, row) => formatHallDisplayName(row.hallName, row.hallLevel, tCommon),
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
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.orders.title')} sx={{ mb: { xs: 3, md: 5 } }} />
      <ListPageBody>
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
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchOrdersPlaceholder')}
                  clearSearchLabel={t('filters.clearSearch')}
                  search={search}
                  onSearchChange={(value) => {
                    setSearch(value.trim());
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  onClearSearch={() => {
                    setSearch('');
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
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
                      testId: 'orders-status-filter',
                      emptyLabel: t('filters.all'),
                    },
                    {
                      label: t('filters.channel'),
                      value: channels,
                      options: channelOptions,
                      onChange: setChannels,
                      onApply: (values) => {
                        setChannels(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'orders-channel-filter',
                      emptyLabel: t('filters.all'),
                    },
                  ]}
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
      </ListPageBody>
    </ListPageContent>
  );
};

export default OrdersListPage;
