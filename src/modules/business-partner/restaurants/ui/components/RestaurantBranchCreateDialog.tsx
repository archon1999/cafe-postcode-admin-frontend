import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import { normalizeError, notifyError } from 'shared/api/errors/errorHandling';
import { Form } from 'shared/ui/HookForm';

import { useCreateRestaurantBranchMutation, useLookupRestaurantMutation } from '../../application';
import {
  restaurantFormDefaultValues,
  restaurantFormSchema,
  restaurantFormValuesToPayload,
  type RestaurantFormInput,
  type RestaurantFormValues,
} from '../pages/RestaurantFormPage/restaurant-form';
import { RestaurantFormFields } from '../pages/RestaurantFormPage/RestaurantFormFields';

type RestaurantBranchCreateDialogProps = {
  parentId: string | null;
  parentName?: string;
  onClose: () => void;
};

export function RestaurantBranchCreateDialog({ parentId, parentName, onClose }: RestaurantBranchCreateDialogProps) {
  const { t } = useTranslate('organizations');
  const [step, setStep] = useState<0 | 1>(0);
  const [copyCatalog, setCopyCatalog] = useState(false);
  const [copySettings, setCopySettings] = useState(false);
  const createMutation = useCreateRestaurantBranchMutation(parentId ?? '');
  const lookupMutation = useLookupRestaurantMutation();
  const methods = useForm<RestaurantFormInput, unknown, RestaurantFormValues>({
    resolver: zodResolver(restaurantFormSchema),
    defaultValues: restaurantFormDefaultValues,
  });

  useEffect(() => {
    if (!parentId) return;
    setStep(0);
    setCopyCatalog(false);
    setCopySettings(false);
    methods.reset(restaurantFormDefaultValues);
  }, [methods, parentId]);

  const handleLookup = async () => {
    const taxNumber = methods.getValues('taxNumber').trim();
    if (!taxNumber) {
      methods.setError('taxNumber', { type: 'manual', message: 'Tax number is required.' });
      return;
    }

    try {
      const result = await lookupMutation.mutateAsync(taxNumber);
      methods.setValue('taxNumber', result.taxNumber, { shouldDirty: true, shouldValidate: true });
      methods.setValue('name', result.name, { shouldDirty: true, shouldValidate: true });
      methods.setValue('legalName', result.legalName, { shouldDirty: true, shouldValidate: true });
      methods.setValue('phone', result.phone, { shouldDirty: true, shouldValidate: true });
      methods.setValue('address', result.address, { shouldDirty: true, shouldValidate: true });
      methods.setValue('fakturaPayload', result.fakturaPayload, { shouldDirty: true });
    } catch (error) {
      const normalizedError = normalizeError(error);
      methods.setError('taxNumber', { type: 'manual', message: normalizedError.message });
      notifyError(normalizedError);
    }
  };

  const handleContinue = async () => {
    if (await methods.trigger()) setStep(1);
  };

  const handleCreate = methods.handleSubmit(async (values) => {
    if (!parentId) return;
    await createMutation.mutateAsync({
      ...restaurantFormValuesToPayload(values, { isEditMode: false }),
      copyCatalog,
      copySettings,
    });
    onClose();
  });

  return (
    <Dialog open={Boolean(parentId)} onClose={createMutation.isPending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {t('pages.branchCreate.title')}
        {parentName ? ` — ${parentName}` : ''}
      </DialogTitle>
      <DialogContent dividers>
        {step === 0 ? (
          <Form methods={methods}>
            <Stack spacing={3} sx={{ pt: 1 }}>
              <RestaurantFormFields
                isEditMode={false}
                isLookupPending={lookupMutation.isPending}
                isSubmitting={createMutation.isPending}
                onLookup={handleLookup}
                t={t}
              />
            </Stack>
          </Form>
        ) : (
          <Stack spacing={2.5} sx={{ py: 1 }}>
            <Typography variant="subtitle1">{t('dialogs.branchCreate.copyTitle')}</Typography>
            <FormControlLabel
              control={<Switch checked={copyCatalog} onChange={(_, checked) => setCopyCatalog(checked)} />}
              label={t('dialogs.branchCreate.copyCatalog')}
            />
            <FormControlLabel
              control={<Switch checked={copySettings} onChange={(_, checked) => setCopySettings(checked)} />}
              label={t('dialogs.branchCreate.copySettings')}
            />
            <Alert severity="info">{t('dialogs.branchCreate.copyHint')}</Alert>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {step === 1 ? (
          <Button onClick={() => setStep(0)} disabled={createMutation.isPending}>
            {t('actions.back')}
          </Button>
        ) : null}
        <Button onClick={onClose} disabled={createMutation.isPending}>
          {t('actions.cancel')}
        </Button>
        {step === 0 ? (
          <Button variant="contained" onClick={() => void handleContinue()}>
            {t('actions.continue')}
          </Button>
        ) : (
          <Button variant="contained" loading={createMutation.isPending} onClick={() => void handleCreate()}>
            {t('actions.create')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
