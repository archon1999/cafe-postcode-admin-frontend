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
import type { AdminRestaurantActivationPayload, AdminTariff } from 'shared/api/admin-types';
import { Form, RHFDatePicker, RHFMultiSelect, RHFSelect, RHFSumCurrencyField, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { getAdminPermissionLabel } from 'shared/utils/admin-permission';
import { toTashkentCalendarDayjs } from 'shared/utils/dayjs';

import { useGetPermissionsQuery, useGetRolesQuery } from 'modules/users/application';

const activationSchema = z
  .object({
    tariffId: z.string().optional(),
    customTariff: z.boolean().default(false),
    monthlyPrice: z.union([z.number(), z.literal('')]).optional(),
    yearlyPrice: z.union([z.number(), z.literal('')]).optional(),
    startsOn: z.string().min(1),
    permissionIds: z.array(z.string()).default([]),
    allowedRoleIds: z.array(z.string()).default([]),
    operationalSettingsText: z.string().default(''),
  })
  .superRefine((values, ctx) => {
    if (!values.customTariff && !values.tariffId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['tariffId'],
        message: 'Tarif tanlang.',
      });
    }
  });

type ActivationValues = z.infer<typeof activationSchema>;

const defaultValues: ActivationValues = {
  tariffId: '',
  customTariff: false,
  monthlyPrice: '',
  yearlyPrice: '',
  startsOn: toTashkentCalendarDayjs().format('YYYY-MM-DD'),
  permissionIds: [],
  allowedRoleIds: [],
  operationalSettingsText: '',
};

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
  const permissionsQuery = useGetPermissionsQuery({ enabled: open });
  const rolesQuery = useGetRolesQuery({ enabled: open });

  const methods = useForm<ActivationValues>({
    resolver: zodResolver(activationSchema),
    defaultValues,
  });

  const customTariff = methods.watch('customTariff');

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

  const permissionOptions = useMemo(
    () =>
      (permissionsQuery.data ?? []).map((permission) => ({
        value: permission.id,
        label: getAdminPermissionLabel(permission, t),
      })),
    [permissionsQuery.data, t],
  );

  const roleOptions = useMemo(
    () =>
      (rolesQuery.data ?? [])
        .filter((role) => role.isSystem)
        .map((role) => ({
          value: role.id,
          label: role.name,
        })),
    [rolesQuery.data, t],
  );

  const handleSubmit = methods.handleSubmit(async (values) => {
    let operationalSettings: Record<string, unknown> | undefined;

    if (values.operationalSettingsText.trim()) {
      try {
        operationalSettings = JSON.parse(values.operationalSettingsText) as Record<string, unknown>;
      } catch {
        methods.setError('operationalSettingsText', {
          type: 'validate',
          message: t('validation.invalidJson'),
        });
        return;
      }
    }

    await onSubmit({
      tariffId: values.customTariff ? null : values.tariffId || null,
      customTariff: values.customTariff,
      monthlyPrice: values.customTariff && values.monthlyPrice !== '' ? values.monthlyPrice : null,
      yearlyPrice: values.customTariff && values.yearlyPrice !== '' ? values.yearlyPrice : null,
      startsOn: values.startsOn,
      permissionIds: values.customTariff ? values.permissionIds : undefined,
      allowedRoleIds: values.customTariff ? values.allowedRoleIds : undefined,
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
                <RHFMultiSelect<ActivationValues>
                  name="permissionIds"
                  label={t('fields.permissions')}
                  options={permissionOptions}
                  checkbox
                  chip
                  placeholder={t('labels.notSelected')}
                />
                <RHFMultiSelect<ActivationValues>
                  name="allowedRoleIds"
                  label={t('fields.allowedRoles')}
                  options={roleOptions}
                  checkbox
                  chip
                  placeholder={t('labels.notSelected')}
                />
                <RHFTextField<ActivationValues>
                  name="operationalSettingsText"
                  label={t('fields.operationalSettings')}
                  multiline
                  rows={6}
                  placeholder='{"cashier": true}'
                />
              </Stack>
            )}

            <RHFDatePicker<ActivationValues>
              name="startsOn"
              label={t('fields.startsOn')}
              outputFormat="YYYY-MM-DD"
              maxDate={toTashkentCalendarDayjs()}
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
