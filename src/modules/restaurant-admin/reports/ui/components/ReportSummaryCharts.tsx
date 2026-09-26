import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import type { AdminReportSummary } from 'shared/api/admin-types';
import { Chart, useChart } from 'shared/ui/Chart';
import { formatMoneyNumber, getMoneySuffix } from 'shared/utils/format-money';

type Props = { data?: AdminReportSummary; loading?: boolean };

const PAYMENT_COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#A78BFA', '#94A3B8'];

function ChartContent({ loading, empty, children }: { loading?: boolean; empty: boolean; children: React.ReactNode }) {
  const { t } = useTranslate('reports');

  if (loading) return <Skeleton variant="rounded" height={260} sx={{ mx: 3, mb: 3 }} />;
  if (empty) {
    return (
      <Box sx={{ minHeight: 260, display: 'grid', placeItems: 'center', px: 3, pb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          {t('charts.noData')}
        </Typography>
      </Box>
    );
  }
  return <>{children}</>;
}

function SalesTrendCard({ data, loading }: Props) {
  const { t, currentLang } = useTranslate('reports');
  const theme = useTheme();
  const points = data?.salesTrend ?? [];
  const locale = currentLang.numberFormat.code;
  const granularity = data?.salesTrendGranularity ?? 'day';
  const labels = points.map(({ date }) =>
    granularity === 'month' ? `${date.slice(5, 7)}.${date.slice(2, 4)}` : `${date.slice(8, 10)}.${date.slice(5, 7)}`,
  );
  const options = useChart({
    colors: [theme.palette.primary.main, theme.palette.warning.main],
    dataLabels: { enabled: false },
    stroke: { width: [3, 2], curve: 'smooth' },
    fill: { type: 'gradient', gradient: { opacityFrom: 0.26, opacityTo: 0.02 } },
    legend: { show: false },
    grid: { borderColor: theme.vars.palette.divider, padding: { left: 8, right: 18 } },
    xaxis: { categories: labels, tickAmount: Math.min(points.length, 7), labels: { hideOverlappingLabels: true } },
    yaxis: {
      labels: {
        formatter: (value: number) =>
          new Intl.NumberFormat(locale, { notation: 'compact', maximumFractionDigits: 1 }).format(value),
      },
    },
    tooltip: {
      y: { formatter: (value: number) => `${formatMoneyNumber(value)} ${getMoneySuffix()}` },
    },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={t('charts.salesTrend')} sx={{ pb: 0 }} />
      <ChartContent loading={loading} empty={!points.some((point) => point.grossSalesTotal || point.refundsTotal)}>
        <Stack direction="row" spacing={2.5} useFlexGap flexWrap="wrap" sx={{ px: 3, pt: 2 }}>
          {[
            { label: t('reports.summary.metrics.salesTotal'), color: theme.palette.primary.main },
            { label: t('reports.summary.metrics.refundsTotal'), color: theme.palette.warning.main },
          ].map((item) => (
            <Stack key={item.label} direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: item.color }} />
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
        <Chart
          type="area"
          series={[
            { name: t('reports.summary.metrics.salesTotal'), data: points.map((point) => point.salesTotal) },
            { name: t('reports.summary.metrics.refundsTotal'), data: points.map((point) => point.refundsTotal) },
          ]}
          options={options}
          sx={{ height: 300, px: { xs: 1, sm: 2 }, pt: 2, pb: 2 }}
        />
      </ChartContent>
    </Card>
  );
}

function PaymentMixCard({ data, loading }: Props) {
  const { t } = useTranslate('reports');
  const theme = useTheme();
  const rows = (data?.paymentBreakdown ?? []).filter((row) => row.total > 0);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const labels = rows.map((row) => {
    const method = row.method;
    return ['cash', 'card', 'qr', 'mixed'].includes(method) ? t(`paymentMethods.${method}`) : method;
  });
  const options = useChart({
    labels,
    colors: PAYMENT_COLORS,
    chart: { sparkline: { enabled: true } },
    stroke: { width: 3, colors: [theme.palette.background.paper] },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: { pie: { donut: { size: '72%', labels: { show: false } } } },
    tooltip: { y: { formatter: (value: number) => `${formatMoneyNumber(value)} ${getMoneySuffix()}` } },
  });

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={t('charts.paymentMix')} sx={{ pb: 0 }} />
      <ChartContent loading={loading} empty={total === 0}>
        <Chart
          type="donut"
          series={rows.map((row) => row.total)}
          options={options}
          sx={{ height: 210, mx: 'auto', mt: 2, maxWidth: 280 }}
        />
        <Stack spacing={1.4} sx={{ px: 3, pb: 3, pt: 1 }}>
          {rows.map((row, index) => (
            <Stack key={row.method} direction="row" alignItems="center" spacing={1.25}>
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  flexShrink: 0,
                  borderRadius: '50%',
                  bgcolor: PAYMENT_COLORS[index % PAYMENT_COLORS.length],
                }}
              />
              <Typography variant="body2" sx={{ flex: 1 }}>
                {labels[index]}
              </Typography>
              <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                {Math.round((row.total / total) * 100)}%
              </Typography>
            </Stack>
          ))}
        </Stack>
      </ChartContent>
    </Card>
  );
}

function TopItemsCard({ data, loading }: Props) {
  const { t } = useTranslate('reports');
  const rows = data?.topItems ?? [];
  const highest = Math.max(...rows.map((row) => row.revenue), 0);

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={t('charts.topItems')} sx={{ pb: 1 }} />
      <ChartContent loading={loading} empty={highest === 0}>
        <Stack spacing={2.4} sx={{ px: 3, pb: 3, pt: 1 }}>
          {rows.map((row, index) => (
            <Box key={`${row.name}-${index}`}>
              <Stack direction="row" alignItems="baseline" spacing={2} sx={{ mb: 0.75 }}>
                <Typography variant="body2" noWrap sx={{ flex: 1 }}>
                  <Box component="span" sx={{ color: 'text.disabled', mr: 1.5, fontVariantNumeric: 'tabular-nums' }}>
                    {String(index + 1).padStart(2, '0')}
                  </Box>
                  {row.name}
                </Typography>
                <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoneyNumber(row.revenue)}{' '}
                  <Box component="span" sx={{ color: 'text.secondary', fontWeight: 400 }}>
                    {getMoneySuffix()}
                  </Box>
                </Typography>
              </Stack>
              <Box sx={{ height: 7, bgcolor: 'action.hover', borderRadius: 1, overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${(row.revenue / highest) * 100}%`,
                    height: 1,
                    borderRadius: 1,
                    bgcolor: 'primary.main',
                  }}
                />
              </Box>
            </Box>
          ))}
        </Stack>
      </ChartContent>
    </Card>
  );
}

function ReceiptsCard({ data, loading }: Props) {
  const { t } = useTranslate('reports');
  const rows = [
    { label: t('reports.summary.metrics.prechecksCount'), value: data?.prechecksCount ?? 0, color: 'info.main' },
    { label: t('reports.summary.metrics.receiptsCount'), value: data?.receiptsCount ?? 0, color: 'success.main' },
  ];
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={t('charts.receipts')} sx={{ pb: 0 }} />
      <ChartContent loading={loading} empty={total === 0}>
        <Stack spacing={3.5} sx={{ px: 3, pt: 5, pb: 3 }}>
          {rows.map((row) => (
            <Box key={row.label}>
              <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: 1 }}>
                <Typography variant="body2">{row.label}</Typography>
                <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatMoneyNumber(row.value)}
                </Typography>
              </Stack>
              <Box sx={{ height: 9, borderRadius: 1, bgcolor: 'action.hover', overflow: 'hidden' }}>
                <Box sx={{ width: `${(row.value / total) * 100}%`, height: 1, borderRadius: 1, bgcolor: row.color }} />
              </Box>
            </Box>
          ))}
        </Stack>
      </ChartContent>
    </Card>
  );
}

export function ReportSummaryCharts({ data, loading }: Props) {
  return (
    <Grid container spacing={3} sx={{ mt: 3 }}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <SalesTrendCard data={data} loading={loading} />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <PaymentMixCard data={data} loading={loading} />
      </Grid>
      <Grid size={{ xs: 12, lg: 8 }}>
        <TopItemsCard data={data} loading={loading} />
      </Grid>
      <Grid size={{ xs: 12, lg: 4 }}>
        <ReceiptsCard data={data} loading={loading} />
      </Grid>
    </Grid>
  );
}
