import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { useTranslate } from 'app/providers/locales';
import type { AdminReportKey } from 'shared/api/admin-types';

import type { ReportDefinition } from '../../domain';

type ReportsMobileTabsProps = {
  reports: ReportDefinition[];
  selectedKey: AdminReportKey;
  onSelect: (reportKey: AdminReportKey) => void;
};

export function ReportsMobileTabs({ reports, selectedKey, onSelect }: ReportsMobileTabsProps) {
  const { t } = useTranslate('reports');

  return (
    <Card sx={{ mb: 3, borderRadius: 3 }}>
      <Tabs
        value={selectedKey}
        onChange={(_event, value: AdminReportKey) => onSelect(value)}
        variant="scrollable"
        allowScrollButtonsMobile>
        {reports.map((report) => (
          <Tab key={report.key} value={report.key} label={t(report.titleKey)} />
        ))}
      </Tabs>
    </Card>
  );
}
