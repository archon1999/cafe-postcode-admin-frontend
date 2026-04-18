import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import { Form, RHFTextField } from 'shared/ui/HookForm';

import { useChangeEmployeePinMutation, useGetEmployeeByIdQuery } from '../../../application';
import { isValidPinCode, PIN_CODE_ERROR_MESSAGE, sanitizePinCodeInput } from '../../../domain';

const changeEmployeePinSchema = z.object({
  pin: z.string().trim().refine(isValidPinCode, { message: PIN_CODE_ERROR_MESSAGE }),
});

type ChangeEmployeePinFormValues = z.infer<typeof changeEmployeePinSchema>;

type ChangeEmployeePinDialogProps = {
  employeeId: string | null;
  onClose: () => void;
  open: boolean;
};

const defaultValues: ChangeEmployeePinFormValues = {
  pin: '',
};

export function ChangeEmployeePinDialog({ employeeId, onClose, open }: ChangeEmployeePinDialogProps) {
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const employeeQuery = useGetEmployeeByIdQuery(employeeId ?? '', { enabled: open && Boolean(employeeId) });
  const changeEmployeePinMutation = useChangeEmployeePinMutation();
  const methods = useForm<ChangeEmployeePinFormValues>({
    resolver: zodResolver(changeEmployeePinSchema),
    defaultValues,
  });

  const { handleSubmit, reset, formState } = methods;

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, reset]);

  const handleClose = () => {
    if (changeEmployeePinMutation.isPending) {
      return;
    }

    reset(defaultValues);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!employeeQuery.data) {
      return;
    }

    await changeEmployeePinMutation.mutateAsync({
      user: employeeQuery.data,
      pin: values.pin.trim(),
    });
    toast.success(t('messages.pinUpdated'));
    handleClose();
  });

  return (
    <Dialog fullWidth maxWidth="xs" open={open} onClose={handleClose}>
      <DialogTitle>{t('dialogs.changePin.title')}</DialogTitle>

      <Form methods={methods} onSubmit={onSubmit}>
        <DialogContent>
          {employeeQuery.isLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 3 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : employeeQuery.data ? (
            <Stack spacing={2}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {employeeQuery.data.fullName}
              </Typography>

              <RHFTextField
                autoFocus
                name="pin"
                label={t('fields.pin')}
                helperText={t('fields.pinHint')}
                sanitizeValue={sanitizePinCodeInput}
                slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 } }}
              />
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {tCommon('labels.notFound')}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose}>
            {tCommon('actions.cancel')}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="black"
            loading={formState.isSubmitting}
            disabled={employeeQuery.isLoading || !employeeQuery.data}>
            {t('actions.savePin')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
