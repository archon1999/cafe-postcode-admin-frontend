import { useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import useMediaQuery from '@mui/material/useMediaQuery';
import { varAlpha } from 'minimal-shared/utils';

import { useTranslate } from 'app/providers/locales';
import type { AdminReportKey } from 'shared/api/admin-types';

import type { ReportDefinition } from '../../domain';

type Props = {
  reports: ReportDefinition[];
  selectedKey: AdminReportKey;
  onSelect: (key: AdminReportKey) => void;
};

export function ReportsNavigation({ reports, selectedKey, onSelect }: Props) {
  const { t } = useTranslate('reports');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Tabs
      key={isMobile ? 'mobile' : 'desktop'}
      value={selectedKey}
      onChange={(_event, value: AdminReportKey) => onSelect(value)}
      variant="scrollable"
      scrollButtons={isMobile ? true : 'auto'}
      allowScrollButtonsMobile
      aria-label={t('workspace.listTitle')}
      sx={(theme) => ({
        flexShrink: 0,
        px: { md: 2.5 },
        boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
      })}>
      {reports.map((report) => (
        <Tab key={report.key} value={report.key} label={t(report.titleKey)} />
      ))}
    </Tabs>
  );
}
