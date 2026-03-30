import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowIdGetter,
  GridSortModel,
} from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { useGetCatalogCategoriesQuery } from 'modules/catalog';
import { useGetFloorHallsQuery } from 'modules/floor';
import { useGetCashDesksQuery } from 'modules/organizations';
import { useGetUsersQuery } from 'modules/users';
import type {
  AdminOpenChecksReportQueryParams,
  AdminOpenChecksReportRow,
  AdminPaymentBreakdownReportQueryParams,
  AdminPaymentBreakdownReportRow,
  AdminReportKey,
  AdminReportPeriodType,
  AdminSalesReportQueryParams,
  AdminSalesReportRow,
  AdminShiftReportQueryParams,
  AdminShiftReportRow,
  AdminTopItemsReportQueryParams,
  AdminTopItemsReportRow,
  AdminTopStaffReportQueryParams,
  AdminTopStaffReportRow,
} from 'shared/api/admin-types';
import { DataGridColumnsDialogButton } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { downloadBlob } from 'shared/utils/download';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime as formatTashkentDateTime } from 'shared/utils/format-time';

import {
  useGetOpenChecksReportQuery,
  useGetPaymentBreakdownReportQuery,
  useGetSalesReportQuery,
  useGetShiftReportQuery,
  useGetTopItemsReportQuery,
  useGetTopStaffReportQuery,
} from '../../application';
import { reportsRepository } from '../../data-access';
import type { ReportDefinition } from '../../domain';

import { ReportsHeaderCard } from './ReportsHeaderCard';
import type { ReportsToolbarFilter } from './ReportsToolbar';
import { ReportTableCard } from './ReportTableCard';

type ReportTableRow =
  | AdminSalesReportRow
  | AdminOpenChecksReportRow
  | AdminTopItemsReportRow
  | AdminTopStaffReportRow
  | AdminPaymentBreakdownReportRow
  | AdminShiftReportRow;

const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const SINGLE_SELECT = (values: string[]) => values.slice(-1);

