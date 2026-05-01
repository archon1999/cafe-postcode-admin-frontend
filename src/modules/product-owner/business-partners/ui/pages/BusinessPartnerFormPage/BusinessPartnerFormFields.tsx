import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { RHFCheckbox, RHFPhoneInput, RHFTextField } from 'shared/ui/HookForm';

import type { Values } from './BusinessPartnerFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type BusinessPartnerFormFieldsProps = {
  isEditMode: boolean;
  isLookupPending: boolean;
  isSubmitting: boolean;
  onLookup: () => void | Promise<void>;
  t: TranslateFn;
};

export const BusinessPartnerFormFields = ({
  isEditMode,
  isLookupPending,
  isSubmitting,
  onLookup,
  t,
}: BusinessPartnerFormFieldsProps) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
    {isEditMode ? (
      <RHFTextField<Values> name="inn" label={t('fields.inn')} />
    ) : (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'flex-start' } }}>
        <RHFTextField<Values> name="inn" label={t('fields.inn')} />
        <Button
          type="button"
          variant="outlined"
          onClick={onLookup}
          loading={isLookupPending}
          disabled={isLookupPending || isSubmitting}
          sx={{ minWidth: { sm: 120 }, height: 56 }}>
          {t('filters.search')}
        </Button>
      </Stack>
    )}
    <RHFTextField<Values> name="companyName" label={t('fields.companyName')} />
    <RHFTextField<Values> name="legalName" label={t('fields.legalName')} />
    <RHFTextField<Values> name="directorName" label={t('fields.directorName')} />
    <RHFPhoneInput<Values> name="phone" label={t('fields.phone')} defaultCountry="UZ" />
    <RHFTextField<Values> name="email" label={t('fields.email')} />
    <RHFCheckbox<Values>
      name="customTariffAllowed"
      label={t('fields.customTariffAllowed')}
      sx={{ alignSelf: 'center' }}
    />
    <RHFTextField<Values>
      name="address"
      label={t('fields.address')}
      multiline
      rows={3}
      sx={{ gridColumn: { lg: '1 / -1' } }}
    />
  </Box>
);
