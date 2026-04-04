import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import type { AdminRestaurantActivationPayload, AdminTariffOption } from 'shared/api/admin-types';
import { Form, RHFDatePicker, RHFSelect } from 'shared/ui/HookForm';
import { formatMoney } from 'shared/utils/format-money';
import { getCurrentTashkentTime } from 'shared/utils/dayjs';

const activationSchema = z.object({
  tariffId: z.string().min(1, 'Tarif tanlang.'),
  startsOn: z.string().min(1),
});

type ActivationFormValues = z.input<typeof activationSchema>;
type ActivationValues = z.output<typeof activationSchema>;

const defaultValues: ActivationFormValues = {
  tariffId: '',
  startsOn: getCurrentTashkentTime().format('YYYY-MM-DD'),
};

type RestaurantActivationDialogProps = {
  open: boolean;
  tariffs: AdminTariffOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminRestaurantActivationPayload) => Promise<void>;
};

export function RestaurantActivationDialog({
  open,
  tariffs,
  isSubmitting,
  onClose,
  onSubmit,
}: RestaurantActivationDialogProps) {
  const { t } = useTranslate('platform');

  const methods = useForm<ActivationFormValues, unknown, ActivationValues>({
    resolver: zodResolver(activationSchema),
    defaultValues,
  });

  const selectedTariffId = methods.watch('tariffId');
  const selectedTariff = useMemo(
    () => tariffs.find((tariff) => tariff.id === selectedTariffId) ?? null,
    [selectedTariffId, tariffs],
  );

  useEffect(() => {
    if (!open) {
      methods.reset(defaultValues);
    }
  }, [methods, open]);

  const handleSubmit = methods.handleSubmit(async (values: ActivationValues) => {
    await onSubmit({
      tariffId: values.tariffId,
      startsOn: values.startsOn,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('dialogs.activateRestaurant.title')}</DialogTitle>
      <DialogContent>
        <Form methods={methods} onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFSelect<ActivationValues> name="tariffId" label={t('fields.tariff')}>
              <MenuItem value="">{t('labels.notSelected')}</MenuItem>
              {tariffs.map((tariff) => (
                <MenuItem key={tariff.id} value={tariff.id}>
                  {tariff.name}
                </MenuItem>
              ))}
            </RHFSelect>

            {selectedTariff ? (
              <Alert severity="info" variant="outlined">
                <Stack spacing={0.75}>
                  <Typography variant="subtitle2">{selectedTariff.name}</Typography>
                  {selectedTariff.description ? (
                    <Typography variant="body2">{selectedTariff.description}</Typography>
                  ) : null}
                  <Typography variant="body2">
                    {t('fields.monthlyPrice')}: {formatMoney(selectedTariff.monthlyPrice)}
                  </Typography>
                  <Typography variant="body2">
                    {t('fields.yearlyPrice')}: {formatMoney(selectedTariff.yearlyPrice)}
                  </Typography>
                  <Typography variant="body2">
                    {t('fields.allowedRoles')}: {selectedTariff.allowedRoles.map((role) => role.name).join(', ')}
                  </Typography>
                </Stack>
              </Alert>
            ) : null}

            <RHFDatePicker<ActivationValues>
              name="startsOn"
              label={t('fields.startsOn')}
              outputFormat="YYYY-MM-DD"
              maxDate={getCurrentTashkentTime()}
            />

            <DialogActions sx={{ px: 0 }}>
              <Button onClick={onClose} disabled={isSubmitting} color="inherit" variant="outlined">
                {t('actions.cancel')}
              </Button>
              <Button loading={isSubmitting} variant="contained" color="black" type="submit">
                {t('actions.activate')}
              </Button>
            </DialogActions>
          </Stack>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
