import type { GridRowIdGetter } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { useBranchScopeColumns } from 'app/layouts/components/branch-scope-columns';
import { useTranslate } from 'app/providers/locales';
import type {
  AdminPaymentBreakdownReportRow,
  AdminReceiptsReportRow,
  AdminSalesReportRow,
  AdminShiftReportRow,
  AdminTopItemsReportRow,
  AdminTopStaffReportRow,
} from 'shared/api/admin-types';

import type { ZReportRow } from '../../domain';

import { getReportTableColumns, type ReportTableRow, type TableReportKey } from './reportTableColumns';

function castRowIdGetter<Row extends ReportTableRow>(getter: GridRowIdGetter<Row>) {
  return getter as GridRowIdGetter<ReportTableRow>;
}

function getReportRowId(reportKey: TableReportKey): GridRowIdGetter<ReportTableRow> {
  switch (reportKey) {
    case 'zReports':
      return castRowIdGetter<ZReportRow>((row) => row.id);
    case 'sales':
      return castRowIdGetter<AdminSalesReportRow>((row) => `${row.restaurantId ?? 'all'}-${row.method}`);
    case 'paymentBreakdown':
      return castRowIdGetter<AdminPaymentBreakdownReportRow>((row) => `${row.restaurantId ?? 'all'}-${row.method}`);
    case 'receipts':
      return castRowIdGetter<AdminReceiptsReportRow>((row) => row.id);
    case 'shifts':
      return castRowIdGetter<AdminShiftReportRow>((row) => row.id);
    case 'topItems':
      return castRowIdGetter<AdminTopItemsReportRow>(
        (row) => `${row.restaurantId ?? 'all'}-${row.catalogItemId ?? row.catalogItemName}-${row.categoryId ?? 'none'}`,
      );
    case 'topStaff':
      return castRowIdGetter<AdminTopStaffReportRow>(
        (row) =>
          `${row.restaurantId ?? 'all'}-${row.staffId ?? row.staffName ?? 'unknown'}-${row.orderCount}-${row.itemsCount ?? row.items_count ?? 0}-${row.totalSales}`,
      );
  }
}

export function useReportTablePresentation(reportKey: TableReportKey) {
  const { t } = useTranslate('reports');

  const baseColumns = useMemo(() => getReportTableColumns(reportKey, t), [reportKey, t]);
  const columns = useBranchScopeColumns(baseColumns);

  return useMemo(() => {
    const emptyStateKey = `empty.${reportKey}`;
    return {
      columns,
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
  }, [columns, reportKey, t]);
}
