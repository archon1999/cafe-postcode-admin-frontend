import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminRestaurantDetail } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { formatDateTime } from 'shared/utils/format-time';

import { getRestaurantLifecycleStatus } from '../../shared/restaurant-helpers';

export type RestaurantDetailTab = 'overview' | 'people' | 'branches' | 'settings';

type Props = {
  restaurant: AdminRestaurantDetail;
  selectedTab: RestaurantDetailTab;
  onTabChange: (tab: RestaurantDetailTab) => void;
};

export function RestaurantDetailHero({ restaurant, selectedTab, onTabChange }: Props) {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const lifecycleStatus = getRestaurantLifecycleStatus(restaurant);
  const statusColor =
    lifecycleStatus === 'active' ? 'success' : lifecycleStatus === 'attention' ? 'warning' : 'default';
  const tariffName =
    restaurant.tariff?.name ??
    (restaurant.activationType === 'custom' ? tPlatform('labels.customActivation') : t('labels.notSelected'));
  const coverUrl = restaurant.posAuthBackgroundImageUrl || '/assets/images/mock/cover/cover-15.webp';
  const nameParts = restaurant.name.match(/[\p{L}\p{N}]+/gu) ?? [];
  const monogram = (
    nameParts.length > 1 ? `${nameParts[0]?.[0] ?? ''}${nameParts[1]?.[0] ?? ''}` : nameParts[0]?.slice(0, 2) || 'R'
  ).toLocaleUpperCase();
  const metaChipSx = {
    color: 'common.white',
    bgcolor: 'rgba(255, 255, 255, 0.18)',
    '& .MuiChip-icon': { color: 'common.white' },
  };
  const tabs: { value: RestaurantDetailTab; label: string; icon: string }[] = [
    { value: 'overview', label: t('restaurantDetail.tabs.overview'), icon: 'solar:shop-2-bold' },
    { value: 'people', label: t('restaurantDetail.tabs.people'), icon: 'solar:users-group-rounded-bold' },
    ...(!restaurant.parentId
      ? [{ value: 'branches' as const, label: t('restaurantDetail.tabs.branches'), icon: 'solar:buildings-2-bold' }]
      : []),
    { value: 'settings', label: t('restaurantDetail.tabs.settings'), icon: 'solar:settings-bold' },
  ];

  return (
    <Card sx={{ height: { md: 290 }, position: 'relative', overflow: 'hidden' }}>
      <Box
        sx={(theme) => ({
          minHeight: { xs: 286, md: 234 },
          height: { md: 234 },
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          pt: { xs: 8, md: 0 },
          pb: { xs: 2.25, md: 0 },
          color: 'common.white',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundImage: `linear-gradient(0deg, ${alpha(theme.palette.primary.dark, 0.82)}, ${alpha(theme.palette.primary.dark, 0.32)}), url("${coverUrl}")`,
        })}>
        <Chip
          size="small"
          color={statusColor}
          variant="filled"
          label={t(`portfolio.lifecycle.${lifecycleStatus}`)}
          sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}
        />
        <Box
          sx={{
            position: { xs: 'relative', md: 'absolute' },
            left: { md: 24 },
            bottom: { md: 24 },
            right: { md: 20 },
            px: { xs: 2.5, md: 0 },
            width: { xs: 1, md: 'auto' },
            display: 'flex',
            alignItems: 'center',
            gap: { xs: 2, md: 3 },
          }}>
          <Avatar
            variant="rounded"
            aria-label={restaurant.name}
            sx={{
              width: { xs: 68, md: 112 },
              height: { xs: 68, md: 112 },
              bgcolor: 'common.white',
              p: { xs: 0.5, md: 0.75 },
              border: 'solid 3px white',
              boxShadow: '0 12px 32px rgba(7, 27, 63, 0.28)',
              flexShrink: 0,
            }}>
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={{ xs: 0.25, md: 0.75 }}
              sx={{
                width: 1,
                height: 1,
                borderRadius: 1.25,
                background: 'linear-gradient(145deg, #164A93 0%, #071B3F 100%)',
              }}>
              <Typography
                component="span"
                sx={{
                  color: 'common.white',
                  fontSize: { xs: 22, md: 36 },
                  fontWeight: 800,
                  lineHeight: 1,
                  letterSpacing: -1,
                }}>
                {monogram}
              </Typography>
              <Box sx={{ width: { xs: 14, md: 24 }, height: 2, borderRadius: 1, bgcolor: '#92BEFF' }} />
            </Stack>
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontSize: { xs: 22, md: 30 }, overflowWrap: 'anywhere' }}>
              {restaurant.name}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.72, mt: 0.5 }}>
              {restaurant.parentId ? t('portfolio.branchTypes.branch') : t('restaurantDetail.pageTitle')}
              {restaurant.parentId && restaurant.parentName ? (
                <>
                  {' '}
                  ·{' '}
                  <Box
                    component={RouterLink}
                    href={RouterPathHelper.organizationRestaurantDetail(restaurant.parentId)}
                    sx={{ color: 'inherit', textDecorationColor: 'inherit' }}>
                    {restaurant.parentName}
                  </Box>
                </>
              ) : null}
            </Typography>
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
              <Chip
                size="small"
                icon={<Iconify icon="solar:tag-price-bold-duotone" />}
                label={tariffName}
                sx={metaChipSx}
              />
              {restaurant.phone && (
                <Chip
                  size="small"
                  icon={<Iconify icon="solar:phone-bold-duotone" />}
                  label={restaurant.phone}
                  sx={metaChipSx}
                />
              )}
              {restaurant.activatedAt && (
                <Chip
                  size="small"
                  icon={<Iconify icon="solar:calendar-bold-duotone" />}
                  label={
                    <>
                      <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                        {t('restaurantDetail.activatedAt', { date: formatDateTime(restaurant.activatedAt) })}
                      </Box>
                      <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                        {formatDateTime(restaurant.activatedAt)}
                      </Box>
                    </>
                  }
                  title={t('restaurantDetail.activatedAt', { date: formatDateTime(restaurant.activatedAt) })}
                  sx={metaChipSx}
                />
              )}
            </Stack>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          height: 56,
          px: { md: 3 },
          display: 'flex',
          bgcolor: 'background.paper',
          justifyContent: { xs: 'center', md: 'flex-end' },
        }}>
        <Tabs
          value={selectedTab}
          onChange={(_event, value: RestaurantDetailTab) => onTabChange(value)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label={t('restaurantDetail.pageTitle')}>
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              icon={<Iconify icon={tab.icon} width={20} />}
              iconPosition="start"
              sx={{ minHeight: 56 }}
            />
          ))}
        </Tabs>
      </Box>
    </Card>
  );
}
