import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';

import { useTranslate } from 'app/providers/locales';
import type { AdminReportSummary } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { SvgColor } from 'shared/ui/SvgColor';
import { formatMoneyNumber, getMoneySuffix } from 'shared/utils/format-money';

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
  | 'prechecksCount'
  | 'receiptsCount';
type SummaryItem = {
  key: SummaryMetricKey;
  labelKey: string;
  icon: string;
  isMoney?: boolean;
  color: 'primary' | 'success' | 'warning' | 'secondary' | 'info';
  featured?: boolean;
};

const SUMMARY_ITEMS: SummaryItem[] = [
  {
    key: 'grossSalesTotal',
    labelKey: 'reports.summary.metrics.grossSalesTotal',
    icon: 'solar:wallet-money-bold-duotone',
    color: 'primary',
    featured: true,
    isMoney: true,
  },
  {
    key: 'refundsTotal',
    labelKey: 'reports.summary.metrics.refundsTotal',
    icon: 'solar:undo-left-round-bold-duotone',
    color: 'warning',
    featured: true,
    isMoney: true,
  },
  {
    key: 'salesTotal',
    labelKey: 'reports.summary.metrics.salesTotal',
    icon: 'solar:chart-2-bold-duotone',
    color: 'success',
    featured: true,
    isMoney: true,
  },
  {
    key: 'ordersCount',
    labelKey: 'reports.summary.metrics.ordersCount',
    icon: 'solar:bill-list-bold-duotone',
    color: 'primary',
  },
  {
    key: 'averageCheck',
    labelKey: 'reports.summary.metrics.averageCheck',
    icon: 'solar:chart-2-bold-duotone',
    color: 'info',
    isMoney: true,
  },
  {
    key: 'prechecksCount',
    labelKey: 'reports.summary.metrics.prechecksCount',
    icon: 'solar:document-text-bold-duotone',
    color: 'secondary',
  },
  {
    key: 'receiptsCount',
    labelKey: 'reports.summary.metrics.receiptsCount',
    icon: 'solar:bill-check-bold-duotone',
    color: 'success',
  },
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

function MetricValue({ item, data, loading }: ReportSummaryCardsProps & { item: SummaryItem }) {
  if (loading) {
    return <Skeleton variant="text" width="75%" height={40} sx={{ maxWidth: 220 }} />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 0.75 }}>
      <Typography
        component="span"
        variant={item.featured ? 'h4' : 'h3'}
        sx={{ overflowWrap: 'anywhere', fontVariantNumeric: 'tabular-nums' }}>
        {formatMoneyNumber(getSummaryMetricValue(data, item.key))}
      </Typography>
      {item.isMoney && (
        <Typography component="span" variant="body2" sx={{ opacity: 0.72 }}>
          {getMoneySuffix()}
        </Typography>
      )}
    </Box>
  );
}

export function ReportSummaryCards({ data, loading = false }: ReportSummaryCardsProps) {
  const { t } = useTranslate('reports');

  return (
    <Grid container spacing={3}>
      {SUMMARY_ITEMS.map((item) => (
        <Grid key={item.key} size={item.featured ? { xs: 12, md: 4 } : { xs: 12, sm: 6, lg: 3 }}>
          {item.featured ? (
            <Card
              sx={(theme) => ({
                p: 3,
                height: '100%',
                boxShadow: 'none',
                position: 'relative',
                color: `${item.color}.darker`,
                backgroundColor: 'common.white',
                backgroundImage: `linear-gradient(135deg, ${varAlpha(theme.vars.palette[item.color].lighterChannel, 0.48)}, ${varAlpha(theme.vars.palette[item.color].lightChannel, 0.48)})`,
              })}>
              <Box sx={{ width: 48, height: 48, mb: 3 }}>
                <Iconify icon={item.icon} width={48} sx={{ color: `${item.color}.main` }} />
              </Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t(item.labelKey)}
              </Typography>
              <MetricValue item={item} data={data} loading={loading} />
              <SvgColor
                src="/assets/background/shape-square.svg"
                aria-hidden
                sx={{
                  top: 0,
                  left: -20,
                  width: 240,
                  zIndex: -1,
                  height: 240,
                  opacity: 0.24,
                  position: 'absolute',
                  color: `${item.color}.main`,
                }}
              />
            </Card>
          ) : (
            <Card sx={{ py: 3, pl: 3, pr: 2.5, height: '100%' }}>
              <Box sx={{ pr: 4 }}>
                <MetricValue item={item} data={data} loading={loading} />
              </Box>
              <Typography variant="subtitle2" component="div" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {t(item.labelKey)}
              </Typography>
              <Iconify
                icon={item.icon}
                width={36}
                sx={{ top: 24, right: 20, position: 'absolute', color: `${item.color}.main` }}
              />
              <Box
                aria-hidden
                sx={(theme) => ({
                  top: -44,
                  width: 160,
                  zIndex: -1,
                  height: 160,
                  right: -104,
                  opacity: 0.12,
                  borderRadius: 3,
                  position: 'absolute',
                  transform: 'rotate(40deg)',
                  background: `linear-gradient(to right, ${theme.vars.palette[item.color].main}, transparent)`,
                })}
              />
            </Card>
          )}
        </Grid>
      ))}
    </Grid>
  );
}
