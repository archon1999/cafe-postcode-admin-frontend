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
import type { AdminPayment } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatMoney } from 'shared/utils/format-money';

import { useGetPaymentsQuery } from '../../../application';
import { OrdersGridToolbar } from '../../components/OrdersGridToolbar';
import { formatDateTime, getPaymentMethodTranslationKey, getPaymentStatusColor } from '../../lib/presenters';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const PaymentsListPage = () => {
  const { t, currentLang } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const router = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [methods, setMethods] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const query = useGetPaymentsQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    statusIn: statuses.length ? statuses.join(',') : undefined,
    methodIn: methods.length ? methods.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const hasActiveFilters = Boolean(search || statuses.length || methods.length);

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'pending', label: t('paymentStatuses.pending') },
      { value: 'succeeded', label: t('paymentStatuses.succeeded') },
      { value: 'failed', label: t('paymentStatuses.failed') },
    ],
    [t],
  );

  const methodOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'cash', label: t('paymentMethods.cash') },
      { value: 'card', label: t('paymentMethods.card') },
      { value: 'qr', label: t('paymentMethods.qr') },
      { value: 'mixed', label: t('paymentMethods.mixed') },
    ],
    [t],
  );

  const columns = useMemo<GridColDef<AdminPayment>[]>(
    () => [
      withDetailLink(
        {
        field: 'orderNumber',
        headerName: t('fields.orderNumber'),
        minWidth: 110,
        flex: 0.4,
        valueGetter: (_v, row) => `#${row.orderNumber}`,
        },
        (row) => RouterPathHelper.paymentView(row.id),
      ),
      {
        field: 'method',
        headerName: t('fields.method'),
        minWidth: 140,
        flex: 0.5,
        valueGetter: (_v, row) => t(getPaymentMethodTranslationKey(row.method)),
      },
      {
        field: 'status',
        headerName: t('fields.status'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={t(`paymentStatuses.${row.status}`)}
            color={getPaymentStatusColor(row.status)}
            variant="soft"
          />
        ),
      },
      {
        field: 'amount',
        headerName: t('fields.amount'),
        minWidth: 160,
        flex: 0.5,
        valueGetter: (_v, row) => formatMoney(row.amount),
      },
      {
        field: 'cashDeskName',
        headerName: t('fields.cashDesk'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_v, row) => row.cashDeskName || '-',
      },
      {
        field: 'cashShiftId',
        headerName: t('fields.cashShift'),
        minWidth: 160,
        flex: 0.7,
        valueGetter: (_v, row) => (row.cashShiftId ? row.cashShiftId.slice(0, 8) : '-'),
      },
      {
        field: 'receivedByName',
        headerName: t('fields.receivedBy'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_v, row) => row.receivedByName || '-',
      },
      {
        field: 'externalRef',
        headerName: t('fields.externalRef'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_v, row) => row.externalRef || '-',
      },
      {
        field: 'refundsTotal',
        headerName: t('fields.refundsTotal'),
        minWidth: 160,
        flex: 0.6,
        valueGetter: (_v, row) => formatMoney(row.refundsTotal ?? 0),
      },
      {
        field: 'isRefunded',
        headerName: t('fields.isRefunded'),
        minWidth: 150,
        flex: 0.55,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isRefunded ? t('labels.refunded') : t('labels.notRefunded')}
            color={row.isRefunded ? 'warning' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        field: 'paidAt',
        headerName: t('fields.paidAt'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_v, row) => formatDateTime(row.paidAt),
      },
      {
        field: 'createdAt',
        headerName: t('fields.createdAt'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_v, row) => formatDateTime(row.createdAt),
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
            href={RouterPathHelper.paymentView(params.row.id)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.payments.title')} sx={{ mb: { xs: 3, md: 5 } }} />
      <ListPageBody>
        <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            checkboxSelection
            rows={query.data?.data ?? []}
            columns={columns}
            rowCount={query.data?.total ?? 0}
            loading={query.isLoading}
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
            onRowClick={(params) => router.push(RouterPathHelper.paymentView(params.row.id))}
            slots={{
              noRowsOverlay: () => (
                <DataGridEmptyState
                  hasActiveFilters={hasActiveFilters}
                  noData={{
                    title: t('empty.payments.noData.title'),
                    description: t('empty.payments.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.payments.noResults.title'),
                    description: t('empty.payments.noResults.description'),
                  }}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={{
                    title: t('empty.payments.noData.title'),
                    description: t('empty.payments.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.payments.noResults.title'),
                    description: t('empty.payments.noResults.description'),
                  }}
                />
              ),
              toolbar: () => (
                <OrdersGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchPaymentsPlaceholder')}
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
                      testId: 'payments-status-filter',
                      emptyLabel: t('filters.all'),
                    },
                    {
                      label: t('filters.method'),
                      value: methods,
                      options: methodOptions,
                      onChange: setMethods,
                      onApply: (values) => {
                        setMethods(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'payments-method-filter',
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

export default PaymentsListPage;
