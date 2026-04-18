import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import {
  useActivateBusinessPartnerMutation,
  useGetBusinessPartnerActivationDefaultsQuery,
} from 'modules/product-owner/business-partners/application';
import type {
  AdminBusinessPartner,
  AdminPartnerActivationDefaults,
  AdminPartnerActivationResult,
} from 'shared/api/admin-types';
import { Form, RHFTextField } from 'shared/ui/HookForm';

const emptyDefaultValues: AdminPartnerActivationDefaults = {
  username: '',
  password: '',
};

type BusinessPartnerActivationDialogContentProps = {
  open: boolean;
  defaults: AdminPartnerActivationDefaults | null;
  isLoadingDefaults: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: AdminPartnerActivationDefaults) => Promise<void>;
};

export function BusinessPartnerActivationDialogContent({
  open,
  defaults,
  isLoadingDefaults,
  isSubmitting,
  onClose,
  onSubmit,
}: BusinessPartnerActivationDialogContentProps) {
  const { t } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const activationSchema = useMemo(
    () =>
      z.object({
        username: z.string().trim().min(1, { message: t('validation.usernameRequired') }),
        password: z.string().min(1, { message: t('validation.passwordRequired') }),
      }),
    [t],
  );

  const methods = useForm<AdminPartnerActivationDefaults>({
    resolver: zodResolver(activationSchema),
    defaultValues: emptyDefaultValues,
  });

  useEffect(() => {
    if (!open) {
      methods.reset(emptyDefaultValues);
      return;
    }

    if (defaults) {
      methods.reset(defaults);
    }
  }, [defaults, methods, open]);

  const handleSubmit = methods.handleSubmit(async (values) => {
    await onSubmit({
      username: values.username.trim(),
      password: values.password,
    });
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('dialogs.activatePartner.title')}</DialogTitle>
      <DialogContent>
        <Form methods={methods} onSubmit={handleSubmit}>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Stack spacing={1}>
              <Typography variant="body2">{t('dialogs.activatePartner.description')}</Typography>
              <Alert severity="info">{t('dialogs.activatePartner.credentialsHint')}</Alert>
              {isLoadingDefaults ? <Alert severity="info">{tCommon('labels.loading')}</Alert> : null}
            </Stack>

            <RHFTextField<AdminPartnerActivationDefaults>
              name="username"
              label={t('fields.username')}
              disabled={isLoadingDefaults || isSubmitting}
            />
            <RHFTextField<AdminPartnerActivationDefaults>
              name="password"
              label={t('fields.password')}
              type="password"
              disabled={isLoadingDefaults || isSubmitting}
            />

            <DialogActions sx={{ px: 0 }}>
              <Button onClick={onClose} disabled={isSubmitting} color="inherit" variant="outlined">
                {t('actions.cancel')}
              </Button>
              <Button
                loading={isSubmitting}
                disabled={isLoadingDefaults}
                variant="contained"
                color="black"
                type="submit">
                {t('actions.activate')}
              </Button>
            </DialogActions>
          </Stack>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

type BusinessPartnerActivationDialogProps = {
  open: AdminBusinessPartner | null;
  onClose: () => void;
  onSuccess: (result: AdminPartnerActivationResult) => void;
};

export function BusinessPartnerActivationDialog({
  open,
  onClose,
  onSuccess,
}: BusinessPartnerActivationDialogProps) {
  const activateMutation = useActivateBusinessPartnerMutation();
  const activationDefaultsQuery = useGetBusinessPartnerActivationDefaultsQuery(open?.id ?? '', {
    enabled: Boolean(open),
  });

  const handleSubmit = async (payload: AdminPartnerActivationDefaults) => {
    if (!open) {
      return;
    }

    const result = await activateMutation.mutateAsync({ id: open.id, payload });
    onSuccess(result);
  };

  return (
    <BusinessPartnerActivationDialogContent
      open={Boolean(open)}
      defaults={activationDefaultsQuery.data ?? null}
      isLoadingDefaults={activationDefaultsQuery.isLoading}
      isSubmitting={activateMutation.isPending}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
}
