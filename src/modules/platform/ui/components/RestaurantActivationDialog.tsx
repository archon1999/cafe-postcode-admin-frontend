import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import {
  getFeatureKitchenModeTranslationKey,
  getFeatureOrderEntryModeTranslationKey,
} from 'modules/organizations/ui/lib/presenters';
import { useGetRolesQuery } from 'modules/users/application';
import type { AdminRestaurantActivationPayload, AdminTariff } from 'shared/api/admin-types';
import { Form, RHFDatePicker, RHFMultiSelect, RHFSelect, RHFSumCurrencyField, RHFSwitch } from 'shared/ui/HookForm';
import { getCurrentTashkentTime } from 'shared/utils/dayjs';

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

const activationSchema = z
  .object({
    tariffId: z.string().optional(),
    customTariff: z.boolean().default(false),
    monthlyPrice: z.union([z.number(), z.literal('')]).optional(),
    yearlyPrice: z.union([z.number(), z.literal('')]).optional(),
    startsOn: z.string().min(1),
    hallEnabled: z.boolean().default(true),
    kitchenEnabled: z.boolean().default(true),
    cashierEnabled: z.boolean().default(true),
    ownerDashboardEnabled: z.boolean().default(true),
    orderEntryMode: z.enum(['hall', 'cashier_builder']).default('hall'),
    kitchenMode: z.enum(['display', 'printer', 'both']).default('display'),
    enabledRoles: z.array(z.string()).default(['owner', 'admin', 'manager']),
  })
  .superRefine((values, ctx) => {
    if (!values.customTariff && !values.tariffId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tariffId'],
        message: 'Tarif tanlang.',
      });
    }

    if (values.customTariff && !values.enabledRoles.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['enabledRoles'],
        message: 'Kamida bitta rol tanlang.',
      });
    }
  });

type ActivationValues = z.infer<typeof activationSchema>;

const defaultValues: ActivationValues = {
  tariffId: '',
  customTariff: false,
  monthlyPrice: '',
  yearlyPrice: '',
  startsOn: getCurrentTashkentTime().format('YYYY-MM-DD'),
  hallEnabled: true,
  kitchenEnabled: true,
  cashierEnabled: true,
  ownerDashboardEnabled: true,
  orderEntryMode: 'hall',
  kitchenMode: 'display',
  enabledRoles: ['owner', 'admin', 'manager'],
};

function deriveEnabledModules(
  values: Pick<ActivationValues, 'hallEnabled' | 'kitchenEnabled' | 'cashierEnabled' | 'ownerDashboardEnabled'>,
) {
  const modules: string[] = [];

  if (values.hallEnabled) modules.push('hall');
  if (values.kitchenEnabled) modules.push('kitchen');
  if (values.cashierEnabled) modules.push('cashier');
  if (values.ownerDashboardEnabled) modules.push('owner_dashboard');

  return modules;
}

type RestaurantActivationDialogProps = {
  open: boolean;
  tariffs: AdminTariff[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminRestaurantActivationPayload) => Promise<void>;
};

