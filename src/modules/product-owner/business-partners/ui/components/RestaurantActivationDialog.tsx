import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import type {
  AdminPermission,
  AdminRestaurantActivationPayload,
  AdminRole,
  AdminTariffOption,
} from 'shared/api/admin-types';
import { Form, RHFDatePicker, RHFMultiSelect, RHFRadioGroup, RHFSelect } from 'shared/ui/HookForm';
import { getCurrentTashkentTime } from 'shared/utils/dayjs';
import { formatMoney } from 'shared/utils/format-money';

const activationSchema = z
  .object({
    activationType: z.enum(['tariff', 'custom']).default('tariff'),
    tariffId: z.string().default(''),
    allowedRoleIds: z.array(z.string()).default([]),
    permissionIds: z.array(z.string()).default([]),
    startsOn: z.string().min(1),
  })
  .superRefine((values, ctx) => {
    if (values.activationType === 'tariff') {
      if (!values.tariffId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['tariffId'],
          message: 'Tarif tanlang.',
        });
      }
      return;
    }

    if (!values.allowedRoleIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['allowedRoleIds'],
        message: 'Kamida bitta rol tanlang.',
      });
    }

    if (!values.permissionIds.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['permissionIds'],
        message: 'Kamida bitta ruxsat tanlang.',
      });
    }
  });

type ActivationFormValues = z.input<typeof activationSchema>;
type ActivationValues = z.output<typeof activationSchema>;

const defaultValues: ActivationFormValues = {
  activationType: 'tariff',
  tariffId: '',
  allowedRoleIds: [],
  permissionIds: [],
  startsOn: getCurrentTashkentTime().format('YYYY-MM-DD'),
};

type RestaurantActivationDialogProps = {
  open: boolean;
  tariffs: AdminTariffOption[];
  roles: AdminRole[];
  permissions: AdminPermission[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminRestaurantActivationPayload) => Promise<void>;
};

const PLATFORM_ROLE_CODES = new Set(['product_owner', 'business_partner']);

function uniqueIds(values: string[]) {
  return [...new Set(values)];
}

