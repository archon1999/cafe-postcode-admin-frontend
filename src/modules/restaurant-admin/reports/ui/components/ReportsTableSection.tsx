import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowIdGetter,
  GridSortModel,
} from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { useGetCatalogCategoriesQuery } from 'modules/restaurant-admin/catalog/application';
import { useGetCashDesksQuery } from 'modules/restaurant-admin/restaurant-management/application';
import { useGetUsersQuery } from 'modules/user-management/users/application';
import type {
  AdminReceiptsReportQueryParams,
  AdminReceiptsReportRow,
  AdminPaymentBreakdownReportQueryParams,
  AdminPaymentBreakdownReportRow,
  AdminReportKey,
  AdminSalesReportQueryParams,
  AdminSalesReportRow,
  AdminShiftReportQueryParams,
  AdminShiftReportRow,
  AdminTopItemsReportQueryParams,
  AdminTopItemsReportRow,
  AdminTopStaffReportQueryParams,
  AdminTopStaffReportRow,
} from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { DataGridColumnsDialogButton } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { downloadBlob } from 'shared/utils/download';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime as formatTashkentDateTime } from 'shared/utils/format-time';

import {
  useGetReceiptsReportQuery,
  useGetPaymentBreakdownReportQuery,
  useGetSalesReportQuery,
  useGetShiftReportQuery,
  useGetTopItemsReportQuery,
  useGetTopStaffReportQuery,
} from '../../application';
import { reportsRepository } from '../../data-access';
import type { ReportDefinition } from '../../domain';

import type { ReportsDatePreset, ReportsFixedDatePreset } from './reportsDateRange';
import { ReportsHeaderCard } from './ReportsHeaderCard';
import type { ReportsToolbarFilter } from './ReportsToolbar';
import { ReportTableCard } from './ReportTableCard';

type ReportTableRow =
  | AdminSalesReportRow
  | AdminReceiptsReportRow
  | AdminTopItemsReportRow
  | AdminTopStaffReportRow
  | AdminPaymentBreakdownReportRow
  | AdminShiftReportRow;

type TableReportKey = Exclude<AdminReportKey, 'summary'>;
type ReportEmptyState = {
  noData: {
    title: string;
    description: string;
  };
  noResults: {
    title: string;
    description: string;
  };
};

const SINGLE_SELECT = (values: string[]) => values.slice(-1);

type ReportsTableSectionProps = {
  report: ReportDefinition;
  startDate: string;
  endDate: string;
  activePreset: ReportsDatePreset;
  search: string;
  paymentMethods: string[];
  receiptKinds: string[];
  statuses: string[];
  categoryIds: string[];
  cashDeskIds: string[];
  cashierIds: string[];
  differenceOnly: string[];
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  columnVisibilityModel: GridColumnVisibilityModel;
  onPresetChange: (value: ReportsFixedDatePreset) => void;
  onRangeChange: (startDate: string, endDate: string) => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onPaymentMethodsChange: (values: string[]) => void;
  onReceiptKindsChange: (values: string[]) => void;
  onStatusesChange: (values: string[]) => void;
  onCategoryIdsChange: (values: string[]) => void;
  onCashDeskIdsChange: (values: string[]) => void;
  onCashierIdsChange: (values: string[]) => void;
  onDifferenceOnlyChange: (values: string[]) => void;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  onSortModelChange: (model: GridSortModel) => void;
  onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
};

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  return formatTashkentDateTime(value, 'DD.MM.YYYY HH:mm');
}

function castColumns<Row extends ReportTableRow>(columns: GridColDef<Row>[]) {
  return columns as GridColDef<ReportTableRow>[];
}

function castRowIdGetter<Row extends ReportTableRow>(getter: GridRowIdGetter<Row>) {
  return getter as GridRowIdGetter<ReportTableRow>;
}

