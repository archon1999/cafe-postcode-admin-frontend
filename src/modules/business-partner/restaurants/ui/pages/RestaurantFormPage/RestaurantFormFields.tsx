import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFormContext } from 'react-hook-form';

import { RHFPhoneInput, RHFSelect, RHFSwitch, RHFTextField, RHFUpload } from 'shared/ui/HookForm';

import type { RestaurantFormValues } from './restaurant-form';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type RestaurantFormFieldsProps = {
  isEditMode: boolean;
  isLookupPending: boolean;
  isSubmitting: boolean;
  onLookup: () => void | Promise<void>;
  t: TranslateFn;
  disableLegalIdentity?: boolean;
  hideStatus?: boolean;
};

export const RestaurantFormFields = ({
  isEditMode,
  isLookupPending,
  isSubmitting,
  onLookup,
  t,
  disableLegalIdentity = false,
  hideStatus = false,
}: RestaurantFormFieldsProps) => {
  const { setValue, watch } = useFormContext<RestaurantFormValues>();
  const backgroundImage = watch('posAuthBackgroundImage');

  const clearBackgroundImage = () => {
    setValue('posAuthBackgroundImage', null, { shouldDirty: true, shouldValidate: true });
    setValue('clearPosAuthBackgroundImage', true, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
        <RHFTextField<RestaurantFormValues> name="name" label={t('fields.name')} />
        <RHFTextField<RestaurantFormValues>
          name="legalName"
          label={t('fields.legalName')}
          disabled={disableLegalIdentity}
        />
        {isEditMode ? (
          <RHFTextField<RestaurantFormValues>
            name="taxNumber"
            label={t('fields.taxNumber')}
            disabled={disableLegalIdentity}
          />
        ) : (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'flex-start' } }}>
            <RHFTextField<RestaurantFormValues> name="taxNumber" label={t('fields.taxNumber')} />
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
        <RHFPhoneInput<RestaurantFormValues>
          name="phone"
          label={t('fields.phone')}
          defaultCountry="UZ"
          placeholder={t('fields.phonePlaceholder')}
        />
        <RHFTextField<RestaurantFormValues> name="social" label={t('fields.social')} />
        <RHFTextField<RestaurantFormValues>
          name="address"
          label={t('fields.address')}
          multiline
          rows={3}
          sx={{ gridColumn: { lg: '1 / -1' } }}
        />
        <RHFSwitch<RestaurantFormValues> name="serviceFeeEnabled" label={t('fields.serviceFeeEnabled')} />
        <RHFTextField<RestaurantFormValues>
          name="serviceFeePercent"
          label={t('fields.serviceFeePercent')}
          type="number"
        />
        <RHFSwitch<RestaurantFormValues> name="vatEnabled" label={t('fields.vatEnabled')} />
        <RHFTextField<RestaurantFormValues> name="vatPercent" label={t('fields.vatPercent')} type="number" />
        <RHFSwitch<RestaurantFormValues> name="markingCheckEnabled" label={t('fields.markingCheckEnabled')} />
        <RHFSelect<RestaurantFormValues> name="posMonitorVariant" label={t('fields.posMonitorVariant')}>
          <MenuItem value="default">{t('fields.posMonitorVariantDefault')}</MenuItem>
          <MenuItem value="light_compact">{t('fields.posMonitorVariantLightCompact')}</MenuItem>
        </RHFSelect>
        <RHFSelect<RestaurantFormValues>
          name="paymentTotalMode"
          label={t('fields.paymentTotalMode')}
          helperText={t('fields.paymentTotalModeHelp')}>
          <MenuItem value="fixed">{t('fields.paymentTotalModeFixed')}</MenuItem>
          <MenuItem value="cashier_editable">{t('fields.paymentTotalModeCashierEditable')}</MenuItem>
        </RHFSelect>
      </Box>

      <Stack spacing={1.5} sx={{ mt: 1 }}>
        <Typography variant="subtitle1">{t('fields.posAuthBackgroundImage')}</Typography>
        <RHFUpload name="posAuthBackgroundImage" disabled={isSubmitting} onDelete={clearBackgroundImage} />
        {backgroundImage ? (
          <Button variant="outlined" color="inherit" onClick={clearBackgroundImage} disabled={isSubmitting}>
            {t('actions.removePosAuthBackgroundImage')}
          </Button>
        ) : null}
      </Stack>

      {isEditMode && !hideStatus ? (
        <RHFSwitch<RestaurantFormValues> name="isActive" label={t('fields.status')} />
      ) : null}
    </>
  );
};
