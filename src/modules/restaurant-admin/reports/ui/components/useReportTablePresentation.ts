import type { GridRowIdGetter } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import type {
  AdminPaymentBreakdownReportRow,
  AdminReceiptsReportRow,
  AdminSalesReportRow,
  AdminShiftReportRow,
  AdminTopItemsReportRow,
  AdminTopStaffReportRow,
} from 'shared/api/admin-types';

import { getReportTableColumns, type ReportTableRow, type TableReportKey } from './reportTableColumns';

function castRowIdGetter<Row extends ReportTableRow>(getter: GridRowIdGetter<Row>) {
  return getter as GridRowIdGetter<ReportTableRow>;
}

function getReportRowId(reportKey: TableReportKey): GridRowIdGetter<ReportTableRow> {
  switch (reportKey) {
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
  }
}

export function useReportTablePresentation(reportKey: TableReportKey) {
  const { t } = useTranslate('reports');

  return useMemo(() => {
    const emptyStateKey = `empty.${reportKey}`;
    return {
      columns: getReportTableColumns(reportKey, t),
      getRowId: getReportRowId(reportKey),
      searchPlaceholder: t(`filters.search${reportKey[0].toUpperCase()}${reportKey.slice(1)}Placeholder`),
      emptyState: {
        noData: {
          title: t(`${emptyStateKey}.noData.title`),
          description: t(`${emptyStateKey}.noData.description`),
        },
        noResults: {
          title: t(`${emptyStateKey}.noResults.title`),
          description: t(`${emptyStateKey}.noResults.description`),
        },
      },
    };
  }, [reportKey, t]);
}
