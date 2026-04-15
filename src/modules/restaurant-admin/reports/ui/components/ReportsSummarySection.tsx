import Box from '@mui/material/Box';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import type { AdminSummaryReportQueryParams } from 'shared/api/admin-types';
import { downloadBlob } from 'shared/utils/download';

import { useGetReportSummaryQuery } from '../../application';
import { reportsRepository } from '../../data-access';
import type { ReportDefinition } from '../../domain';

import type { ReportsDatePreset, ReportsFixedDatePreset } from './reportsDateRange';
import { ReportsHeaderCard } from './ReportsHeaderCard';
import { ReportSummaryCards } from './ReportSummaryCards';

type ReportsSummarySectionProps = {
  report: ReportDefinition;
  startDate: string;
  endDate: string;
  activePreset: ReportsDatePreset;
  onPresetChange: (value: ReportsFixedDatePreset) => void;
  onRangeChange: (startDate: string, endDate: string) => void;
};

export function ReportsSummarySection({
  report,
  startDate,
  endDate,
  activePreset,
  onPresetChange,
  onRangeChange,
}: ReportsSummarySectionProps) {
  const { t } = useTranslate('reports');
  const [exportLoading, setExportLoading] = useState(false);

  const periodParams: AdminSummaryReportQueryParams = {
    startDate,
    endDate,
  };

  const summaryQuery = useGetReportSummaryQuery(periodParams);

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
        activePreset={activePreset}
        startDate={startDate}
        endDate={endDate}
        onPresetChange={onPresetChange}
        onRangeChange={onRangeChange}
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
