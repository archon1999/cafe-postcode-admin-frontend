import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper, canAccessMyRestaurant } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { RouterLink } from 'shared/ui/RouterLink';

import { useGetRestaurantByIdQuery, useGetRestaurantFeatureConfigQuery } from '../../../application';
import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';

const MyRestaurantGeneralPage = () => {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const restaurantId = profile?.restaurantId ?? null;
  const canManageMyRestaurant = canAccessMyRestaurant(profile);

  const restaurantQuery = useGetRestaurantByIdQuery(restaurantId ?? '', {
    enabled: Boolean(restaurantId && canManageMyRestaurant),
  });
  const featureConfigQuery = useGetRestaurantFeatureConfigQuery(restaurantId ?? '', {
    enabled: Boolean(restaurantId && canManageMyRestaurant),
  });

  useEffect(() => {
    if (profile && (!canManageMyRestaurant || !restaurantId)) {
      replace(RoutePath.main);
    }
  }, [canManageMyRestaurant, profile, replace, restaurantId]);

  const enabledModules = useMemo(
    () => featureConfigQuery.data?.enabledModules ?? [],
    [featureConfigQuery.data?.enabledModules],
  );
  const enabledRoles = useMemo(
    () => featureConfigQuery.data?.enabledRoles ?? [],
    [featureConfigQuery.data?.enabledRoles],
  );
  const enabledRoleDetails = useMemo(
    () => featureConfigQuery.data?.enabledRoleDetails ?? [],
    [featureConfigQuery.data?.enabledRoleDetails],
  );

  if (profile && (!canManageMyRestaurant || !restaurantId)) {
    return null;
  }

  if (!restaurantId || restaurantQuery.isLoading || featureConfigQuery.isLoading) {
    return <LoadingScreen />;
  }

  const restaurant = restaurantQuery.data;
  const featureConfig = featureConfigQuery.data;

  return (
    <MyRestaurantSectionLayout heading={t('pages.myRestaurant.title', { defaultValue: 'Mening restoranim' })}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '1.1fr 1fr' }, gap: 3 }}>
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
              <Stack spacing={0.5} sx={{ gridColumn: { md: '1 / -1' } }}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.address')}
                </Typography>
                <Typography variant="body2">{restaurant.address || t('labels.notSelected')}</Typography>
              </Stack>
            </Box>

            <Box>
              <Button
                component={RouterLink}
                href={RouterPathHelper.organizationRestaurantEdit(restaurant.id)}
                variant="contained"
                color="black"
                startIcon={<Iconify icon="solar:pen-bold" />}>
                {t('actions.editRestaurantProfile', { defaultValue: 'Restoran profilini tahrirlash' })}
              </Button>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack spacing={0.75}>
              <Typography variant="h6">
                {t('pages.restaurantFeatureConfig.title', { defaultValue: 'POS konfiguratsiyasi' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('pages.restaurantFeatureConfig.description', {
                  defaultValue: 'Ruxsat etilgan modullar, rollar va POS ishlash rejimi shu yerda boshqariladi.',
                })}
              </Typography>
            </Stack>

            {featureConfig ? (
              <Stack spacing={2.5}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 2.5,
                  }}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {t('fields.orderEntryMode')}
                    </Typography>
                    <Typography variant="body2">{t(`orderEntryModes.${featureConfig.orderEntryMode}`)}</Typography>
                  </Stack>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      {t('fields.kitchenMode')}
                    </Typography>
                    <Typography variant="body2">{t(`kitchenModes.${featureConfig.kitchenMode}`)}</Typography>
                  </Stack>
                </Box>

                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {t('fields.enabledModules')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {enabledModules.length ? (
                      enabledModules.map((moduleCode) => (
                        <Chip
                          key={moduleCode}
                          size="small"
                          variant="soft"
                          color="info"
                          label={t(`featureModules.${moduleCode}`, { defaultValue: moduleCode })}
                        />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('labels.notSelected')}
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary">
                    {t('fields.enabledRoles')}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {enabledRoles.length ? (
                      (enabledRoleDetails.length ? enabledRoleDetails : enabledRoles.map((roleCode) => ({ id: roleCode, name: roleCode }))).map((role) => (
                        <Chip key={role.id} size="small" variant="outlined" label={role.name} />
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('labels.notSelected')}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Stack>
            ) : (
              <Alert severity="info">
                {t('helpers.featureConfigMissing', {
                  defaultValue: 'Restoran uchun POS konfiguratsiyasi hali yaratilmagan yoki yuklanmagan.',
                })}
              </Alert>
            )}

            <Box>
              <Button
                component={RouterLink}
                href={RouterPathHelper.organizationRestaurantFeatureConfig(restaurant.id)}
                variant="outlined"
                startIcon={<Iconify icon="solar:settings-bold" />}>
                {t('actions.manageFeatureConfig', { defaultValue: 'POS konfiguratsiyasi' })}
              </Button>
            </Box>
          </Stack>
        </Card>
      </Box>
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantGeneralPage;
