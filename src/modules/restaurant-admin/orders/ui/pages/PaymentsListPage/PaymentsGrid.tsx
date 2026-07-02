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
import type { AdminPayment } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { useRouter } from 'shared/hooks/router';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { formatOrderNumberCellValue, OrderNumberCell } from 'shared/ui/OrderNumberCell';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatMoney } from 'shared/utils/format-money';

import { useGetPaymentsQuery } from '../../../application';
import { formatDateTime, getPaymentMethodTranslationKey, getPaymentStatusColor } from '../../lib/presenters';

import { DEFAULT_PAYMENTS_GRID_FILTERS, type PaymentsGridFilters, PaymentsGridToolbar } from './PaymentsGridToolbar';

export const PaymentsGrid = () => {
  const { t, currentLang } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const router = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<PaymentsGridFilters>(DEFAULT_PAYMENTS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const query = useGetPaymentsQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    statusIn: filters.statuses.length ? filters.statuses.join(',') : undefined,
    methodIn: filters.methods.length ? filters.methods.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const hasActiveFilters = Boolean(filters.search || filters.statuses.length || filters.methods.length);
  const handleFiltersChange = useCallback((next: PaymentsGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<AdminPayment>[]>(
    () => [
      withDetailLink(
        {
          field: 'orderNumber',
          headerName: t('fields.orderNumber'),
          minWidth: 110,
          flex: 0.4,
          valueGetter: (_v, row) => formatOrderNumberCellValue(row.orderNumber, row.orderDisplayName),
          renderCell: ({ row }) => <OrderNumberCell orderNumber={row.orderNumber} displayName={row.orderDisplayName} />,
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
            <PaymentsGridToolbar
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
