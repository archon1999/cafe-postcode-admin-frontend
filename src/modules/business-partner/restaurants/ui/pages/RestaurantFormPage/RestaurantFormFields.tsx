import Box from '@mui/material/Box';

import { RHFPhoneInput, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import type { Values } from './RestaurantFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type RestaurantFormFieldsProps = {
  isEditMode: boolean;
  t: TranslateFn;
};

export const RestaurantFormFields = ({ isEditMode, t }: RestaurantFormFieldsProps) => (
  <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
      <RHFTextField<Values> name="name" label={t('fields.name')} />
      <RHFTextField<Values> name="legalName" label={t('fields.legalName')} />
      <RHFTextField<Values> name="taxNumber" label={t('fields.taxNumber')} />
      <RHFPhoneInput<Values>
        name="phone"
        label={t('fields.phone')}
        defaultCountry="UZ"
        placeholder={t('fields.phonePlaceholder')}
      />
      <RHFTextField<Values>
        name="address"
        label={t('fields.address')}
        multiline
        rows={3}
        sx={{ gridColumn: { lg: '1 / -1' } }}
      />
    </Box>

    {isEditMode ? <RHFSwitch<Values> name="isActive" label={t('fields.status')} /> : null}
  </>
);
