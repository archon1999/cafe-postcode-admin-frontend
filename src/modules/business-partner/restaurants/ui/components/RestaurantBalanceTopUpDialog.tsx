import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import type { AdminRestaurantTopUpPayload } from 'shared/api/admin-types';
import { Form, RHFSumCurrencyField, RHFTextField } from 'shared/ui/HookForm';

const topUpSchema = z.object({
  amount: z.preprocess(
    (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
    z.number().positive(),
  ),
  note: z.string().max(255).optional().default(''),
});

type TopUpFormValues = z.input<typeof topUpSchema>;
type TopUpValues = z.output<typeof topUpSchema>;

const defaultValues: TopUpFormValues = {
  amount: undefined,
  note: '',
};

type RestaurantBalanceTopUpDialogProps = {
  open: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminRestaurantTopUpPayload) => Promise<void>;
};

export function RestaurantBalanceTopUpDialog({
  open,
  isSubmitting,
  onClose,
  onSubmit,
}: RestaurantBalanceTopUpDialogProps) {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');

  const methods = useForm<TopUpFormValues, unknown, TopUpValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) {
      methods.reset(defaultValues);
    }
  }, [methods, open]);

  const handleSubmit = methods.handleSubmit(async (values) => {
    await onSubmit({
      amount: values.amount,
      note: values.note?.trim() || undefined,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('dialogs.balanceTopUp.title', { defaultValue: "Balansni to'ldirish" })}</DialogTitle>
      <DialogContent>
        <Form methods={methods} onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFSumCurrencyField
              name="amount"
              label={t('fields.topUpAmount', { defaultValue: "To'ldirish summasi" })}
            />
            <RHFTextField name="note" label={t('fields.note', { defaultValue: 'Izoh' })} multiline minRows={3} />
            <DialogActions sx={{ px: 0 }}>
              <Button onClick={onClose} disabled={isSubmitting} color="inherit" variant="outlined">
                {tPlatform('actions.cancel')}
              </Button>
              <Button loading={isSubmitting} variant="contained" color="black" type="submit">
                {t('actions.topUpBalance', { defaultValue: "Balansni to'ldirish" })}
              </Button>
            </DialogActions>
          </Stack>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
