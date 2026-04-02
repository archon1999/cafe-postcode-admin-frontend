import Box from '@mui/material/Box';

import { RHFTextField } from 'shared/ui/HookForm';

import { PermissionsSelect } from '../../components/PermissionsSelect/PermissionsSelect';

import type { RoleFormValues } from './RoleFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type RoleFormFieldsProps = {
  t: TranslateFn;
};

export const RoleFormFields = ({ t }: RoleFormFieldsProps) => (
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
      gap: 3,
    }}>
    <RHFTextField<RoleFormValues> name="name" label={t('fields.name')} />
    <RHFTextField<RoleFormValues> name="description" label={t('fields.description')} multiline rows={4} />
    <PermissionsSelect<RoleFormValues> name="permissionIds" label={t('fields.permissions')} />
  </Box>
);
