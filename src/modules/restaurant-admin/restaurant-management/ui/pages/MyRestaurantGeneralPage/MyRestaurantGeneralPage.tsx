import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant } from 'app/routes';
import { useAdminRestaurantScopeId, useCurrentUser } from 'modules/auth';
import {
  restaurantFormDefaultValues,
  restaurantFormSchema,
  restaurantFormValuesToPayload,
  restaurantToFormValues,
  type RestaurantFormValues,
} from 'modules/business-partner/restaurants/ui/pages/RestaurantFormPage/restaurant-form';
import { RestaurantFormFields } from 'modules/business-partner/restaurants/ui/pages/RestaurantFormPage/RestaurantFormFields';
import { useRouter } from 'shared/hooks/router';
import { Form } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatDate, formatDateTime } from 'shared/utils/format-time';

import { useGetMyRestaurantQuery, useUpdateMyRestaurantSettingsMutation } from '../../../application';
import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';
import { MyRestaurantSettingsTabs } from '../../components/MyRestaurantSettingsTabs';

const MyRestaurantGeneralPage = () => {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const restaurantId = useAdminRestaurantScopeId();
  const canManageMyRestaurant = canAccessMyRestaurant(profile);
  const [isAuthCodeVisible, setIsAuthCodeVisible] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const methods = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: restaurantFormDefaultValues,
  });

  const restaurantQuery = useGetMyRestaurantQuery({ enabled: Boolean(restaurantId && canManageMyRestaurant) });
  const updateMutation = useUpdateMyRestaurantSettingsMutation();
  const restaurant = restaurantQuery.data;
  const shouldRedirect = Boolean(profile) && (!canManageMyRestaurant || (!profile?.isSuperuser && !restaurantId));

  useEffect(() => {
    if (shouldRedirect) replace(RoutePath.main);
  }, [replace, shouldRedirect]);

  if (shouldRedirect) return null;
  if (!restaurantId) {
    return (
      <MyRestaurantSectionLayout heading={t('pages.myRestaurant.title')}>
        <MyRestaurantSettingsTabs />
        <Card sx={{ p: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {t('labels.notSelected')}
          </Typography>
        </Card>
      </MyRestaurantSectionLayout>
    );
  }
  if (restaurantQuery.isLoading || !restaurant) return <LoadingScreen />;

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

  const openEditor = () => {
    methods.reset(restaurantToFormValues(restaurant));
    setEditOpen(true);
  };

  const saveProfile = methods.handleSubmit(async (values) => {
    try {
      await updateMutation.mutateAsync(restaurantFormValuesToPayload(values, { isEditMode: true }));
      setEditOpen(false);
      toast.success(t('messages.profileUpdated'));
    } catch {
      toast.error(t('messages.profileUpdateFailed'));
    }
  });

  const details = [
    [t('fields.name'), restaurant.name],
    [t('fields.legalName'), restaurant.legalName || t('labels.notSelected')],
    [t('fields.taxNumber'), restaurant.taxNumber || t('labels.notSelected')],
    [t('fields.phone'), restaurant.phone || t('labels.notSelected')],
    [t('fields.social'), restaurant.social || t('labels.notSelected')],
    [
      tPlatform('fields.activatedAt'),
      restaurant.activatedAt ? formatDateTime(restaurant.activatedAt, 'DD.MM.YYYY HH:mm') : t('labels.notSelected'),
    ],
    [t('fields.tariff'), tariffName],
    [tPlatform('fields.billingPeriod'), durationText],
  ];

  return (
    <MyRestaurantSectionLayout heading={t('pages.myRestaurant.title')}>
      <MyRestaurantSettingsTabs />
      <Card sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{t('sections.myRestaurantProfile.title')}</Typography>
            <IconButton aria-label={t('actions.edit')} onClick={openEditor}>
              <Iconify icon="solar:pen-bold-duotone" />
            </IconButton>
          </Stack>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
            {details.map(([label, value]) => (
              <Stack key={label} spacing={0.5}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2">{value}</Typography>
              </Stack>
            ))}
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
            <Stack spacing={0.75}>
              <Typography variant="caption" color="text.secondary">
                {t('fields.authCode')}
              </Typography>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="body2" sx={{ letterSpacing: '0.18em', fontWeight: 700 }}>
                  {isAuthCodeVisible ? (restaurant.authCode ?? '------') : '***'}
                </Typography>
                <Button size="small" color="inherit" onClick={() => setIsAuthCodeVisible((value) => !value)}>
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

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{t('dialogs.profileEdit.title')}</DialogTitle>
        <Form methods={methods} onSubmit={saveProfile}>
          <DialogContent>
            <Stack sx={{ pt: 1 }}>
              <RestaurantFormFields
                isEditMode
                disableLegalIdentity
                hideStatus
                isLookupPending={false}
                isSubmitting={methods.formState.isSubmitting}
                onLookup={() => undefined}
                t={t}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={() => setEditOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" variant="contained" loading={updateMutation.isPending}>
              {t('actions.save')}
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantGeneralPage;