export function ReportsTableSection({
  report,
  startDate,
  endDate,
  activePreset,
  search,
  paymentMethods,
  receiptKinds,
  statuses,
  categoryIds,
  cashDeskIds,
  cashierIds,
  differenceOnly,
  paginationModel,
  sortModel,
  columnVisibilityModel,
  onPresetChange,
  onRangeChange,
  onSearchChange,
  onClearSearch,
  onPaymentMethodsChange,
  onReceiptKindsChange,
  onStatusesChange,
  onCategoryIdsChange,
  onCashDeskIdsChange,
  onCashierIdsChange,
  onDifferenceOnlyChange,
  onPaginationModelChange,
  onSortModelChange,
  onColumnVisibilityModelChange,
}: ReportsTableSectionProps) {
  const { t, currentLang } = useTranslate('reports');
  const [exportLoading, setExportLoading] = useState(false);

  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const ordering = getOrderingFromSortModel(sortModel);
  const tableReportKey = report.key as TableReportKey;
  const periodParams = useMemo(
    () => ({
      startDate,
      endDate,
    }),
    [endDate, startDate],
  );

  const salesQuery = useGetSalesReportQuery(
    {
      ...periodParams,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      paymentMethod: paymentMethods[0],
      ordering,
    } satisfies AdminSalesReportQueryParams,
    { enabled: report.key === 'sales' },
  );
  const receiptsQuery = useGetReceiptsReportQuery(
    {
      ...periodParams,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      status: statuses[0],
      receiptKind: receiptKinds[0] as 'plain' | 'fiscal' | undefined,
      ordering,
    } satisfies AdminReceiptsReportQueryParams,
    { enabled: report.key === 'receipts' },
  );
  const topItemsQuery = useGetTopItemsReportQuery(
    {
      ...periodParams,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      categoryId: categoryIds[0],
      ordering,
    } satisfies AdminTopItemsReportQueryParams,
    { enabled: report.key === 'topItems' },
  );
  const topStaffQuery = useGetTopStaffReportQuery(
    {
      ...periodParams,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      ordering,
    } satisfies AdminTopStaffReportQueryParams,
    { enabled: report.key === 'topStaff' },
  );
  const paymentBreakdownQuery = useGetPaymentBreakdownReportQuery(
    {
      ...periodParams,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      paymentMethod: paymentMethods[0],
      ordering,
    } satisfies AdminPaymentBreakdownReportQueryParams,
    { enabled: report.key === 'paymentBreakdown' },
  );
  const shiftQuery = useGetShiftReportQuery(
    {
      ...periodParams,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      cashDeskId: cashDeskIds[0],
      cashierId: cashierIds[0],
      status: statuses[0],
      differenceOnly: differenceOnly.includes('difference-only'),
      ordering,
    } satisfies AdminShiftReportQueryParams,
    { enabled: report.key === 'shifts' },
  );

  const categoriesQuery = useGetCatalogCategoriesQuery({
    enabled: report.key === 'topItems',
  });
  const cashDesksQuery = useGetCashDesksQuery({
    enabled: report.key === 'shifts',
  });
  const cashiersQuery = useGetUsersQuery(
    {
      page: 1,
      pageSize: 100,
      employmentStatusIn: 'active',
    },
    { enabled: report.key === 'shifts' },
  );

  const paymentMethodOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'cash', label: t('paymentMethods.cash') },
      { value: 'card', label: t('paymentMethods.card') },
      { value: 'qr', label: t('paymentMethods.qr') },
      { value: 'mixed', label: t('paymentMethods.mixed') },
    ],
    [t],
  );
  const statusOptions = useMemo<FilterOption[]>(
    () =>
      report.key === 'receipts'
        ? [
            { value: 'created', label: t('receiptStatuses.created') },
            { value: 'sent', label: t('receiptStatuses.sent') },
            { value: 'failed', label: t('receiptStatuses.failed') },
          ]
        : report.key === 'shifts'
          ? [
              { value: 'open', label: t('statuses.open') },
              { value: 'closed', label: t('statuses.closed') },
            ]
          : [
              { value: 'open', label: t('statuses.open') },
              { value: 'submitted', label: t('statuses.submitted') },
              { value: 'ready', label: t('statuses.ready') },
            ],
    [report.key, t],
  );
  const receiptKindOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'plain', label: t('receiptKinds.precheck') },
      { value: 'fiscal', label: t('receiptKinds.receipt') },
    ],
    [t],
  );
  const categoryOptions = useMemo<FilterOption[]>(
    () => (categoriesQuery.data ?? []).map((category) => ({ value: category.id, label: category.name })),
    [categoriesQuery.data],
  );
  const cashDeskOptions = useMemo<FilterOption[]>(
    () => (cashDesksQuery.data ?? []).map((cashDesk) => ({ value: cashDesk.id, label: cashDesk.name })),
    [cashDesksQuery.data],
  );
  const cashierOptions = useMemo<FilterOption[]>(
    () =>
      (cashiersQuery.data?.data ?? []).map((user) => ({
        value: user.id,
        label: user.fullName,
      })),
    [cashiersQuery.data?.data],
  );
  const differenceOnlyOptions = useMemo<FilterOption[]>(
    () => [{ value: 'difference-only', label: t('filters.onlyDifferences') }],
    [t],
  );

  const activeTableQuery =
    report.key === 'sales'
      ? salesQuery
      : report.key === 'receipts'
        ? receiptsQuery
        : report.key === 'topItems'
          ? topItemsQuery
          : report.key === 'topStaff'
            ? topStaffQuery
            : report.key === 'shifts'
              ? shiftQuery
              : paymentBreakdownQuery;

  const activeColumns = useMemo(() => {
    switch (report.key) {
      case 'sales':
        return castColumns<AdminSalesReportRow>([
          {
            field: 'method',
            headerName: t('reports.sales.fields.method'),
            minWidth: 180,
            flex: 1,
            valueGetter: (_value, row: AdminSalesReportRow) => t(`paymentMethods.${row.method}`),
          },
          { field: 'count', headerName: t('reports.sales.fields.count'), minWidth: 140, flex: 0.5 },
          {
            field: 'total',
            headerName: t('reports.sales.fields.total'),
            minWidth: 160,
            flex: 0.6,
            valueGetter: (_value, row: AdminSalesReportRow) => formatMoney(row.total),
          },
        ]);
      case 'receipts':
        return castColumns<AdminReceiptsReportRow>([
          {
            field: 'orderNumber',
            headerName: t('reports.receipts.fields.orderNumber'),
            minWidth: 150,
            flex: 0.5,
            valueGetter: (_value, row: AdminReceiptsReportRow) => `#${row.orderNumber}`,
          },
          {
            field: 'kind',
            headerName: t('reports.receipts.fields.kind'),
            minWidth: 130,
            flex: 0.45,
            renderCell: ({ row }) => (
              <Chip
                size="small"
                label={t(row.kind === 'plain' ? 'receiptKinds.precheck' : 'receiptKinds.receipt')}
                color={row.kind === 'fiscal' ? 'success' : 'info'}
                variant="soft"
              />
            ),
          },
          {
            field: 'status',
            headerName: t('reports.receipts.fields.status'),
            minWidth: 140,
            flex: 0.5,
            renderCell: ({ row }) => (
              <Chip
                size="small"
                label={t(`receiptStatuses.${row.status}`)}
                color={row.status === 'failed' ? 'error' : row.status === 'sent' ? 'success' : 'warning'}
                variant="soft"
              />
            ),
          },
          {
            field: 'amount',
            headerName: t('reports.receipts.fields.amount'),
            minWidth: 160,
            flex: 0.6,
            valueGetter: (_value, row: AdminReceiptsReportRow) => formatMoney(row.amount),
          },
          {
            field: 'paymentMethod',
            headerName: t('reports.receipts.fields.paymentMethod'),
            minWidth: 150,
            flex: 0.55,
            valueGetter: (_value, row: AdminReceiptsReportRow) =>
              row.paymentMethod ? t(`paymentMethods.${row.paymentMethod}`) : '-',
          },
          {
            field: 'cashierName',
            headerName: t('reports.receipts.fields.cashierName'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminReceiptsReportRow) => row.cashierName || '-',
          },
          {
            field: 'cashDeskName',
            headerName: t('reports.receipts.fields.cashDeskName'),
            minWidth: 150,
            flex: 0.55,
            valueGetter: (_value, row: AdminReceiptsReportRow) => row.cashDeskName || '-',
          },
          {
            field: 'createdAt',
            headerName: t('reports.receipts.fields.createdAt'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminReceiptsReportRow) => formatDateTime(row.createdAt),
          },
        ]);
      case 'topItems':
        return castColumns<AdminTopItemsReportRow>([
          {
            field: 'catalogItemName',
            headerName: t('reports.topItems.fields.catalogItemName'),
            minWidth: 220,
            flex: 1,
          },
          {
            field: 'categoryName',
            headerName: t('reports.topItems.fields.categoryName'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminTopItemsReportRow) => row.categoryName || '-',
          },
          { field: 'quantity', headerName: t('reports.topItems.fields.quantity'), minWidth: 140, flex: 0.5 },
          {
            field: 'revenue',
            headerName: t('reports.topItems.fields.revenue'),
            minWidth: 160,
            flex: 0.6,
            valueGetter: (_value, row: AdminTopItemsReportRow) => formatMoney(row.revenue),
          },
        ]);
      case 'topStaff':
        return castColumns<AdminTopStaffReportRow>([
          {
            field: 'staffName',
            headerName: t('reports.topStaff.fields.staffName'),
            minWidth: 220,
            flex: 1,
            valueGetter: (_value, row: AdminTopStaffReportRow) => row.staffName || '-',
          },
          { field: 'orderCount', headerName: t('reports.topStaff.fields.orderCount'), minWidth: 160, flex: 0.6 },
          {
            field: 'itemsCount',
            headerName: t('reports.topStaff.fields.itemsCount'),
            minWidth: 140,
            flex: 0.5,
            valueGetter: (_value, row: AdminTopStaffReportRow) => row.itemsCount ?? row.items_count ?? 0,
          },
          {
            field: 'totalSales',
            headerName: t('reports.topStaff.fields.totalSales'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminTopStaffReportRow) => formatMoney(row.totalSales),
          },
        ]);
      case 'paymentBreakdown':
        return castColumns<AdminPaymentBreakdownReportRow>([
          {
            field: 'method',
            headerName: t('reports.paymentBreakdown.fields.method'),
            minWidth: 180,
            flex: 1,
            valueGetter: (_value, row: AdminPaymentBreakdownReportRow) => t(`paymentMethods.${row.method}`),
          },
          { field: 'count', headerName: t('reports.paymentBreakdown.fields.count'), minWidth: 140, flex: 0.5 },
          {
            field: 'total',
            headerName: t('reports.paymentBreakdown.fields.total'),
            minWidth: 160,
            flex: 0.6,
            valueGetter: (_value, row: AdminPaymentBreakdownReportRow) => formatMoney(row.total),
          },
        ]);
      case 'shifts':
        return castColumns<AdminShiftReportRow>([
          {
            field: 'cashDeskName',
            headerName: t('reports.shifts.fields.cashDeskAndCashier'),
            minWidth: 120,
            flex: 0.5,
            renderCell: ({ row }) => (
              <Tooltip title={`${row.cashDeskName || '-'} (${row.cashierName || '-'})`} placement="top" arrow>
                <Box sx={{ py: 0.75, lineHeight: 1.25, whiteSpace: 'normal' }}>
                  <Box component="span" sx={{ display: 'block', fontWeight: 600 }}>
                    {row.cashDeskName || '-'}
                  </Box>
                  <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>
                    ({row.cashierName || '-'})
                  </Box>
                </Box>
              </Tooltip>
            ),
          },
          {
            field: 'status',
            headerName: t('reports.shifts.fields.isClosed'),
            minWidth: 100,
            flex: 0.35,
            renderCell: ({ row }) => (
              <Tooltip title={t(`statuses.${row.status}`)} placement="top" arrow>
                <Box sx={{ display: 'flex', color: row.status === 'closed' ? 'success.main' : 'error.main' }}>
                  <Iconify
                    icon={row.status === 'closed' ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                    width={24}
                  />
                </Box>
              </Tooltip>
            ),
          },
          {
            field: 'openedAt',
            headerName: t('reports.shifts.fields.openedAt'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminShiftReportRow) => formatDateTime(row.openedAt),
          },
          {
            field: 'closedAt',
            headerName: t('reports.shifts.fields.closedAt'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminShiftReportRow) => formatDateTime(row.closedAt),
          },
          {
            field: 'openingCashAmount',
            headerName: t('reports.shifts.fields.cashBalance'),
            minWidth: 190,
            flex: 0.75,
            renderCell: ({ row }) => (
              <Box sx={{ py: 0.5, fontSize: '0.75rem', lineHeight: 1.35, whiteSpace: 'normal' }}>
                <Box>
                  {t('reports.shifts.fields.openingCashAmount')}: {formatMoney(row.openingCashAmount)}
                </Box>
                <Box>
                  {t('reports.shifts.fields.expectedClosingCashAmount')}: {formatMoney(row.expectedClosingCashAmount)}
                </Box>
                <Box>
                  {t('reports.shifts.fields.actualClosingCashAmount')}: {formatMoney(row.actualClosingCashAmount)}
                </Box>
                <Box
                  sx={{
                    color: Number(row.cashDifferenceAmount) === 0 ? 'success.main' : 'error.main',
                    fontWeight: 600,
                  }}>
                  {t('reports.shifts.fields.cashDifferenceAmount')}: {formatMoney(row.cashDifferenceAmount)}
                </Box>
              </Box>
            ),
          },
          {
            field: 'cashTotal',
            headerName: t('reports.shifts.fields.paymentTotals'),
            minWidth: 155,
            flex: 0.6,
            renderCell: ({ row }) => (
              <Box sx={{ py: 0.75, fontSize: '0.75rem', lineHeight: 1.35, whiteSpace: 'normal' }}>
                <Box>
                  {t('reports.shifts.fields.cashTotal')}: {formatMoney(row.cashTotal)}
                </Box>
                <Box>
                  {t('reports.shifts.fields.cardTotal')}: {formatMoney(row.cardTotal)}
                </Box>
              </Box>
            ),
          },
          {
            field: 'refundTotal',
            headerName: t('reports.shifts.fields.refundTotal'),
            minWidth: 150,
            flex: 0.55,
            valueGetter: (_value, row: AdminShiftReportRow) => formatMoney(row.refundTotal),
          },
          {
            field: 'precheckCount',
            headerName: t('reports.shifts.fields.precheckCount'),
            minWidth: 130,
            flex: 0.45,
          },
          {
            field: 'receiptCount',
            headerName: t('reports.shifts.fields.receiptCount'),
            minWidth: 130,
            flex: 0.45,
          },
        ]);
      default:
        return castColumns<AdminSalesReportRow>([]);
    }
  }, [report.key, t]);

  const getReportRowId = useMemo(() => {
    switch (report.key) {
      case 'sales':
        return castRowIdGetter<AdminSalesReportRow>((row) => row.method);
      case 'paymentBreakdown':
        return castRowIdGetter<AdminPaymentBreakdownReportRow>((row) => row.method);
      case 'receipts':
        return castRowIdGetter<AdminReceiptsReportRow>((row) => row.id);
      case 'shifts':
        return castRowIdGetter<AdminShiftReportRow>((row) => row.id);
      case 'topItems':
        return castRowIdGetter<AdminTopItemsReportRow>(
          (row) => `${row.catalogItemId ?? row.catalogItemName}-${row.categoryId ?? 'none'}`,
        );
      case 'topStaff':
        return castRowIdGetter<AdminTopStaffReportRow>(
          (row) =>
            `${row.staffId ?? row.staffName ?? 'unknown'}-${row.orderCount}-${row.itemsCount ?? row.items_count ?? 0}-${row.totalSales}`,
        );
      default:
        return ((row: ReportTableRow) => JSON.stringify(row)) as GridRowIdGetter<ReportTableRow>;
    }
  }, [report.key]);

  const toolbarFilters = useMemo<ReportsToolbarFilter[]>(
    () => [
      ...(report.availableFilters.includes('paymentMethod')
        ? [
            {
              label: t('filters.paymentMethod'),
              value: paymentMethods,
              options: paymentMethodOptions,
              onChange: (values: string[]) => onPaymentMethodsChange(SINGLE_SELECT(values)),
              onApply: (values: string[]) => {
                onPaymentMethodsChange(SINGLE_SELECT(values));
                onPaginationModelChange({ ...paginationModel, page: 0 });
              },
              testId: 'reports-payment-method-filter',
              emptyLabel: t('filters.all'),
            },
          ]
        : []),
      ...(report.availableFilters.includes('receiptKind')
        ? [
            {
              label: t('filters.receiptKind'),
              value: receiptKinds,
              options: receiptKindOptions,
              onChange: (values: string[]) => onReceiptKindsChange(SINGLE_SELECT(values)),
              onApply: (values: string[]) => {
                onReceiptKindsChange(SINGLE_SELECT(values));
                onPaginationModelChange({ ...paginationModel, page: 0 });
              },
              testId: 'reports-receipt-kind-filter',
              emptyLabel: t('filters.all'),
            },
          ]
        : []),
      ...(report.availableFilters.includes('status')
        ? [
            {
              label: t('filters.status'),
              value: statuses,
              options: statusOptions,
              onChange: (values: string[]) => onStatusesChange(SINGLE_SELECT(values)),
              onApply: (values: string[]) => {
                onStatusesChange(SINGLE_SELECT(values));
                onPaginationModelChange({ ...paginationModel, page: 0 });
              },
              testId: 'reports-status-filter',
              emptyLabel: t('filters.all'),
            },
          ]
        : []),
      ...(report.availableFilters.includes('category')
        ? [
            {
              label: t('filters.category'),
              value: categoryIds,
              options: categoryOptions,
              onChange: (values: string[]) => onCategoryIdsChange(SINGLE_SELECT(values)),
              onApply: (values: string[]) => {
                onCategoryIdsChange(SINGLE_SELECT(values));
                onPaginationModelChange({ ...paginationModel, page: 0 });
              },
              testId: 'reports-category-filter',
              emptyLabel: t('filters.all'),
            },
          ]
        : []),
      ...(report.availableFilters.includes('cashDesk')
        ? [
            {
              label: t('filters.cashDesk'),
              value: cashDeskIds,
              options: cashDeskOptions,
              onChange: (values: string[]) => onCashDeskIdsChange(SINGLE_SELECT(values)),
              onApply: (values: string[]) => {
                onCashDeskIdsChange(SINGLE_SELECT(values));
                onPaginationModelChange({ ...paginationModel, page: 0 });
              },
              testId: 'reports-cash-desk-filter',
              emptyLabel: t('filters.all'),
            },
          ]
        : []),
      ...(report.availableFilters.includes('cashier')
        ? [
            {
              label: t('filters.cashier'),
              value: cashierIds,
              options: cashierOptions,
              onChange: (values: string[]) => onCashierIdsChange(SINGLE_SELECT(values)),
              onApply: (values: string[]) => {
                onCashierIdsChange(SINGLE_SELECT(values));
                onPaginationModelChange({ ...paginationModel, page: 0 });
              },
              testId: 'reports-cashier-filter',
              emptyLabel: t('filters.all'),
            },
          ]
        : []),
      ...(report.availableFilters.includes('differenceOnly')
        ? [
            {
              label: t('filters.differenceOnly'),
              value: differenceOnly,
              options: differenceOnlyOptions,
              onChange: (values: string[]) => onDifferenceOnlyChange(SINGLE_SELECT(values)),
              onApply: (values: string[]) => {
                onDifferenceOnlyChange(SINGLE_SELECT(values));
                onPaginationModelChange({ ...paginationModel, page: 0 });
              },
              testId: 'reports-difference-only-filter',
              emptyLabel: t('filters.all'),
            },
          ]
        : []),
    ],
    [
      cashDeskIds,
      cashDeskOptions,
      cashierIds,
      cashierOptions,
      categoryIds,
      categoryOptions,
      differenceOnly,
      differenceOnlyOptions,
      onCashDeskIdsChange,
      onCashierIdsChange,
      onDifferenceOnlyChange,
      onCategoryIdsChange,
      onReceiptKindsChange,
      onPaginationModelChange,
      onPaymentMethodsChange,
      onStatusesChange,
      paginationModel,
      paymentMethodOptions,
      paymentMethods,
      receiptKindOptions,
      receiptKinds,
      report.availableFilters,
      statusOptions,
      statuses,
      t,
    ],
  );

  const searchPlaceholderMap: Record<TableReportKey, string> = {
    sales: t('filters.searchSalesPlaceholder'),
    receipts: t('filters.searchReceiptsPlaceholder'),
    topItems: t('filters.searchTopItemsPlaceholder'),
    topStaff: t('filters.searchTopStaffPlaceholder'),
    paymentBreakdown: t('filters.searchPaymentBreakdownPlaceholder'),
    shifts: t('filters.searchShiftsPlaceholder'),
  };

  const emptyStateMap: Record<TableReportKey, ReportEmptyState> = {
    sales: {
      noData: { title: t('empty.sales.noData.title'), description: t('empty.sales.noData.description') },
      noResults: { title: t('empty.sales.noResults.title'), description: t('empty.sales.noResults.description') },
    },
    receipts: {
      noData: { title: t('empty.receipts.noData.title'), description: t('empty.receipts.noData.description') },
      noResults: {
        title: t('empty.receipts.noResults.title'),
        description: t('empty.receipts.noResults.description'),
      },
    },
    topItems: {
      noData: { title: t('empty.topItems.noData.title'), description: t('empty.topItems.noData.description') },
      noResults: { title: t('empty.topItems.noResults.title'), description: t('empty.topItems.noResults.description') },
    },
    topStaff: {
      noData: { title: t('empty.topStaff.noData.title'), description: t('empty.topStaff.noData.description') },
      noResults: { title: t('empty.topStaff.noResults.title'), description: t('empty.topStaff.noResults.description') },
    },
    paymentBreakdown: {
      noData: {
        title: t('empty.paymentBreakdown.noData.title'),
        description: t('empty.paymentBreakdown.noData.description'),
      },
      noResults: {
        title: t('empty.paymentBreakdown.noResults.title'),
        description: t('empty.paymentBreakdown.noResults.description'),
      },
    },
    shifts: {
      noData: {
        title: t('empty.shifts.noData.title'),
        description: t('empty.shifts.noData.description'),
      },
      noResults: {
        title: t('empty.shifts.noResults.title'),
        description: t('empty.shifts.noResults.description'),
      },
    },
  };

  const handleRefresh = () => {
    void activeTableQuery.refetch();
  };

  const handleExport = async () => {
    setExportLoading(true);

    try {
      const commonParams = {
        ...periodParams,
        search: search || undefined,
        ordering,
      };

      const result =
        report.key === 'sales'
          ? await reportsRepository.exportSales({ ...commonParams, paymentMethod: paymentMethods[0] })
          : report.key === 'receipts'
            ? await reportsRepository.exportReceipts({
                ...commonParams,
                status: statuses[0],
                receiptKind: receiptKinds[0] as 'plain' | 'fiscal' | undefined,
              })
            : report.key === 'topItems'
              ? await reportsRepository.exportTopItems({ ...commonParams, categoryId: categoryIds[0] })
              : report.key === 'topStaff'
                ? await reportsRepository.exportTopStaff(commonParams)
                : report.key === 'shifts'
                  ? await reportsRepository.exportShifts({
                      ...commonParams,
                      cashDeskId: cashDeskIds[0],
                      cashierId: cashierIds[0],
                      status: statuses[0],
                      differenceOnly: differenceOnly.includes('difference-only'),
                    })
                  : await reportsRepository.exportPaymentBreakdown({
                      ...commonParams,
                      paymentMethod: paymentMethods[0],
                    });

      downloadBlob(result.blob, result.filename);
    } catch {
      toast.error(t('errors.exportFailed'));
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <ReportsHeaderCard
        report={report}
        title={t(report.titleKey)}
        activePreset={activePreset}
        startDate={startDate}
        endDate={endDate}
        onPresetChange={onPresetChange}
        onRangeChange={onRangeChange}
        search={search}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        searchPlaceholder={searchPlaceholderMap[tableReportKey]}
        filters={toolbarFilters}
        onRefresh={handleRefresh}
        refreshLoading={activeTableQuery.isFetching}
        onExport={handleExport}
        exportLoading={exportLoading}
        showSearch={report.key !== 'sales' && report.key !== 'paymentBreakdown'}
      />

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, mt: 3 }}>
        {activeTableQuery.isError ? (
          <Alert severity="error" sx={{ width: 1, alignSelf: 'flex-start' }}>
            {t('errors.loadFailed')}
          </Alert>
        ) : (
          <ReportTableCard
            rows={activeTableQuery.data?.data ?? []}
            columns={activeColumns}
            rowCount={activeTableQuery.data?.total ?? 0}
            loading={activeTableQuery.isLoading}
            onRefresh={handleRefresh}
            refreshing={activeTableQuery.isFetching}
            localeText={localeText}
            paginationModel={paginationModel}
            onPaginationModelChange={onPaginationModelChange}
            sortModel={sortModel}
            onSortModelChange={onSortModelChange}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={onColumnVisibilityModelChange}
            getRowId={getReportRowId}
            autoRowHeight={report.key === 'shifts'}
            toolbar={
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2.5, py: 2 }}>
                <DataGridColumnsDialogButton
                  columns={activeColumns as GridColDef[]}
                  columnVisibilityModel={columnVisibilityModel}
                  defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
                  onSave={onColumnVisibilityModelChange}
                  showLabel
                />
              </Box>
            }
            hasActiveFilters={Boolean(
              search ||
                paymentMethods.length ||
                statuses.length ||
                receiptKinds.length ||
                categoryIds.length ||
                cashDeskIds.length ||
                cashierIds.length ||
                differenceOnly.length,
            )}
            emptyState={emptyStateMap[tableReportKey]}
          />
        )}
      </Box>
    </>
  );
}