export function RestaurantActivationDialog({
  open,
  tariffs,
  isSubmitting,
  onClose,
  onSubmit,
}: RestaurantActivationDialogProps) {
  const { t } = useTranslate('platform');
  const { t: tOrganizations } = useTranslate('organizations');
  const rolesQuery = useGetRolesQuery({ enabled: open });

  const methods = useForm<ActivationValues>({
    resolver: zodResolver(activationSchema),
    defaultValues,
  });

  const customTariff = methods.watch('customTariff');
  const hallEnabled = methods.watch('hallEnabled');
  const kitchenEnabled = methods.watch('kitchenEnabled');
  const cashierEnabled = methods.watch('cashierEnabled');
  const orderEntryMode = methods.watch('orderEntryMode');
  const kitchenMode = methods.watch('kitchenMode');
  const enabledRoles = methods.watch('enabledRoles');

  useEffect(() => {
    if (!open) {
      methods.reset(defaultValues);
    }
  }, [methods, open]);

  const tariffOptions = useMemo(
    () =>
      tariffs
        .filter((tariff) => tariff.isActive)
        .map((tariff) => ({
          value: tariff.id,
          label: tariff.name,
        })),
    [tariffs],
  );

  const roleByCode = useMemo(
    () => new Map((rolesQuery.data ?? []).filter((role) => role.isSystem).map((role) => [role.code, role])),
    [rolesQuery.data],
  );
  const availableRoleOptions = useMemo(
    () =>
      ROLE_OPTIONS.filter((role) => {
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
      }),
    [cashierEnabled, hallEnabled, kitchenEnabled],
  );
  const filteredRoles = useMemo(
    () => enabledRoles.filter((role) => availableRoleOptions.includes(role as (typeof ROLE_OPTIONS)[number])),
    [availableRoleOptions, enabledRoles],
  );
  const enabledRoleOptions = useMemo(
    () =>
      availableRoleOptions.map((roleCode) => ({
        value: roleCode,
        label: roleByCode.get(roleCode)?.name ?? roleCode,
      })),
    [availableRoleOptions, roleByCode],
  );

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

  const handleSubmit = methods.handleSubmit(async (values) => {
    const selectedRoles = values.enabledRoles
      .map((roleCode) => roleByCode.get(roleCode))
      .filter((role): role is NonNullable<typeof role> => Boolean(role));
    const permissionIds = [
      ...new Set(selectedRoles.flatMap((role) => role.permissions.map((permission) => permission.id))),
    ];
    const allowedRoleIds = selectedRoles.map((role) => role.id);
    const operationalSettings = values.customTariff
      ? {
          hall_enabled: values.hallEnabled,
          kitchen_enabled: values.kitchenEnabled,
          cashier_enabled: values.cashierEnabled,
          owner_dashboard_enabled: values.ownerDashboardEnabled,
          order_entry_mode: values.orderEntryMode,
          kitchen_mode: values.kitchenMode,
          enabled_modules: deriveEnabledModules(values),
          enabled_roles: values.enabledRoles,
        }
      : undefined;

    await onSubmit({
      tariffId: values.customTariff ? null : values.tariffId || null,
      customTariff: values.customTariff,
      monthlyPrice: values.customTariff && values.monthlyPrice !== '' ? values.monthlyPrice : null,
      yearlyPrice: values.customTariff && values.yearlyPrice !== '' ? values.yearlyPrice : null,
      startsOn: values.startsOn,
      permissionIds: values.customTariff ? permissionIds : undefined,
      allowedRoleIds: values.customTariff ? allowedRoleIds : undefined,
      operationalSettings,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{t('dialogs.activateRestaurant.title')}</DialogTitle>
      <DialogContent>
        <Form methods={methods} onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFSwitch<ActivationValues> name="customTariff" label={t('fields.customTariff')} />

            {!customTariff ? (
              <RHFSelect<ActivationValues> name="tariffId" label={t('fields.tariff')}>
                <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                {tariffOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </RHFSelect>
            ) : (
              <Stack spacing={3}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <RHFSumCurrencyField<ActivationValues> name="monthlyPrice" label={t('fields.monthlyPrice')} />
                  <RHFSumCurrencyField<ActivationValues> name="yearlyPrice" label={t('fields.yearlyPrice')} />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                  <RHFSelect<ActivationValues>
                    name="orderEntryMode"
                    label={tOrganizations('fields.orderEntryMode')}
                    helperText={
                      !hallEnabled
                        ? tOrganizations('helpers.orderEntryModeCashierOnly', {
                            defaultValue: "Zallar o'chirilgan, shuning uchun buyurtma kassadan kiritiladi.",
                          })
                        : !cashierEnabled
                          ? tOrganizations('helpers.orderEntryModeHallOnly', {
                              defaultValue: "Kassa o'chirilgan, shuning uchun buyurtma zal orqali kiritiladi.",
                            })
                          : undefined
                    }>
                    {ORDER_ENTRY_MODES.map((mode) => (
                      <MenuItem
                        key={mode}
                        value={mode}
                        disabled={(mode === 'hall' && !hallEnabled) || (mode === 'cashier_builder' && !cashierEnabled)}>
                        {tOrganizations(getFeatureOrderEntryModeTranslationKey(mode))}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  <RHFSelect<ActivationValues>
                    name="kitchenMode"
                    label={tOrganizations('fields.kitchenMode')}
                    disabled={!kitchenEnabled}
                    helperText={
                      !kitchenEnabled
                        ? tOrganizations('helpers.kitchenModeDisabled', {
                            defaultValue: "Oshxona moduli yoqilganda oshxona rejimini tanlash mumkin bo'ladi.",
                          })
                        : undefined
                    }>
                    {KITCHEN_MODES.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {tOrganizations(getFeatureKitchenModeTranslationKey(mode))}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Stack>
                <RHFMultiSelect<ActivationValues>
                  name="enabledRoles"
                  label={tOrganizations('fields.enabledRoles')}
                  options={enabledRoleOptions}
                  checkbox
                  chip
                  placeholder={t('labels.notSelected')}
                  helperText={
                    !hallEnabled || !kitchenEnabled || !cashierEnabled
                      ? tOrganizations('helpers.enabledRolesFiltered', {
                          defaultValue: "Yoqilmagan modullarga tegishli rollar ro'yxatdan avtomatik yashiriladi.",
                        })
                      : undefined
                  }
                />
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <RHFSwitch<ActivationValues>
                    name="hallEnabled"
                    label={tOrganizations('fields.hallEnabled')}
                    helperText={
                      !cashierEnabled
                        ? tOrganizations('helpers.hallRequired', {
                            defaultValue: "Kassa o'chirilganida zallar moduli yoqilgan bo'lishi kerak.",
                          })
                        : undefined
                    }
                    slotProps={{ switch: { disabled: !cashierEnabled && hallEnabled } }}
                  />
                  <RHFSwitch<ActivationValues>
                    name="cashierEnabled"
                    label={tOrganizations('fields.cashierEnabled')}
                    helperText={
                      !hallEnabled
                        ? tOrganizations('helpers.cashierRequired', {
                            defaultValue: "Zallar o'chirilganida kassa moduli yoqilgan bo'lishi kerak.",
                          })
                        : undefined
                    }
                    slotProps={{ switch: { disabled: !hallEnabled && cashierEnabled } }}
                  />
                </Stack>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <RHFSwitch<ActivationValues>
                    name="kitchenEnabled"
                    label={tOrganizations('fields.kitchenEnabled')}
                    helperText={
                      !kitchenEnabled
                        ? tOrganizations('helpers.kitchenDisabled', {
                            defaultValue: "Oshxona o'chirilsa kitchen mode va oshpaz rollari avtomatik cheklanadi.",
                          })
                        : undefined
                    }
                  />
                  <RHFSwitch<ActivationValues>
                    name="ownerDashboardEnabled"
                    label={tOrganizations('fields.ownerDashboardEnabled')}
                  />
                </Stack>
              </Stack>
            )}

            <RHFDatePicker<ActivationValues>
              name="startsOn"
              label={t('fields.startsOn')}
              outputFormat="YYYY-MM-DD"
              maxDate={getCurrentTashkentTime()}
            />

            <DialogActions sx={{ px: 0 }}>
              <Button onClick={onClose} disabled={isSubmitting} color="inherit" variant="outlined">
                {t('actions.cancel')}
              </Button>
              <Button loading={isSubmitting} variant="contained" color="black" type="submit">
                {t('actions.activate')}
              </Button>
            </DialogActions>
          </Stack>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
