import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import type { AdminReportSummary } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { formatMoney } from 'shared/utils/format-money';

type ReportSummaryCardsProps = {
  data?: AdminReportSummary;
  loading?: boolean;
};

type SummaryMetricKey =
  | 'grossSalesTotal'
  | 'refundsTotal'
  | 'salesTotal'
  | 'ordersCount'
  | 'averageCheck'
  | 'openChecks'
  | 'activeTables';
type SummaryItem = {
  key: SummaryMetricKey;
  labelKey: string;
  icon: string;
  isMoney?: boolean;
};

const SUMMARY_ITEMS: SummaryItem[] = [
  {
    key: 'grossSalesTotal',
    labelKey: 'reports.summary.metrics.grossSalesTotal',
    icon: 'solar:wallet-money-bold-duotone',
    isMoney: true,
  },
  {
    key: 'refundsTotal',
    labelKey: 'reports.summary.metrics.refundsTotal',
    icon: 'solar:undo-left-round-bold-duotone',
    isMoney: true,
  },
  {
    key: 'salesTotal',
    labelKey: 'reports.summary.metrics.salesTotal',
    icon: 'solar:chart-2-bold-duotone',
    isMoney: true,
  },
  { key: 'ordersCount', labelKey: 'reports.summary.metrics.ordersCount', icon: 'solar:bill-list-bold-duotone' },
  {
    key: 'averageCheck',
    labelKey: 'reports.summary.metrics.averageCheck',
    icon: 'solar:chart-2-bold-duotone',
    isMoney: true,
  },
  { key: 'openChecks', labelKey: 'reports.summary.metrics.openChecks', icon: 'solar:document-text-bold-duotone' },
  { key: 'activeTables', labelKey: 'reports.summary.metrics.activeTables', icon: 'solar:plate-bold-duotone' },
] as const;

function getSummaryMetricValue(data: AdminReportSummary | undefined, key: SummaryMetricKey) {
  if (!data) {
    return 0;
  }

  if (key === 'grossSalesTotal' && (data.grossSalesTotal === null || data.grossSalesTotal === undefined)) {
    return Number(data.salesTotal ?? 0) + Number(data.refundsTotal ?? 0);
  }

  return Number(data[key] ?? 0);
}

export function ReportSummaryCards({ data, loading = false }: ReportSummaryCardsProps) {
  const { t } = useTranslate('reports');

  return (
    <Grid container spacing={2.5}>
      {SUMMARY_ITEMS.map((item) => (
        <Grid key={item.key} size={{ xs: 12, sm: 6, xl: 4 }}>
          <Card sx={{ p: 2.5, borderRadius: 3, height: '100%', boxShadow: (theme) => theme.customShadows.z8 }}>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
              <Stack spacing={1}>
                <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1 }}>
                  {t(item.labelKey)}
                </Typography>
                {loading ? (
                  <Skeleton variant="text" width={140} height={42} />
                ) : (
                  <Typography variant="h3">
                    {item.isMoney
                      ? formatMoney(getSummaryMetricValue(data, item.key))
                      : String(getSummaryMetricValue(data, item.key))}
                  </Typography>
                )}
              </Stack>

              <Stack
                alignItems="center"
                justifyContent="center"
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                }}>
                <Iconify icon={item.icon} width={24} />
              </Stack>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
