import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import { useState, type ReactNode } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import type { AdminSummaryReportQueryParams } from 'shared/api/admin-types';
import { downloadBlob } from 'shared/utils/download';

import { useGetReportSummaryQuery } from '../../application';
import { reportsRepository } from '../../data-access';
import type { ReportDefinition } from '../../domain';

import type { ReportsDatePreset, ReportsFixedDatePreset } from './reportsDateRange';
import { ReportsToolbar } from './ReportsToolbar';
import { ReportSummaryCards } from './ReportSummaryCards';

type ReportsSummarySectionProps = {
  navigation?: ReactNode;
  report: ReportDefinition;
  startDate: string;
  endDate: string;
  activePreset: ReportsDatePreset;
  onPresetChange: (value: ReportsFixedDatePreset) => void;
  onRangeChange: (startDate: string, endDate: string) => void;
};

export function ReportsSummarySection({
  navigation,
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
    } catch {
      toast.error(t('errors.exportFailed'));
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <>
      <Card sx={{ flexShrink: 0 }}>
        {navigation}
        <ReportsToolbar
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
      </Card>

      <Box sx={{ mt: 3 }}>
        {summaryQuery.isError ? (
          <Alert severity="error">{t('errors.loadFailed')}</Alert>
        ) : (
          <ReportSummaryCards data={summaryQuery.data} loading={summaryQuery.isLoading} />
        )}
      </Box>
    </>
  );
}
