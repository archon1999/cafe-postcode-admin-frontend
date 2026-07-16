import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import type {
  AdminPermission,
  AdminRestaurantActivationPayload,
  AdminRole,
  AdminTariffOption,
} from 'shared/api/admin-types';
import { Form } from 'shared/ui/HookForm';

import { RestaurantActivationFields } from './RestaurantActivationFields';
import {
  type ActivationFormValues,
  type ActivationValues,
  PLATFORM_ROLE_CODES,
  activationDefaultValues,
  activationSchema,
  uniqueIds,
} from './restaurantActivationForm';

type RestaurantActivationDialogProps = {
  open: boolean;
  tariffs: AdminTariffOption[];
  roles: AdminRole[];
  permissions: AdminPermission[];
  customTariffAllowed: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminRestaurantActivationPayload) => Promise<void>;
};

export function RestaurantActivationDialog({
  open,
  tariffs,
  roles,
  permissions,
  customTariffAllowed,
  isSubmitting,
  onClose,
  onSubmit,
}: RestaurantActivationDialogProps) {
  const { t } = useTranslate('platform');

  const methods = useForm<ActivationFormValues, unknown, ActivationValues>({
    resolver: zodResolver(activationSchema),
    defaultValues: activationDefaultValues,
  });
  const previousDerivedPermissionIdsRef = useRef<string[]>([]);

  const activationType = methods.watch('activationType');
  const selectedTariffId = methods.watch('tariffId');
  const watchedRoleIds = methods.watch('allowedRoleIds');
  const watchedPermissionIds = methods.watch('permissionIds');
  const selectedRoleIds = useMemo(() => watchedRoleIds ?? [], [watchedRoleIds]);
  const selectedPermissionIds = useMemo(() => watchedPermissionIds ?? [], [watchedPermissionIds]);

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
      methods.reset(activationDefaultValues);
    }
  }, [methods, open]);

  useEffect(() => {
    if (!customTariffAllowed && activationType === 'custom') {
      methods.setValue('activationType', 'tariff', { shouldDirty: true, shouldValidate: true });
    }
  }, [activationType, customTariffAllowed, methods]);

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

    const currentPermissionIds = activationSchema.shape.permissionIds.parse(methods.getValues('permissionIds'));
    methods.setValue('permissionIds', uniqueIds([...currentPermissionIds, ...newlyDerivedPermissionIds]), {
      shouldDirty: true,
      shouldValidate: false,
    });
  }, [activationType, derivedPermissionIds, methods]);

  const handleSubmit = methods.handleSubmit(async (values: ActivationValues) => {
    if (values.activationType === 'custom') {
      await onSubmit({
        activationType: 'custom',
        billingPeriod: values.billingPeriod,
        monthlyPrice: values.monthlyPrice,
        yearlyPrice: values.yearlyPrice,
        allowedRoleIds: values.allowedRoleIds,
        permissionIds: uniqueIds(values.permissionIds),
        startsOn: values.startsOn,
      });
      return;
    }

    await onSubmit({
      activationType: 'tariff',
      billingPeriod: values.billingPeriod,
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
            <RestaurantActivationFields
              activationType={activationType}
              customTariffAllowed={customTariffAllowed}
              filteredRoles={filteredRoles}
              permissions={permissions}
              selectedCustomRoleNames={selectedCustomRoleNames}
              selectedPermissionCount={selectedPermissionIds.length}
              selectedTariff={selectedTariff}
              tariffs={tariffs}
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
