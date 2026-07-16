import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import type { GridColDef, GridColumnVisibilityModel, GridPaginationModel, GridSortModel } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { DataGridColumnsDialogButton } from 'shared/ui/CustomDataGrid';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import type { ReportDefinition } from '../../domain';

import type { ReportsDatePreset, ReportsFixedDatePreset } from './reportsDateRange';
import { ReportsHeaderCard } from './ReportsHeaderCard';
import { ReportTableCard } from './ReportTableCard';
import { parseReceiptStatus, type TableReportKey } from './reportTableColumns';
import { useReportExport } from './useReportExport';
import { useReportsToolbarFilters } from './useReportsToolbarFilters';
import { useReportTablePresentation } from './useReportTablePresentation';
import { useReportTableQuery } from './useReportTableQuery';

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

  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const ordering = getOrderingFromSortModel(sortModel);
  const tableReportKey = report.key as TableReportKey;
  const receiptStatus = report.key === 'receipts' ? parseReceiptStatus(statuses[0]) : undefined;
  const activeTableQuery = useReportTableQuery({
    reportKey: tableReportKey,
    startDate,
    endDate,
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    ordering,
    paymentMethod: paymentMethods[0],
    receiptStatus,
    receiptKind: receiptKinds[0] as 'plain' | 'fiscal' | undefined,
    categoryId: categoryIds[0],
    cashDeskId: cashDeskIds[0],
    cashierId: cashierIds[0],
    shiftStatus: statuses[0],
    differenceOnly: differenceOnly.includes('difference-only'),
  });

  const presentation = useReportTablePresentation(tableReportKey);

  const toolbarFilters = useReportsToolbarFilters({
    report,
    paginationModel,
    onPaginationModelChange,
    paymentMethods,
    receiptKinds,
    statuses,
    categoryIds,
    cashDeskIds,
    cashierIds,
    differenceOnly,
    onPaymentMethodsChange,
    onReceiptKindsChange,
    onStatusesChange,
    onCategoryIdsChange,
    onCashDeskIdsChange,
    onCashierIdsChange,
    onDifferenceOnlyChange,
  });

  const { exportLoading, exportReport } = useReportExport({
    reportKey: tableReportKey,
    startDate,
    endDate,
    search,
    ordering,
    paymentMethod: paymentMethods[0],
    receiptStatus,
    receiptKind: receiptKinds[0] as 'plain' | 'fiscal' | undefined,
    categoryId: categoryIds[0],
    cashDeskId: cashDeskIds[0],
    cashierId: cashierIds[0],
    shiftStatus: statuses[0],
    differenceOnly: differenceOnly.includes('difference-only'),
  });

  const handleRefresh = () => {
    void activeTableQuery.refetch();
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
        searchPlaceholder={presentation.searchPlaceholder}
        filters={toolbarFilters}
        onRefresh={handleRefresh}
        refreshLoading={activeTableQuery.isFetching}
        onExport={() => void exportReport()}
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
            columns={presentation.columns}
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
            getRowId={presentation.getRowId}
            autoRowHeight={report.key === 'shifts'}
            toolbar={
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 2.5, py: 2 }}>
                <DataGridColumnsDialogButton
                  columns={presentation.columns as GridColDef[]}
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
            emptyState={presentation.emptyState}
          />
        )}
      </Box>
    </>
  );
}
