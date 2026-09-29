import type { AdminReportTableTotals } from 'shared/api/admin-types';
import { formatMoney } from 'shared/utils/format-money';
import { formatQuantityNumber, formatSaleQuantity } from 'shared/utils/format-quantity';

import type { ReportsTranslate, TableReportKey } from './reportTableColumns';

export type ReportFooterMetric = { label: string; value: string };

function count(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : formatQuantityNumber(value);
}

function money(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : formatMoney(value);
}

function number(totals: AdminReportTableTotals, field: string) {
  const value = totals[field];
  return typeof value === 'number' ? value : value === null ? null : 0;
}

export function getReportFooterMetrics(
  reportKey: TableReportKey,
  totals: AdminReportTableTotals | undefined,
  t: ReportsTranslate,
  groupBy: 'item' | 'category' = 'item',
): ReportFooterMetric[] {
  if (!totals) return [];
  const field = (key: string, format: (value: number | null | undefined) => string): ReportFooterMetric => ({
    label: t(`reports.${reportKey}.fields.${key}`),
    value: format(number(totals, key)),
  });

  switch (reportKey) {
    case 'sales':
    case 'paymentBreakdown':
      return [field('count', count), field('total', money)];
    case 'receipts':
      return [field('amount', money)];
    case 'topItems': {
      if (groupBy === 'category') {
        return [
          { label: t('reports.topItems.groupByItem'), value: count(number(totals, 'itemCount')) },
          field('revenue', money),
        ];
      }
      const quantities = Object.entries(totals.quantityByUnit ?? {})
        .filter((entry): entry is ['piece' | 'kg' | 'pors', number] => typeof entry[1] === 'number' && entry[1] !== 0)
        .map(([unit, value]) => formatSaleQuantity(value, unit));
      return [
        { label: t('reports.topItems.fields.quantity'), value: quantities.length ? quantities.join(' · ') : '0' },
        field('revenue', money),
      ];
    }
    case 'topStaff':
      return [field('orderCount', count), field('itemsCount', count), field('totalSales', money)];
    case 'shifts':
      return [
        'openingCashAmount',
        'expectedClosingCashAmount',
        'actualClosingCashAmount',
        'cashDifferenceAmount',
        'cashTotal',
        'cardTotal',
        'refundTotal',
        'expenseTotal',
      ]
        .map((key) => field(key, money))
        .concat([field('precheckCount', count), field('receiptCount', count)]);
    case 'zReports':
      return [
        field('saleTotal', money),
        field('cashTotal', money),
        field('cardTotal', money),
        field('refundTotal', money),
        field('saleCount', count),
        field('refundCount', count),
      ];
  }
}
