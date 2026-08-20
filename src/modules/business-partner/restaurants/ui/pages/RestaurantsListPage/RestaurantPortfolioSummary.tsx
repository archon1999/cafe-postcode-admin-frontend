import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import type { AdminRestaurantPortfolioSummary } from 'shared/api/admin-types';
import { Iconify, type IconifyName } from 'shared/ui/Iconify';

type PortfolioMetricProps = {
  icon: IconifyName;
  label: string;
  value?: number | string;
  color: 'primary' | 'success' | 'info' | 'warning';
  loading: boolean;
};

function PortfolioMetric({ icon, label, value, color, loading }: PortfolioMetricProps) {
  return (
    <Card
      sx={(theme) => ({
        px: 1.25,
        py: 0.85,
        minWidth: 96,
        boxShadow: `0 1px 4px ${alpha(theme.palette.grey[500], 0.12)}`,
      })}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={(theme) => ({
            width: 30,
            height: 30,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 1,
            color: `${color}.main`,
            bgcolor: alpha(theme.palette[color].main, 0.12),
          })}>
          <Iconify icon={icon} width={17} />
        </Box>
        <Stack spacing={0}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
          {loading ? (
            <Skeleton width={34} height={22} />
          ) : (
            <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
              {value ?? 0}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

type RestaurantPortfolioSummaryProps = {
  data?: AdminRestaurantPortfolioSummary;
  loading: boolean;
};

export function RestaurantPortfolioSummary({ data, loading }: RestaurantPortfolioSummaryProps) {
  const { t } = useTranslate('organizations');

  return (
    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
      <PortfolioMetric
        icon="solar:home-angle-bold-duotone"
        label={t('portfolio.metrics.total')}
        value={data?.totalCount}
        color="primary"
        loading={loading}
      />
      <PortfolioMetric
        icon="solar:verified-check-bold"
        label={t('portfolio.metrics.active')}
        value={data?.activeCount}
        color="success"
        loading={loading}
      />
      <PortfolioMetric
        icon="solar:users-group-rounded-bold-duotone"
        label={t('portfolio.metrics.staff')}
        value={data?.activeUsersCount}
        color="info"
        loading={loading}
      />
      <PortfolioMetric
        icon="solar:monitor-bold"
        label={t('portfolio.metrics.devices')}
        value={`${data?.onlineDeviceCount ?? 0}/${data?.activeDeviceCount ?? 0}`}
        color="warning"
        loading={loading}
      />
    </Stack>
  );
}
