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

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminReceipt } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatMoney } from 'shared/utils/format-money';

import { useGetReceiptsQuery } from '../../../application';
import { OrdersGridToolbar } from '../../components/OrdersGridToolbar';
import {
  formatDateTime,
  getPaymentMethodTranslationKey,
  getReceiptKindTranslationKey,
  getReceiptStatusColor,
} from '../../lib/presenters';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

export const ReceiptsGrid = () => {
  const { t, currentLang } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const router = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [kinds, setKinds] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const query = useGetReceiptsQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    statusIn: statuses.length ? statuses.join(',') : undefined,
    kindIn: kinds.length ? kinds.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const hasActiveFilters = Boolean(search || statuses.length || kinds.length);

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'created', label: t('receiptStatuses.created') },
      { value: 'sent', label: t('receiptStatuses.sent') },
      { value: 'failed', label: t('receiptStatuses.failed') },
    ],
    [t],
  );

  const kindOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'prebill', label: t('receiptKinds.prebill') },
      { value: 'fiscal', label: t('receiptKinds.fiscal') },
      { value: 'refund', label: t('receiptKinds.refund') },
    ],
    [t],
  );

  const columns = useMemo<GridColDef<AdminReceipt>[]>(
    () => [
      withDetailLink(
        {
          field: 'orderNumber',
          headerName: t('fields.orderNumber'),
          minWidth: 110,
          flex: 0.4,
          valueGetter: (_v, row) => `#${row.orderNumber}`,
        },
        (row) => RouterPathHelper.receiptView(row.id),
      ),
      {
        field: 'kind',
        headerName: t('fields.kind'),
        minWidth: 140,
        flex: 0.5,
        valueGetter: (_v, row) => t(getReceiptKindTranslationKey(row.kind)),
      },
      {
        field: 'status',
        headerName: t('fields.status'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={t(`receiptStatuses.${row.status}`)}
            color={getReceiptStatusColor(row.status)}
            variant="soft"
          />
        ),
      },
      {
        field: 'provider',
        headerName: t('fields.provider'),
        minWidth: 160,
        flex: 0.7,
        valueGetter: (_v, row) => row.provider || '-',
      },
      {
        field: 'paymentMethod',
        headerName: t('fields.paymentMethod'),
        minWidth: 150,
        flex: 0.6,
        valueGetter: (_v, row) => (row.paymentMethod ? t(getPaymentMethodTranslationKey(row.paymentMethod)) : '-'),
      },
      {
        field: 'paymentAmount',
        headerName: t('fields.paymentAmount'),
        minWidth: 160,
        flex: 0.5,
        valueGetter: (_v, row) => formatMoney(row.paymentAmount),
      },
      {
        field: 'reprintCount',
        headerName: t('fields.reprintCount'),
        minWidth: 150,
        flex: 0.45,
        valueGetter: (_v, row) => row.reprintCount ?? 0,
      },
      {
        field: 'lastReprintedAt',
        headerName: t('fields.lastReprintedAt'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (_v, row) => formatDateTime(row.lastReprintedAt),
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
            href={RouterPathHelper.receiptView(params.row.id)}
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
        onRowClick={(params) => router.push(RouterPathHelper.receiptView(params.row.id))}
        slots={{
          noRowsOverlay: () => (
            <DataGridEmptyState
              hasActiveFilters={hasActiveFilters}
              noData={{
                title: t('empty.receipts.noData.title'),
                description: t('empty.receipts.noData.description'),
              }}
              noResults={{
                title: t('empty.receipts.noResults.title'),
                description: t('empty.receipts.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{
                title: t('empty.receipts.noData.title'),
                description: t('empty.receipts.noData.description'),
              }}
              noResults={{
                title: t('empty.receipts.noResults.title'),
                description: t('empty.receipts.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <OrdersGridToolbar
              searchLabel={t('filters.search')}
              searchPlaceholder={t('filters.searchReceiptsPlaceholder')}
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
                  id: 'statuses',
                  label: t('filters.status'),
                  value: statuses,
                  options: statusOptions,
                  onApply: (values) => {
                    setStatuses(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  },
                  testId: 'receipts-status-filter',
                  emptyLabel: t('filters.all'),
                },
                {
                  id: 'kinds',
                  label: t('filters.kind'),
                  value: kinds,
                  options: kindOptions,
                  onApply: (values) => {
                    setKinds(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  },
                  testId: 'receipts-kind-filter',
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
  );
};
