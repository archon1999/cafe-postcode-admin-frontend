import { zodResolver } from '@hookform/resolvers/zod';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useGetRolesQuery } from 'modules/user-management/roles/application';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { FormActions } from 'shared/ui/FormActions';
import { Form } from 'shared/ui/HookForm';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useGetRestaurantFeatureConfigQuery, useUpsertRestaurantFeatureConfigMutation } from '../../../application';
import {
  ORGANIZATION_FEATURE_KITCHEN_MODE_VALUES,
  ORGANIZATION_FEATURE_ORDER_ENTRY_MODE_VALUES,
  ORGANIZATION_FEATURE_ROLE_VALUES,
} from '../../../domain';

import { FeatureConfigFormFields } from './FeatureConfigFormFields';

const schema = z.object({
  hallEnabled: z.boolean(),
  kitchenEnabled: z.boolean(),
  cashierEnabled: z.boolean(),
  ownerDashboardEnabled: z.boolean(),
  orderEntryMode: z.enum(ORGANIZATION_FEATURE_ORDER_ENTRY_MODE_VALUES),
  kitchenMode: z.enum(ORGANIZATION_FEATURE_KITCHEN_MODE_VALUES),
  enabledRoles: z.array(z.string()),
});

export type Values = z.infer<typeof schema>;

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
  const rolesQuery = useGetRolesQuery('user', { enabled: canAccessFeatureConfig });
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

  const availableRoleOptions = ORGANIZATION_FEATURE_ROLE_VALUES.filter((role) => {
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
    availableRoleOptions.includes(role as (typeof ORGANIZATION_FEATURE_ROLE_VALUES)[number]),
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
      />
      <Card sx={{ p: 3 }}>
        <Form methods={methods} onSubmit={onSubmit}>
          <Stack spacing={3}>
            <FeatureConfigFormFields
              availableRoleOptions={availableRoleOptions}
              cashierEnabled={cashierEnabled}
              enabledRolesHelperText={enabledRolesHelperText}
              hallEnabled={hallEnabled}
              kitchenEnabled={kitchenEnabled}
              kitchenModeHelperText={kitchenModeHelperText}
              kitchenModes={ORGANIZATION_FEATURE_KITCHEN_MODE_VALUES}
              orderEntryModeHelperText={orderEntryModeHelperText}
              orderEntryModes={ORGANIZATION_FEATURE_ORDER_ENTRY_MODE_VALUES}
              ownerDashboardEnabled={ownerDashboardEnabled}
              rolesByCode={rolesByCode}
              t={t}
            />

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
