import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import type { GridColDef } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import type {
  AdminPaymentBreakdownReportRow,
  AdminReceiptStatus,
  AdminReceiptsReportRow,
  AdminReportKey,
  AdminSalesReportRow,
  AdminShiftReportRow,
  AdminTopItemsReportRow,
  AdminTopStaffReportRow,
} from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime as formatTashkentDateTime } from 'shared/utils/format-time';

export type ReportTableRow =
  | AdminSalesReportRow
  | AdminReceiptsReportRow
  | AdminTopItemsReportRow
  | AdminTopStaffReportRow
  | AdminPaymentBreakdownReportRow
  | AdminShiftReportRow;

export type TableReportKey = Exclude<AdminReportKey, 'summary'>;
export type ReportsTranslate = ReturnType<typeof useTranslate>['t'];

export function parseReceiptStatus(value: string | undefined): AdminReceiptStatus | undefined {
  switch (value) {
    case undefined:
    case 'created':
    case 'sent':
    case 'failed':
      return value;
    default:
      throw new Error(`Unsupported receipt status: ${value}`);
  }
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  return formatTashkentDateTime(value, 'DD.MM.YYYY HH:mm');
}

function castColumns<Row extends ReportTableRow>(columns: GridColDef<Row>[]) {
  return columns as GridColDef<ReportTableRow>[];
}

export function getReportTableColumns(reportKey: TableReportKey, t: ReportsTranslate) {
  switch (reportKey) {
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
}
