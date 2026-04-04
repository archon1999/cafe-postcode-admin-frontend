import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant, RouterPathHelper } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { RouterLink } from 'shared/ui/RouterLink';

import { useGetMyRestaurantQuery } from '../../../application';
import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';

const MyRestaurantGeneralPage = () => {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const restaurantId = profile?.restaurantId ?? null;
  const canManageMyRestaurant = canAccessMyRestaurant(profile);
  const [isAuthCodeVisible, setIsAuthCodeVisible] = useState(false);

  const restaurantQuery = useGetMyRestaurantQuery({
    enabled: Boolean(restaurantId && canManageMyRestaurant),
  });

  useEffect(() => {
    if (profile && (!canManageMyRestaurant || !restaurantId)) {
      replace(RoutePath.main);
    }
  }, [canManageMyRestaurant, profile, replace, restaurantId]);

  if (profile && (!canManageMyRestaurant || !restaurantId)) {
    return null;
  }

  if (!restaurantId || restaurantQuery.isLoading) {
    return <LoadingScreen />;
  }

  const restaurant = restaurantQuery.data;

  return (
    <MyRestaurantSectionLayout heading={t('pages.myRestaurant.title', { defaultValue: 'Mening restoranim' })}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack spacing={0.75}>
              <Typography variant="h6">
                {t('sections.myRestaurantProfile.title', { defaultValue: 'Restoran profili' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.myRestaurantProfile.description', {
                  defaultValue: "Restoranning asosiy yuridik va aloqa ma'lumotlari shu yerda ko'rinadi.",
                })}
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2.5,
              }}>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.name')}
                </Typography>
                <Typography variant="subtitle2">{restaurant.name}</Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.status')}
                </Typography>
                <Chip
                  size="small"
                  color={restaurant.isActive ? 'success' : 'default'}
                  variant="soft"
                  label={restaurant.isActive ? tCommon('status.active') : tCommon('status.inactive')}
                  sx={{ alignSelf: 'flex-start' }}
                />
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.legalName')}
                </Typography>
                <Typography variant="body2">{restaurant.legalName || t('labels.notSelected')}</Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.taxNumber')}
                </Typography>
                <Typography variant="body2">{restaurant.taxNumber || t('labels.notSelected')}</Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.phone')}
                </Typography>
                <Typography variant="body2">{restaurant.phone || t('labels.notSelected')}</Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.currency')}
                </Typography>
                <Typography variant="body2">{restaurant.currency || 'UZS'}</Typography>
              </Stack>
              <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.authCode', { defaultValue: 'Aktivatsiya kodi' })}
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                  <Typography variant="body2" sx={{ letterSpacing: '0.18em', fontWeight: 700 }}>
                    {isAuthCodeVisible ? (restaurant.authCode ?? '------') : '***'}
                  </Typography>
                  <Button
                    size="small"
                    color="inherit"
                    startIcon={
                      <Iconify icon={isAuthCodeVisible ? 'solar:eye-closed-bold' : 'solar:eye-bold'} width={18} />
                    }
                    onClick={() => setIsAuthCodeVisible((prev) => !prev)}>
                    {isAuthCodeVisible
                      ? t('actions.hideAuthCode', { defaultValue: 'Yashirish' })
                      : t('actions.showAuthCode', { defaultValue: "Ko'rsatish" })}
                  </Button>
                </Stack>
              </Stack>
              <Stack spacing={0.5} sx={{ gridColumn: { md: '1 / -1' } }}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.address')}
                </Typography>
                <Typography variant="body2">{restaurant.address || t('labels.notSelected')}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Card>
      </Box>
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantGeneralPage;
