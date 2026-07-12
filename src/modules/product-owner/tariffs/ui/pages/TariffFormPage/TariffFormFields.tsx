import Box from '@mui/material/Box';

import { PermissionsSelect } from 'modules/user-management/permissions/ui/components/PermissionsSelect/PermissionsSelect';
import {
  RolesSelect,
  type RoleSelectOption,
} from 'modules/user-management/roles/ui/components/RolesSelect/RolesSelect';
import { RHFSumCurrencyField, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import type { Values } from './TariffFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type TariffFormFieldsProps = {
  canManagePlatform: boolean;
  derivedPermissionCount: number;
  roleOptions: RoleSelectOption[];
  t: TranslateFn;
};

export const TariffFormFields = ({
  canManagePlatform,
  derivedPermissionCount,
  roleOptions,
  t,
}: TariffFormFieldsProps) => (
  <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
      <RHFTextField<Values> name="name" label={t('fields.name')} />
      <RHFSumCurrencyField<Values> name="monthlyPrice" label={t('fields.monthlyPrice')} />
      <RHFSumCurrencyField<Values> name="yearlyPrice" label={t('fields.yearlyPrice')} />
      <RHFTextField<Values>
        name="description"
        label={t('fields.description')}
        multiline
        rows={4}
        sx={{ gridColumn: { md: '1 / -1' } }}
      />
      <RolesSelect<Values>
        name="allowedRoleIds"
        label={t('fields.allowedRoles')}
        options={roleOptions}
        enabled={canManagePlatform}
      />
      <PermissionsSelect<Values>
        name="permissionIds"
        label={t('fields.permissions')}
        enabled={canManagePlatform}
        helperText={t('labels.permissionsAutoSelected', {
          count: derivedPermissionCount,
        })}
      />
    </Box>

    <RHFSwitch<Values> name="isActive" label={t('fields.status')} />
  </>
);
