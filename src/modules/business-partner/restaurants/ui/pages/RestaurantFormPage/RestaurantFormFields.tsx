import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import { RHFPhoneInput, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import type { Values } from './RestaurantFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type RestaurantFormFieldsProps = {
  isEditMode: boolean;
  isLookupPending: boolean;
  isSubmitting: boolean;
  onLookup: () => void | Promise<void>;
  t: TranslateFn;
};

export const RestaurantFormFields = ({ isEditMode, isLookupPending, isSubmitting, onLookup, t }: RestaurantFormFieldsProps) => (
  <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
      <RHFTextField<Values> name="name" label={t('fields.name')} />
      <RHFTextField<Values> name="legalName" label={t('fields.legalName')} />
      {isEditMode ? (
        <RHFTextField<Values> name="taxNumber" label={t('fields.taxNumber')} />
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'flex-start' } }}>
          <RHFTextField<Values> name="taxNumber" label={t('fields.taxNumber')} />
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
      <RHFSwitch<Values> name="vatEnabled" label={t('fields.vatEnabled')} />
      <RHFTextField<Values> name="vatPercent" label="QQS / NDS (%)" type="number" />
    </Box>

    {isEditMode ? <RHFSwitch<Values> name="isActive" label={t('fields.status')} /> : null}
  </>
);