type ReportsTableSectionProps = {
  report: ReportDefinition;
  periodType: AdminReportPeriodType;
  selectedDate: string;
  selectedMonth: string;
  selectedYear: string;
  search: string;
  paymentMethods: string[];
  statuses: string[];
  hallIds: string[];
  categoryIds: string[];
  cashDeskIds: string[];
  cashierIds: string[];
  differenceOnly: string[];
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  columnVisibilityModel: GridColumnVisibilityModel;
  onPeriodTypeChange: (value: AdminReportPeriodType) => void;
  onDateChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onPaymentMethodsChange: (values: string[]) => void;
  onStatusesChange: (values: string[]) => void;
  onHallIdsChange: (values: string[]) => void;
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

export function ReportsTableSection({
  report,
  periodType,
  selectedDate,
  selectedMonth,
  selectedYear,
  search,
  paymentMethods,
  statuses,
  hallIds,
  categoryIds,
  cashDeskIds,
  cashierIds,
  differenceOnly,
  paginationModel,
  sortModel,
  columnVisibilityModel,
  onPeriodTypeChange,
  onDateChange,
  onMonthChange,
  onYearChange,
  onSearchChange,
  onClearSearch,
  onPaymentMethodsChange,
  onStatusesChange,
  onHallIdsChange,
  onCategoryIdsChange,
  onCashDeskIdsChange,
  onCashierIdsChange,
  onDifferenceOnlyChange,
  onPaginationModelChange,
  onSortModelChange,
  onColumnVisibilityModelChange,
}: ReportsTableSectionProps) {
  const { t, currentLang } = useTranslate('reports');
  const { t: tCommon } = useTranslate('common');
  const [exportLoading, setExportLoading] = useState(false);

  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const ordering = getOrderingFromSortModel(sortModel);
  const periodParams = useMemo(
    () => ({
      periodType,
      date: periodType === 'day' ? selectedDate : undefined,
      month: periodType === 'month' ? selectedMonth : undefined,
      year: periodType === 'year' ? selectedYear : undefined,
    }),
    [periodType, selectedDate, selectedMonth, selectedYear],
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
  const openChecksQuery = useGetOpenChecksReportQuery(
    {
      ...periodParams,
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      status: statuses[0],
      hallId: hallIds[0],
      ordering,
    } satisfies AdminOpenChecksReportQueryParams,
    { enabled: report.key === 'openChecks' },
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

  const hallsQuery = useGetFloorHallsQuery({
    enabled: report.key === 'openChecks',
  });
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
      uiModeIn: 'pos',
      isActive: true,
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
    () => [
      { value: 'open', label: t('statuses.open') },
      { value: 'submitted', label: t('statuses.submitted') },
      { value: 'ready', label: t('statuses.ready') },
      { value: 'closed', label: t('statuses.closed') },
      { value: 'cancelled', label: t('statuses.cancelled') },
    ],
    [t],
  );
  const hallOptions = useMemo<FilterOption[]>(
    () =>
      (hallsQuery.data ?? []).map((hall) => ({
        value: hall.id,
        label: formatHallDisplayName(hall.name, hall.level, tCommon),
      })),
    [hallsQuery.data, tCommon],
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
      : report.key === 'openChecks'
        ? openChecksQuery
        : report.key === 'topItems'
          ? topItemsQuery
          : report.key === 'topStaff'
            ? topStaffQuery
            : report.key === 'shifts'
              ? shiftQuery
              : paymentBreakdownQuery;

  const lastUpdatedLabel = activeTableQuery.dataUpdatedAt
    ? t('workspace.lastUpdated', { value: formatTashkentDateTime(activeTableQuery.dataUpdatedAt, 'DD.MM.YYYY HH:mm') })
    : t('workspace.awaitingData');

  const activeColumns = useMemo<GridColDef<ReportTableRow>[]>(() => {
    switch (report.key) {
      case 'sales':
        return [
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
        ];
      case 'openChecks':
        return [
          {
            field: 'orderNumber',
            headerName: t('reports.openChecks.fields.orderNumber'),
            minWidth: 150,
            flex: 0.5,
            valueGetter: (_value, row: AdminOpenChecksReportRow) => `#${row.orderNumber}`,
          },
          {
            field: 'status',
            headerName: t('reports.openChecks.fields.status'),
            minWidth: 140,
            flex: 0.5,
            renderCell: ({ row }: { row: AdminOpenChecksReportRow }) => (
              <Chip size="small" label={t(`statuses.${row.status}`)} color="warning" variant="soft" />
            ),
          },
          {
            field: 'hallName',
            headerName: t('reports.openChecks.fields.hallName'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminOpenChecksReportRow) =>
              formatHallDisplayName(row.hallName, row.hallLevel, tCommon),
          },
          {
            field: 'tableName',
            headerName: t('reports.openChecks.fields.tableName'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminOpenChecksReportRow) => row.tableName || '-',
          },
          {
            field: 'total',
            headerName: t('reports.openChecks.fields.total'),
            minWidth: 160,
            flex: 0.6,
            valueGetter: (_value, row: AdminOpenChecksReportRow) => formatMoney(row.total),
          },
          {
            field: 'createdAt',
            headerName: t('reports.openChecks.fields.createdAt'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminOpenChecksReportRow) => formatDateTime(row.createdAt),
          },
        ];
      case 'topItems':
        return [
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
        ];
      case 'topStaff':
        return [
          {
            field: 'staffName',
            headerName: t('reports.topStaff.fields.staffName'),
            minWidth: 220,
            flex: 1,
            valueGetter: (_value, row: AdminTopStaffReportRow) => row.staffName || '-',
          },
          { field: 'orderCount', headerName: t('reports.topStaff.fields.orderCount'), minWidth: 160, flex: 0.6 },
          {
            field: 'totalSales',
            headerName: t('reports.topStaff.fields.totalSales'),
            minWidth: 180,
            flex: 0.7,
            valueGetter: (_value, row: AdminTopStaffReportRow) => formatMoney(row.totalSales),
          },
        ];
      case 'paymentBreakdown':
        return [
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
        ];
      case 'shifts':
        return [
          {
            field: 'cashierName',
            headerName: t('reports.shifts.fields.cashierName'),
            minWidth: 220,
            flex: 1,
            valueGetter: (_value, row: AdminShiftReportRow) => row.cashierName || '-',
          },
          {
            field: 'cashDeskName',
            headerName: t('reports.shifts.fields.cashDeskName'),
            minWidth: 180,
            flex: 0.8,
            valueGetter: (_value, row: AdminShiftReportRow) => row.cashDeskName || '-',
          },
          {
            field: 'status',
            headerName: t('reports.shifts.fields.status'),
            minWidth: 140,
            flex: 0.5,
            renderCell: ({ row }: { row: AdminShiftReportRow }) => (
              <Chip
                size="small"
                label={t(`statuses.${row.status}`)}
                color={row.status === 'closed' ? 'success' : 'warning'}
                variant="soft"
              />
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
            headerName: t('reports.shifts.fields.openingCashAmount'),
            minWidth: 160,
            flex: 0.6,
            valueGetter: (_value, row: AdminShiftReportRow) => formatMoney(row.openingCashAmount),
          },
          {
            field: 'expectedClosingCashAmount',
            headerName: t('reports.shifts.fields.expectedClosingCashAmount'),
            minWidth: 170,
            flex: 0.7,
            valueGetter: (_value, row: AdminShiftReportRow) => formatMoney(row.expectedClosingCashAmount),
          },
          {
            field: 'actualClosingCashAmount',
            headerName: t('reports.shifts.fields.actualClosingCashAmount'),
            minWidth: 170,
            flex: 0.7,
            valueGetter: (_value, row: AdminShiftReportRow) => formatMoney(row.actualClosingCashAmount),
          },
          {
            field: 'cashDifferenceAmount',
            headerName: t('reports.shifts.fields.cashDifferenceAmount'),
            minWidth: 160,
            flex: 0.6,
            renderCell: ({ row }: { row: AdminShiftReportRow }) => (
              <Chip
                size="small"
                label={formatMoney(row.cashDifferenceAmount)}
                color={Number(row.cashDifferenceAmount) === 0 ? 'success' : 'warning'}
                variant="soft"
              />
            ),
          },
          {
            field: 'cashTotal',
            headerName: t('reports.shifts.fields.cashTotal'),
            minWidth: 140,
            flex: 0.55,
            valueGetter: (_value, row: AdminShiftReportRow) => formatMoney(row.cashTotal),
          },
          {
            field: 'cardTotal',
            headerName: t('reports.shifts.fields.cardTotal'),
            minWidth: 140,
            flex: 0.55,
            valueGetter: (_value, row: AdminShiftReportRow) => formatMoney(row.cardTotal),
          },
          {
            field: 'qrTotal',
            headerName: t('reports.shifts.fields.qrTotal'),
            minWidth: 140,
            flex: 0.55,
            valueGetter: (_value, row: AdminShiftReportRow) => formatMoney(row.qrTotal),
          },
          {
            field: 'refundTotal',
            headerName: t('reports.shifts.fields.refundTotal'),
            minWidth: 150,
            flex: 0.55,
            valueGetter: (_value, row: AdminShiftReportRow) => formatMoney(row.refundTotal),
          },
          {
            field: 'receiptCount',
            headerName: t('reports.shifts.fields.receiptCount'),
            minWidth: 130,
            flex: 0.45,
          },
          {
            field: 'reprintCount',
            headerName: t('reports.shifts.fields.reprintCount'),
            minWidth: 130,
            flex: 0.45,
          },
        ];
      default:
        return [
          { field: 'method', headerName: '', minWidth: 120 },
        ];
    }
  }, [report.key, t, tCommon]);

  const getReportRowId = useMemo<GridRowIdGetter<ReportTableRow>>(() => {
    switch (report.key) {
      case 'sales':
      case 'paymentBreakdown':
        return (row) => row.method;
      case 'openChecks':
      case 'shifts':
        return (row) => row.id;
      case 'topItems':
        return (row) => `${row.catalogItemId ?? row.catalogItemName}-${row.categoryId ?? 'none'}`;
      case 'topStaff':
        return (row) => `${row.staffId ?? row.staffName ?? 'unknown'}-${row.orderCount}-${row.totalSales}`;
      default:
        return (row) => JSON.stringify(row);
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
      ...(report.availableFilters.includes('hall')
        ? [
            {
              label: t('filters.hall'),
              value: hallIds,
              options: hallOptions,
              onChange: (values: string[]) => onHallIdsChange(SINGLE_SELECT(values)),
              onApply: (values: string[]) => {
                onHallIdsChange(SINGLE_SELECT(values));
                onPaginationModelChange({ ...paginationModel, page: 0 });
              },
              testId: 'reports-hall-filter',
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
      hallIds,
      hallOptions,
      onDifferenceOnlyChange,
      onCategoryIdsChange,
      onHallIdsChange,
      onPaginationModelChange,
      onPaymentMethodsChange,
      onStatusesChange,
      paginationModel,
      paymentMethodOptions,
      paymentMethods,
      report.availableFilters,
      statusOptions,
      statuses,
      t,
    ],
  );

  const searchPlaceholderMap: Record<AdminReportKey, string> = {
    summary: t('filters.searchPlaceholder'),
    sales: t('filters.searchSalesPlaceholder'),
    openChecks: t('filters.searchOpenChecksPlaceholder'),
    topItems: t('filters.searchTopItemsPlaceholder'),
    topStaff: t('filters.searchTopStaffPlaceholder'),
    paymentBreakdown: t('filters.searchPaymentBreakdownPlaceholder'),
    shifts: t('filters.searchShiftsPlaceholder'),
  };

  const emptyStateMap = {
    sales: {
      noData: { title: t('empty.sales.noData.title'), description: t('empty.sales.noData.description') },
      noResults: { title: t('empty.sales.noResults.title'), description: t('empty.sales.noResults.description') },
    },
    openChecks: {
      noData: { title: t('empty.openChecks.noData.title'), description: t('empty.openChecks.noData.description') },
      noResults: {
        title: t('empty.openChecks.noResults.title'),
        description: t('empty.openChecks.noResults.description'),
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
          : report.key === 'openChecks'
            ? await reportsRepository.exportOpenChecks({
                ...commonParams,
                status: statuses[0],
                hallId: hallIds[0],
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
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <ReportsHeaderCard
        report={report}
        title={t(report.titleKey)}
        lastUpdatedLabel={lastUpdatedLabel}
        periodType={periodType}
        date={selectedDate}
        month={selectedMonth}
        year={selectedYear}
        onPeriodTypeChange={onPeriodTypeChange}
        onDateChange={onDateChange}
        onMonthChange={onMonthChange}
        onYearChange={onYearChange}
        search={search}
        onSearchChange={onSearchChange}
        onClearSearch={onClearSearch}
        searchPlaceholder={searchPlaceholderMap[report.key]}
        filters={toolbarFilters}
        onRefresh={handleRefresh}
        refreshLoading={activeTableQuery.isFetching}
        onExport={handleExport}
        exportLoading={exportLoading}
        showSearch
      />

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, mt: 3 }}>
        <ReportTableCard
          rows={activeTableQuery.data?.data ?? []}
          columns={activeColumns}
          rowCount={activeTableQuery.data?.total ?? 0}
          loading={activeTableQuery.isLoading}
          localeText={localeText}
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
          getRowId={getReportRowId}
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
              hallIds.length ||
              categoryIds.length ||
              cashDeskIds.length ||
              cashierIds.length ||
              differenceOnly.length,
          )}
          emptyState={emptyStateMap[report.key]}
        />
      </Box>
    </>
  );
}
