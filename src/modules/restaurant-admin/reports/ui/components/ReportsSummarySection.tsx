import Box from '@mui/material/Box';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import type { AdminReportPeriodType, AdminSummaryReportQueryParams } from 'shared/api/admin-types';
import { downloadBlob } from 'shared/utils/download';
import { formatDateTime } from 'shared/utils/format-time';

import { useGetReportSummaryQuery } from '../../application';
import { reportsRepository } from '../../data-access';
import type { ReportDefinition } from '../../domain';

import { ReportsHeaderCard } from './ReportsHeaderCard';
import { ReportSummaryCards } from './ReportSummaryCards';

type ReportsSummarySectionProps = {
  report: ReportDefinition;
  periodType: AdminReportPeriodType;
  selectedDate: string;
  selectedMonth: string;
  selectedYear: string;
  onPeriodTypeChange: (value: AdminReportPeriodType) => void;
  onDateChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
};

export function ReportsSummarySection({
  report,
  periodType,
  selectedDate,
  selectedMonth,
  selectedYear,
  onPeriodTypeChange,
  onDateChange,
  onMonthChange,
  onYearChange,
}: ReportsSummarySectionProps) {
  const { t } = useTranslate('reports');
  const [exportLoading, setExportLoading] = useState(false);

  const periodParams: AdminSummaryReportQueryParams = {
    periodType,
    date: periodType === 'day' ? selectedDate : undefined,
    month: periodType === 'month' ? selectedMonth : undefined,
    year: periodType === 'year' ? selectedYear : undefined,
  };

  const summaryQuery = useGetReportSummaryQuery(periodParams);

  const lastUpdatedLabel = summaryQuery.dataUpdatedAt
    ? t('workspace.lastUpdated', { value: formatDateTime(summaryQuery.dataUpdatedAt, 'DD.MM.YYYY HH:mm') })
    : t('workspace.awaitingData');

  const handleRefresh = () => {
    void summaryQuery.refetch();
  };

  const handleExport = async () => {
    setExportLoading(true);

    try {
      const result = await reportsRepository.exportSummary(periodParams);
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
        onRefresh={handleRefresh}
        refreshLoading={summaryQuery.isFetching}
        onExport={handleExport}
        exportLoading={exportLoading}
      />

      <Box sx={{ mt: 3 }}>
        <ReportSummaryCards data={summaryQuery.data} loading={summaryQuery.isLoading} />
      </Box>
    </>
  );
}
