import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

import { PermissionsSelect } from 'modules/users/ui/components/PermissionsSelect/PermissionsSelect';
import { RHFMultiSelect, RHFSelect, RHFSumCurrencyField, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import type { Values } from './TariffFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type Option = {
  label: string;
  value: string;
};

type TariffFormFieldsProps = {
  canManagePlatform: boolean;
  roleOptions: Option[];
  t: TranslateFn;
};

export const TariffFormFields = ({ canManagePlatform, roleOptions, t }: TariffFormFieldsProps) => (
  <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
      <RHFTextField<Values> name="name" label={t('fields.name')} />
      <RHFSelect<Values> name="classification" label={t('fields.classification')}>
        <MenuItem value="basic">{t('classifications.basic')}</MenuItem>
        <MenuItem value="standard">{t('classifications.standard')}</MenuItem>
        <MenuItem value="premium">{t('classifications.premium')}</MenuItem>
        <MenuItem value="custom">{t('classifications.custom')}</MenuItem>
      </RHFSelect>
      <RHFSumCurrencyField<Values> name="monthlyPrice" label={t('fields.monthlyPrice')} />
      <RHFSumCurrencyField<Values> name="yearlyPrice" label={t('fields.yearlyPrice')} />
      <RHFTextField<Values>
        name="description"
        label={t('fields.description')}
        multiline
        rows={4}
        sx={{ gridColumn: { md: '1 / -1' } }}
      />
      <PermissionsSelect<Values> name="permissionIds" label={t('fields.permissions')} enabled={canManagePlatform} />
      <RHFMultiSelect<Values>
        name="allowedRoleIds"
        label={t('fields.allowedRoles')}
        options={roleOptions}
        checkbox
        chip
        placeholder={t('labels.notSelected')}
      />
      <RHFTextField<Values>
        name="operationalSettingsText"
        label={t('fields.operationalSettings')}
        multiline
        rows={6}
        sx={{ gridColumn: { md: '1 / -1' } }}
      />
    </Box>

    <RHFSwitch<Values> name="isActive" label={t('fields.status')} />
  </>
);
