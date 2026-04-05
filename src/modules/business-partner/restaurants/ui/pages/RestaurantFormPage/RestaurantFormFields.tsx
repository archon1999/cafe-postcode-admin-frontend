import Box from '@mui/material/Box';
import MenuItem from '@mui/material/MenuItem';

import type { AdminRestaurantActivationOptions } from 'shared/api/admin-types';
import { RHFPhoneInput, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import type { Values } from './RestaurantFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type RestaurantFormFieldsProps = {
  isEditMode: boolean;
  tariffOptions: AdminRestaurantActivationOptions['tariffs'];
  t: TranslateFn;
};

export const RestaurantFormFields = ({ isEditMode, tariffOptions, t }: RestaurantFormFieldsProps) => (
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
      <RHFSelect<Values>
        name="tariffId"
        label={t('fields.tariff', { defaultValue: 'Tariff' })}
        helperText={t('fields.tariffHint', { defaultValue: 'Select the tariff that defines restaurant access.' })}>
        <MenuItem value="" disabled>
          {t('fields.tariffPlaceholder', { defaultValue: 'Select a tariff' })}
        </MenuItem>
        {tariffOptions.map((tariff) => (
          <MenuItem key={tariff.id} value={tariff.id}>
            {tariff.name}
          </MenuItem>
        ))}
      </RHFSelect>
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