export function RestaurantActivationDialog({
  open,
  tariffs,
  roles,
  permissions,
  isSubmitting,
  onClose,
  onSubmit,
}: RestaurantActivationDialogProps) {
  const { t } = useTranslate('platform');

  const methods = useForm<ActivationFormValues, unknown, ActivationValues>({
    resolver: zodResolver(activationSchema),
    defaultValues,
  });
  const previousDerivedPermissionIdsRef = useRef<string[]>([]);

  const activationType = methods.watch('activationType');
  const selectedTariffId = methods.watch('tariffId');
  const selectedRoleIds = methods.watch('allowedRoleIds');
  const selectedPermissionIds = methods.watch('permissionIds');

  const selectedTariff = useMemo(
    () => tariffs.find((tariff) => tariff.id === selectedTariffId) ?? null,
    [selectedTariffId, tariffs],
  );
  const filteredRoles = useMemo(
    () => roles.filter((role) => role.isSystem && role.code && !PLATFORM_ROLE_CODES.has(role.code)),
    [roles],
  );
  const derivedPermissionIds = useMemo(() => {
    const permissionIds = new Set<string>();

    for (const role of filteredRoles) {
      if (!selectedRoleIds.includes(role.id)) {
        continue;
      }

      for (const permission of role.permissions) {
        permissionIds.add(permission.id);
      }
    }

    return [...permissionIds];
  }, [filteredRoles, selectedRoleIds]);
  const selectedCustomRoleNames = useMemo(
    () => filteredRoles.filter((role) => selectedRoleIds.includes(role.id)).map((role) => role.name),
    [filteredRoles, selectedRoleIds],
  );

  useEffect(() => {
    if (!open) {
      methods.reset(defaultValues);
    }
  }, [methods, open]);

  useEffect(() => {
    if (activationType !== 'custom') {
      previousDerivedPermissionIdsRef.current = [];
      return;
    }

    const previousDerivedPermissionIds = previousDerivedPermissionIdsRef.current;
    const newlyDerivedPermissionIds = derivedPermissionIds.filter(
      (permissionId) => !previousDerivedPermissionIds.includes(permissionId),
    );

    previousDerivedPermissionIdsRef.current = derivedPermissionIds;

    if (!newlyDerivedPermissionIds.length) {
      return;
    }

    const currentPermissionIds = methods.getValues('permissionIds');
    methods.setValue('permissionIds', uniqueIds([...currentPermissionIds, ...newlyDerivedPermissionIds]), {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [activationType, derivedPermissionIds, methods]);

  const handleSubmit = methods.handleSubmit(async (values: ActivationValues) => {
    if (values.activationType === 'custom') {
      await onSubmit({
        activationType: 'custom',
        allowedRoleIds: values.allowedRoleIds,
        permissionIds: uniqueIds(values.permissionIds),
        startsOn: values.startsOn,
      });
      return;
    }

    await onSubmit({
      activationType: 'tariff',
      tariffId: values.tariffId,
      startsOn: values.startsOn,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('dialogs.activateRestaurant.title')}</DialogTitle>
      <DialogContent>
        <Form methods={methods} onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFRadioGroup<ActivationValues>
              name="activationType"
              label={t('fields.customTariff')}
              row
              options={[
                { value: 'tariff', label: t('labels.existingTariff') },
                { value: 'custom', label: t('labels.customActivation') },
              ]}
            />

            {activationType === 'tariff' ? (
              <>
                <RHFSelect<ActivationValues> name="tariffId" label={t('fields.tariff')}>
                  <MenuItem value="">{t('labels.notSelected')}</MenuItem>
                  {tariffs.map((tariff) => (
                    <MenuItem key={tariff.id} value={tariff.id}>
                      {tariff.name}
                    </MenuItem>
                  ))}
                </RHFSelect>

                {selectedTariff ? (
                  <Alert severity="info" variant="outlined">
                    <Stack spacing={0.75}>
                      <Typography variant="subtitle2">{selectedTariff.name}</Typography>
                      {selectedTariff.description ? (
                        <Typography variant="body2">{selectedTariff.description}</Typography>
                      ) : null}
                      <Typography variant="body2">
                        {t('fields.monthlyPrice')}: {formatMoney(selectedTariff.monthlyPrice)}
                      </Typography>
                      <Typography variant="body2">
                        {t('fields.yearlyPrice')}: {formatMoney(selectedTariff.yearlyPrice)}
                      </Typography>
                      <Typography variant="body2">
                        {t('fields.allowedRoles')}: {selectedTariff.allowedRoles.map((role) => role.name).join(', ')}
                      </Typography>
                    </Stack>
                  </Alert>
                ) : null}
              </>
            ) : (
              <>
                <Alert severity="info" variant="outlined">
                  <Stack spacing={0.75}>
                    <Typography variant="subtitle2">{t('labels.customActivation')}</Typography>
                    <Typography variant="body2">{t('dialogs.activateRestaurant.customDescription')}</Typography>
                  </Stack>
                </Alert>

                <RHFMultiSelect<ActivationValues>
                  name="allowedRoleIds"
                  label={t('fields.allowedRoles')}
                  checkbox
                  chip
                  placeholder={t('labels.notSelected')}
                  options={filteredRoles.map((role) => ({ value: role.id, label: role.name }))}
                />

                <RHFMultiSelect<ActivationValues>
                  name="permissionIds"
                  label={t('fields.permissions')}
                  checkbox
                  chip
                  placeholder={t('labels.notSelected')}
                  options={permissions.map((permission) => ({
                    value: permission.id,
                    label: `${permission.name} (${permission.code})`,
                  }))}
                />

                <Divider />

                <Typography variant="body2" color="text.secondary">
                  {t('labels.selectedRolesCount', { count: selectedCustomRoleNames.length })}
                </Typography>
                {selectedCustomRoleNames.length ? (
                  <Typography variant="body2">{selectedCustomRoleNames.join(', ')}</Typography>
                ) : null}
                <Typography variant="body2" color="text.secondary">
                  {t('labels.selectedPermissionsCount', { count: selectedPermissionIds.length })}
                </Typography>
              </>
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
