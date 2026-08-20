import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminRestaurantDetail } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { formatDateTime } from 'shared/utils/format-time';

import { getRestaurantLifecycleStatus } from '../../shared/restaurant-helpers';

export function RestaurantDetailHero({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const lifecycleStatus = getRestaurantLifecycleStatus(restaurant);
  const statusColor =
    lifecycleStatus === 'active' ? 'success' : lifecycleStatus === 'attention' ? 'warning' : 'default';
  const tariffName =
    restaurant.tariff?.name ??
    (restaurant.activationType === 'custom' ? tPlatform('labels.customActivation') : t('labels.notSelected'));
  const readiness = restaurant.setupReadiness;

  return (
    <Card
      sx={(theme) => ({
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, md: 3 },
        border: `1px solid ${alpha(theme.palette.primary.main, 0.14)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.default, 0.02)} 58%)`,
      })}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(260px, 0.34fr)' },
          gap: { xs: 2.5, lg: 4 },
          alignItems: 'center',
        }}>
        <Stack spacing={1.25} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
            <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
              {restaurant.name}
            </Typography>
            <Chip size="small" variant="soft" color={statusColor} label={t(`portfolio.lifecycle.${lifecycleStatus}`)} />
            {restaurant.parentId ? (
              <Chip size="small" variant="outlined" label={t('portfolio.branchTypes.branch')} />
            ) : null}
          </Stack>

          {restaurant.parentId && restaurant.parentName ? (
            <Typography variant="body2" color="text.secondary">
              {t('restaurantDetail.parent')}{' '}
              <Typography
                component={RouterLink}
                href={RouterPathHelper.organizationRestaurantDetail(restaurant.parentId)}
                variant="subtitle2"
                color="text.primary"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                {restaurant.parentName}
              </Typography>
            </Typography>
          ) : null}

          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            <Chip size="small" icon={<Iconify icon="solar:tag-price-bold-duotone" />} label={tariffName} />
            {restaurant.phone ? (
              <Chip size="small" icon={<Iconify icon="solar:phone-bold-duotone" />} label={restaurant.phone} />
            ) : null}
            {restaurant.activatedAt ? (
              <Chip
                size="small"
                icon={<Iconify icon="solar:calendar-bold-duotone" />}
                label={t('restaurantDetail.activatedAt', { date: formatDateTime(restaurant.activatedAt) })}
              />
            ) : null}
          </Stack>
        </Stack>

        <Stack
          spacing={1.25}
          sx={(theme) => ({
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.grey[500], 0.08),
          })}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle2">{t('restaurantDetail.readiness.title')}</Typography>
            <Typography variant="h5" color={readiness.ready ? 'success.main' : 'warning.main'}>
              {readiness.progressPercent}%
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={readiness.progressPercent}
            color={readiness.ready ? 'success' : 'warning'}
            sx={{ height: 8, borderRadius: 1 }}
          />
          <Typography variant="caption" color="text.secondary">
            {readiness.ready
              ? t('restaurantDetail.readiness.readyHint')
              : t('restaurantDetail.readiness.blockingHint', { count: readiness.blockingIssueCount })}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}
