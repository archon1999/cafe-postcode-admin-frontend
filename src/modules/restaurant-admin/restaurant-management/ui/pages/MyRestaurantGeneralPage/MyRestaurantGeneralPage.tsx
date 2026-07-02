import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState, type ChangeEvent } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant } from 'app/routes';
import { useAdminRestaurantScopeId, useCurrentUser } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatDate, formatDateTime } from 'shared/utils/format-time';

import { useGetMyRestaurantQuery, useUpdateMyRestaurantSettingsMutation } from '../../../application';
import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';

const MyRestaurantGeneralPage = () => {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const restaurantId = useAdminRestaurantScopeId();
  const canManageMyRestaurant = canAccessMyRestaurant(profile);
  const [isAuthCodeVisible, setIsAuthCodeVisible] = useState(false);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
  const [clearBackgroundImage, setClearBackgroundImage] = useState(false);
  const [serviceFeeEnabled, setServiceFeeEnabled] = useState(false);
  const [serviceFeePercent, setServiceFeePercent] = useState('0');

  const restaurantQuery = useGetMyRestaurantQuery({
    enabled: Boolean(restaurantId && canManageMyRestaurant),
  });
  const updateRestaurantSettingsMutation = useUpdateMyRestaurantSettingsMutation();
  const restaurant = restaurantQuery.data;
  const shouldRedirect = Boolean(profile) && (!canManageMyRestaurant || (!profile?.isSuperuser && !restaurantId));

  useEffect(() => {
    if (shouldRedirect) {
      replace(RoutePath.main);
    }
  }, [replace, shouldRedirect]);

  useEffect(() => {
    if (!restaurant) {
      return;
    }

    setServiceFeeEnabled(Boolean(restaurant.serviceFeeEnabled));
    setServiceFeePercent(String(restaurant.serviceFeePercent ?? 0));
  }, [restaurant]);

  if (shouldRedirect) {
    return null;
  }

  if (!restaurantId) {
    return (
      <MyRestaurantSectionLayout heading={t('pages.myRestaurant.title')}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={0.75}>
            <Typography variant="h6">{t('fields.restaurant')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('labels.notSelected')}
            </Typography>
          </Stack>
        </Card>
      </MyRestaurantSectionLayout>
    );
  }

  if (restaurantQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (!restaurant) {
    return <LoadingScreen />;
  }

  const serviceFeePercentValue = Number(serviceFeePercent);
  const isServiceFeePercentValid =
    serviceFeePercent.trim() !== '' &&
    Number.isFinite(serviceFeePercentValue) &&
    serviceFeePercentValue >= 0 &&
    serviceFeePercentValue <= 99;
  const currentServiceFeePercent = Number(restaurant.serviceFeePercent ?? 0);
  const hasPendingServiceFeeChange =
    serviceFeeEnabled !== Boolean(restaurant.serviceFeeEnabled) ||
    (isServiceFeePercentValid && serviceFeePercentValue !== currentServiceFeePercent);
  const visibleBackgroundUrl = clearBackgroundImage
    ? null
    : (backgroundPreviewUrl ?? restaurant.posAuthBackgroundImageUrl ?? null);
  const hasPendingBackgroundChange = Boolean(backgroundFile || clearBackgroundImage);
  const tariffName =
    restaurant.tariff?.name ??
    (restaurant.activationType === 'custom' ? tPlatform('labels.customActivation') : t('labels.notSelected'));
  const billingPeriodLabel =
    restaurant.billingPeriod === 'monthly'
      ? tPlatform('labels.monthly')
      : restaurant.billingPeriod === 'yearly'
        ? tPlatform('labels.yearly')
        : null;
  const durationText = billingPeriodLabel
    ? restaurant.expiresOn
      ? `${billingPeriodLabel} · ${formatDate(restaurant.expiresOn, 'DD.MM.YYYY')}`
      : billingPeriodLabel
    : t('labels.notSelected');

  const handleBackgroundFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';

    if (!file) {
      return;
    }

    if (backgroundPreviewUrl) {
      URL.revokeObjectURL(backgroundPreviewUrl);
    }

    setBackgroundFile(file);
    setBackgroundPreviewUrl(URL.createObjectURL(file));
    setClearBackgroundImage(false);
  };

  const handleBackgroundRemove = () => {
    if (backgroundPreviewUrl) {
      URL.revokeObjectURL(backgroundPreviewUrl);
    }

    setBackgroundFile(null);
    setBackgroundPreviewUrl(null);
    setClearBackgroundImage(true);
  };

  const handleBackgroundSave = async () => {
    if (!restaurant) {
      return;
    }

    await updateRestaurantSettingsMutation.mutateAsync({
      name: restaurant.name,
      legalName: restaurant.legalName,
      taxNumber: restaurant.taxNumber,
      phone: restaurant.phone,
      social: restaurant.social ?? '',
      address: restaurant.address,
      fakturaPayload: restaurant.fakturaPayload,
      posAuthBackgroundImage: backgroundFile,
      clearPosAuthBackgroundImage: backgroundFile ? false : clearBackgroundImage,
      serviceFeeEnabled: restaurant.serviceFeeEnabled,
      serviceFeePercent: restaurant.serviceFeePercent,
      vatEnabled: restaurant.vatEnabled,
      vatPercent: restaurant.vatPercent,
      markingCheckEnabled: Boolean(restaurant.markingCheckEnabled ?? false),
      isActive: restaurant.isActive,
    });

    if (backgroundPreviewUrl) {
      URL.revokeObjectURL(backgroundPreviewUrl);
    }
    setBackgroundFile(null);
    setBackgroundPreviewUrl(null);
    setClearBackgroundImage(false);
  };

  const handleServiceFeeSave = async () => {
    if (!restaurant || !isServiceFeePercentValid) {
      return;
    }

    await updateRestaurantSettingsMutation.mutateAsync({
      name: restaurant.name,
      legalName: restaurant.legalName,
      taxNumber: restaurant.taxNumber,
      phone: restaurant.phone,
      social: restaurant.social ?? '',
      address: restaurant.address,
      fakturaPayload: restaurant.fakturaPayload,
      clearPosAuthBackgroundImage: false,
      serviceFeeEnabled,
      serviceFeePercent: serviceFeePercentValue,
      vatEnabled: restaurant.vatEnabled,
      vatPercent: restaurant.vatPercent,
      markingCheckEnabled: Boolean(restaurant.markingCheckEnabled ?? false),
      isActive: restaurant.isActive,
    });
  };

  return (
    <MyRestaurantSectionLayout heading={t('pages.myRestaurant.title')}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 3 }}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack spacing={0.75}>
              <Typography variant="h6">{t('sections.myRestaurantProfile.title')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.myRestaurantProfile.description')}
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
                  {t('fields.social')}
                </Typography>
                <Typography variant="body2">{restaurant.social || t('labels.notSelected')}</Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {tPlatform('fields.activatedAt')}
                </Typography>
                <Typography variant="body2">
                  {restaurant.activatedAt
                    ? formatDateTime(restaurant.activatedAt, 'DD.MM.YYYY HH:mm')
                    : t('labels.notSelected')}
                </Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.tariff')}
                </Typography>
                <Typography variant="body2">{tariffName}</Typography>
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {tPlatform('fields.billingPeriod')}
                </Typography>
                <Typography variant="body2">{durationText}</Typography>
              </Stack>
              <Stack spacing={0.75}>
                <Typography variant="caption" color="text.secondary">
                  {t('fields.authCode')}
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
                    {isAuthCodeVisible ? t('actions.hideAuthCode') : t('actions.showAuthCode')}
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

        <Card sx={{ p: 3 }}>
          <Stack spacing={2.5}>
            <Stack spacing={0.75}>
              <Typography variant="h6">{t('fields.serviceFeePercent')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.fiscalProfileDescription')}
              </Typography>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) minmax(220px, 320px)' },
                gap: 2,
                alignItems: 'center',
              }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={serviceFeeEnabled}
                    onChange={(event) => setServiceFeeEnabled(event.target.checked)}
                    disabled={updateRestaurantSettingsMutation.isPending}
                  />
                }
                label={t('fields.serviceFeeEnabled')}
              />
              <TextField
                type="number"
                label={t('fields.serviceFeePercent')}
                value={serviceFeePercent}
                onChange={(event) => setServiceFeePercent(event.target.value)}
                error={!isServiceFeePercentValid}
                inputProps={{ min: 0, max: 99, step: 0.01 }}
                disabled={updateRestaurantSettingsMutation.isPending}
              />
            </Box>

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="contained"
                onClick={() => void handleServiceFeeSave()}
                disabled={!hasPendingServiceFeeChange || !isServiceFeePercentValid}
                loading={updateRestaurantSettingsMutation.isPending}>
                {t('actions.save')}
              </Button>
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack spacing={0.75}>
              <Typography variant="h6">{t('fields.posAuthBackgroundImage')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('labels.posAuthBackgroundImageHint')}
              </Typography>
            </Stack>

            {visibleBackgroundUrl ? (
              <Box
                component="img"
                src={visibleBackgroundUrl}
                alt={t('fields.posAuthBackgroundImage')}
                sx={{
                  width: '100%',
                  maxWidth: 520,
                  aspectRatio: '16 / 9',
                  objectFit: 'cover',
                  borderRadius: 1,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 520,
                  aspectRatio: '16 / 9',
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 1,
                  border: (theme) => `1px dashed ${theme.palette.divider}`,
                  color: 'text.secondary',
                }}>
                <Typography variant="body2">{t('labels.posAuthBackgroundImageFallback')}</Typography>
              </Box>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <Button variant="outlined" component="label" disabled={updateRestaurantSettingsMutation.isPending}>
                {visibleBackgroundUrl
                  ? t('actions.replacePosAuthBackgroundImage')
                  : t('actions.uploadPosAuthBackgroundImage')}
                <input hidden type="file" accept="image/*" onChange={handleBackgroundFileChange} />
              </Button>
              {visibleBackgroundUrl ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleBackgroundRemove}
                  disabled={updateRestaurantSettingsMutation.isPending}>
                  {t('actions.removePosAuthBackgroundImage')}
                </Button>
              ) : null}
              {hasPendingBackgroundChange ? (
                <Button
                  variant="contained"
                  onClick={() => void handleBackgroundSave()}
                  loading={updateRestaurantSettingsMutation.isPending}>
                  {t('actions.save')}
                </Button>
              ) : null}
            </Stack>
          </Stack>
        </Card>
      </Box>
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantGeneralPage;
