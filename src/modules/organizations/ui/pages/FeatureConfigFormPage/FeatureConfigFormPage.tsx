import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useGetRolesQuery } from 'modules/users/application';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form, RHFMultiSelect, RHFSelect, RHFSwitch } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useGetRestaurantFeatureConfigQuery, useUpsertRestaurantFeatureConfigMutation } from '../../../application';
import { FEATURE_CONFIG_PRESETS } from '../../lib/feature-config-presets';
import { getFeatureKitchenModeTranslationKey, getFeatureOrderEntryModeTranslationKey } from '../../lib/presenters';

const schema = z.object({
  hallEnabled: z.boolean(),
  kitchenEnabled: z.boolean(),
  cashierEnabled: z.boolean(),
  ownerDashboardEnabled: z.boolean(),
  orderEntryMode: z.enum(['hall', 'cashier_builder']),
  kitchenMode: z.enum(['display', 'printer', 'both']),
  enabledRoles: z.array(z.string()),
});

type Values = z.infer<typeof schema>;

const ORDER_ENTRY_MODES = ['hall', 'cashier_builder'] as const;
const KITCHEN_MODES = ['display', 'printer', 'both'] as const;
const ROLE_OPTIONS = [
  'admin',
  'owner',
  'manager',
  'waiter',
  'cashier',
  'chef',
  'barman',
  'universal_operator',
] as const;

const DEFAULT_VALUES: Values = {
  hallEnabled: true,
  kitchenEnabled: true,
  cashierEnabled: true,
  ownerDashboardEnabled: true,
  orderEntryMode: 'hall',
  kitchenMode: 'display',
  enabledRoles: ['admin', 'owner', 'manager'],
};

function deriveEnabledModules(values: Values) {
  const modules: string[] = [];

  if (values.hallEnabled) modules.push('hall');
  if (values.kitchenEnabled) modules.push('kitchen');
  if (values.cashierEnabled) modules.push('cashier');
  if (values.ownerDashboardEnabled) modules.push('owner_dashboard');

  return modules;
}

const FeatureConfigFormPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const { restaurantId } = useParams() as { restaurantId?: string };
  const { push, replace } = useRouter();
  const canManageRestaurants = canAccessRestaurants(profile);
  const canManageMyRestaurant = canAccessMyRestaurant(profile) && profile?.restaurantId === restaurantId;
  const canAccessFeatureConfig = canManageRestaurants || canManageMyRestaurant;
  const backPath = canManageRestaurants ? RoutePath.organizationRestaurantList : RoutePath.organizationMyRestaurant;
  const query = useGetRestaurantFeatureConfigQuery(restaurantId ?? '', {
    enabled: Boolean(restaurantId) && canAccessFeatureConfig,
  });
  const rolesQuery = useGetRolesQuery({ enabled: canAccessFeatureConfig });
  const upsertMutation = useUpsertRestaurantFeatureConfigMutation(restaurantId ?? '');

  useRedirectOnNotFound(query.error, Boolean(restaurantId));

  useEffect(() => {
    if (profile && !canAccessFeatureConfig) {
      replace(RoutePath.main);
    }
  }, [canAccessFeatureConfig, profile, replace]);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_VALUES,
  });
  const hallEnabled = methods.watch('hallEnabled');
  const kitchenEnabled = methods.watch('kitchenEnabled');
  const cashierEnabled = methods.watch('cashierEnabled');
  const ownerDashboardEnabled = methods.watch('ownerDashboardEnabled');
  const orderEntryMode = methods.watch('orderEntryMode');
  const kitchenMode = methods.watch('kitchenMode');
  const enabledRoles = methods.watch('enabledRoles');

  const availableRoleOptions = ROLE_OPTIONS.filter((role) => {
    if (role === 'waiter') {
      return hallEnabled;
    }

    if (role === 'cashier') {
      return cashierEnabled;
    }

    if (role === 'chef' || role === 'barman') {
      return kitchenEnabled;
    }

    return true;
  });

  const filteredRoles = enabledRoles.filter((role) =>
    availableRoleOptions.includes(role as (typeof ROLE_OPTIONS)[number]),
  );
  const rolesByCode = new Map((rolesQuery.data ?? []).map((role) => [role.code, role.name]));

  useEffect(() => {
    if (!query.data) {
      return;
    }

    methods.reset({
      hallEnabled: query.data.hallEnabled,
      kitchenEnabled: query.data.kitchenEnabled,
      cashierEnabled: query.data.cashierEnabled,
      ownerDashboardEnabled: query.data.ownerDashboardEnabled,
      orderEntryMode: query.data.orderEntryMode,
      kitchenMode: query.data.kitchenMode,
      enabledRoles: query.data.enabledRoles,
    });
  }, [methods, query.data]);

  useEffect(() => {
    if (!hallEnabled && orderEntryMode === 'hall') {
      methods.setValue('orderEntryMode', 'cashier_builder', { shouldDirty: true });
    }
  }, [hallEnabled, methods, orderEntryMode]);

  useEffect(() => {
    if (!cashierEnabled && orderEntryMode === 'cashier_builder') {
      methods.setValue('orderEntryMode', 'hall', { shouldDirty: true });
    }
  }, [cashierEnabled, methods, orderEntryMode]);

  useEffect(() => {
    if (!kitchenEnabled && kitchenMode !== 'display') {
      methods.setValue('kitchenMode', 'display', { shouldDirty: true });
    }
  }, [kitchenEnabled, kitchenMode, methods]);

  useEffect(() => {
    if (filteredRoles.length !== enabledRoles.length) {
      methods.setValue('enabledRoles', filteredRoles, { shouldDirty: true });
    }
  }, [enabledRoles, filteredRoles, methods]);

  const onSubmit = methods.handleSubmit(async (values) => {
    if (!restaurantId) {
      return;
    }

    await upsertMutation.mutateAsync({
      hallEnabled: values.hallEnabled,
      kitchenEnabled: values.kitchenEnabled,
      cashierEnabled: values.cashierEnabled,
      ownerDashboardEnabled: values.ownerDashboardEnabled,
      orderEntryMode: values.orderEntryMode,
      kitchenMode: values.kitchenMode,
      enabledModules: deriveEnabledModules(values),
      enabledRoles: values.enabledRoles,
    });

    push(backPath);
  });

  const applyPreset = (presetKey: (typeof FEATURE_CONFIG_PRESETS)[number]['key']) => {
    const preset = FEATURE_CONFIG_PRESETS.find((item) => item.key === presetKey);

    if (!preset) {
      return;
    }

    const presetValues = { ...preset.values };
    delete presetValues.enabledModules;

    methods.reset({
      ...methods.getValues(),
      ...presetValues,
    });
  };

  if (profile && !canAccessFeatureConfig) {
    return null;
  }

  if (!restaurantId || query.isLoading) {
    return <LoadingScreen />;
  }

  const restaurantName = query.data?.restaurantName ?? t('labels.notSelected', { defaultValue: 'Tanlanmagan' });
  const orderEntryModeHelperText = !hallEnabled
    ? t('helpers.orderEntryModeCashierOnly', {
        defaultValue: "Zallar o'chirilgan, shuning uchun buyurtma kassadan kiritiladi.",
      })
    : !cashierEnabled
      ? t('helpers.orderEntryModeHallOnly', {
          defaultValue: "Kassa o'chirilgan, shuning uchun buyurtma zal orqali kiritiladi.",
        })
      : undefined;
  const kitchenModeHelperText = !kitchenEnabled
    ? t('helpers.kitchenModeDisabled', {
        defaultValue: "Oshxona moduli yoqilganda oshxona rejimini tanlash mumkin bo'ladi.",
      })
    : undefined;
  const enabledRolesHelperText =
    !hallEnabled || !kitchenEnabled || !cashierEnabled
      ? t('helpers.enabledRolesFiltered', {
          defaultValue: "Yoqilmagan modullarga tegishli rollar ro'yxatdan avtomatik yashiriladi.",
        })
      : undefined;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('pages.restaurantFeatureConfig.title', { defaultValue: 'POS konfiguratsiyasi' })}
        links={[
          {
            name: canManageRestaurants ? t('pages.restaurants.title') : t('pages.myRestaurant.title'),
            href: backPath,
          },
          { name: restaurantName },
          { name: t('pages.restaurantFeatureConfig.title', { defaultValue: 'POS konfiguratsiyasi' }) },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <Stack spacing={1.5}>
              <Typography variant="h6">{t('presetSection.title', { defaultValue: 'Tayyor presetlar' })}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('presetSection.description', {
                  defaultValue: "Kerakli biznes turini tanlang, keyin xohlasangiz qo'lda sozlamalarni o'zgartiring.",
                })}
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                  gap: 2,
                }}>
                {FEATURE_CONFIG_PRESETS.map((preset) => (
                  <Card
                    key={preset.key}
                    variant="outlined"
                    sx={(theme) => ({
                      p: 2,
                      borderRadius: 2,
                      borderColor: theme.palette.divider,
                      backgroundColor: theme.palette.background.paper,
                    })}>
                    <Stack spacing={2} sx={{ height: '100%' }}>
                      <Stack spacing={0.75}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {t(`presets.${preset.key}.title`, {
                            defaultValue:
                              preset.key === 'full_service'
                                ? "To'liq restoran"
                                : preset.key === 'fast_food'
                                  ? 'Tezkor ovqatlanish'
                                  : 'Oshxonaga printer bilan',
                          })}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t(`presets.${preset.key}.description`, {
                            defaultValue:
                              preset.key === 'full_service'
                                ? 'Zal, oshxona va kassa bilan ishlaydigan oddiy restoranlar uchun.'
                                : preset.key === 'fast_food'
                                  ? 'Zalsiz, faqat menyu va kassada ishlaydigan nuqtalar uchun.'
                                  : 'Zal va kassa bor, buyurtma oshxonaga printer orqali ketadigan restoranlar uchun.',
                          })}
                        </Typography>
                      </Stack>

                      <Button
                        variant="outlined"
                        onClick={() => applyPreset(preset.key)}
                        sx={{ mt: 'auto', alignSelf: 'flex-start' }}>
                        {t('presetSection.apply', { defaultValue: "Presetni qo'llash" })}
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Box>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
              <RHFSelect<Values>
                name="orderEntryMode"
                label={t('fields.orderEntryMode')}
                helperText={orderEntryModeHelperText}>
                {ORDER_ENTRY_MODES.map((mode) => (
                  <MenuItem
                    key={mode}
                    value={mode}
                    disabled={(mode === 'hall' && !hallEnabled) || (mode === 'cashier_builder' && !cashierEnabled)}>
                    {t(getFeatureOrderEntryModeTranslationKey(mode))}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFSelect<Values>
                name="kitchenMode"
                label={t('fields.kitchenMode')}
                disabled={!kitchenEnabled}
                helperText={kitchenModeHelperText}>
                {KITCHEN_MODES.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {t(getFeatureKitchenModeTranslationKey(mode))}
                  </MenuItem>
                ))}
              </RHFSelect>
              <RHFMultiSelect<Values>
                name="enabledRoles"
                label={t('fields.enabledRoles')}
                chip
                checkbox
                helperText={enabledRolesHelperText}
                options={availableRoleOptions.map((role) => ({
                  value: role,
                  label: rolesByCode.get(role) ?? role,
                }))}
                sx={{ gridColumn: { lg: '1 / -1' } }}
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
              <RHFSwitch<Values>
                name="hallEnabled"
                label={t('fields.hallEnabled')}
                helperText={
                  !cashierEnabled
                    ? t('helpers.hallRequired', {
                        defaultValue: "Kassa o'chirilganida zallar moduli yoqilgan bo'lishi kerak.",
                      })
                    : undefined
                }
                slotProps={{ switch: { disabled: !cashierEnabled && hallEnabled } }}
              />
              <RHFSwitch<Values>
                name="kitchenEnabled"
                label={t('fields.kitchenEnabled')}
                helperText={
                  !kitchenEnabled
                    ? t('helpers.kitchenDisabled', {
                        defaultValue: "Oshxona o'chirilsa kitchen mode va oshpaz rollari avtomatik cheklanadi.",
                      })
                    : undefined
                }
              />
              <RHFSwitch<Values>
                name="cashierEnabled"
                label={t('fields.cashierEnabled')}
                helperText={
                  !hallEnabled
                    ? t('helpers.cashierRequired', {
                        defaultValue: "Zallar o'chirilganida kassa moduli yoqilgan bo'lishi kerak.",
                      })
                    : undefined
                }
                slotProps={{ switch: { disabled: !hallEnabled && cashierEnabled } }}
              />
              <RHFSwitch<Values>
                name="ownerDashboardEnabled"
                label={t('fields.ownerDashboardEnabled')}
                helperText={
                  ownerDashboardEnabled
                    ? t('helpers.ownerDashboardEnabled', {
                        defaultValue: 'Rahbar paneli owner uchun alohida loyiha sifatida keyin ulanadi.',
                      })
                    : undefined
                }
              />
            </Box>

            <FormActions
              isSubmitting={methods.formState.isSubmitting}
              submitLabel={t('actions.save')}
              onCancel={() => push(backPath)}
            />
          </Stack>
        </Form>
      </Card>
    </Content>
  );
};

export default FeatureConfigFormPage;
