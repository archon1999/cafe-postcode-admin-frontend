import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import type { AdminPermission, AdminRole, AdminTariffOption } from 'shared/api/admin-types';
import { RHFMultiSelect, RHFRadioGroup, RHFSelect } from 'shared/ui/HookForm';

type RestaurantActivationFieldsProps = {
  activationType: 'tariff' | 'custom';
  customTariffAllowed: boolean;
  filteredRoles: AdminRole[];
  permissions: AdminPermission[];
  selectedCustomRoleNames: string[];
  selectedPermissionCount: number;
  selectedTariff: AdminTariffOption | null;
  tariffs: AdminTariffOption[];
};

export function RestaurantActivationFields({
  activationType,
  customTariffAllowed,
  filteredRoles,
  permissions,
  selectedCustomRoleNames,
  selectedPermissionCount,
  selectedTariff,
  tariffs,
}: RestaurantActivationFieldsProps) {
  const { t } = useTranslate('platform');

  return (
    <>
      <RHFRadioGroup
        name="activationType"
        label={t('fields.customTariff')}
        row
        options={[
          { value: 'tariff', label: t('labels.existingTariff') },
          ...(customTariffAllowed ? [{ value: 'custom', label: t('labels.customActivation') }] : []),
        ]}
      />
      {activationType === 'tariff' ? (
        <>
          <RHFSelect name="tariffId" label={t('fields.tariff')}>
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
          <RHFMultiSelect
            name="allowedRoleIds"
            label={t('fields.allowedRoles')}
            checkbox
            chip
            placeholder={t('labels.notSelected')}
            options={filteredRoles.map((role) => ({ value: role.id, label: role.name }))}
          />
          <RHFMultiSelect
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
            {t('labels.selectedPermissionsCount', { count: selectedPermissionCount })}
          </Typography>
        </>
      )}
    </>
  );
}
