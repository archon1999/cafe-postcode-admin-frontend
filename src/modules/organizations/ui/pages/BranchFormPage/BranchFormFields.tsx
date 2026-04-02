import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { RHFCheckbox, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';

import type { Values } from './BranchFormPage';

type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

type BranchFormFieldsProps = {
  t: TranslateFn;
};

export const BranchFormFields = ({ t }: BranchFormFieldsProps) => (
  <>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
      <RHFTextField<Values> name="name" label={t('fields.name')} />
      <RHFTextField<Values> name="address" label={t('fields.address')} sx={{ gridColumn: { lg: '1 / -1' } }} />
      <RHFTextField<Values> name="phone" label={t('fields.phone')} />
    </Box>

    <Card variant="outlined" sx={{ p: 2.5 }}>
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6">{t('sections.fiscalProfile')}</Typography>
          <Typography variant="body2" sx={{ mt: 0.75, color: 'text.secondary' }}>
            {t('sections.fiscalProfileDescription')}
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
            gap: 3,
          }}>
          <RHFTextField<Values> name="legalName" label={t('fields.legalName')} />
          <RHFTextField<Values> name="taxNumber" label={t('fields.taxNumber')} />
          <RHFTextField<Values> name="serviceFeePercent" type="number" label={t('fields.serviceFeePercent')} />
          <RHFCheckbox<Values> name="vatEnabled" label={t('fields.vatEnabled')} />
        </Box>
      </Stack>
    </Card>

    <RHFSwitch<Values> name="isDefault" label={t('fields.default')} />
  </>
);
