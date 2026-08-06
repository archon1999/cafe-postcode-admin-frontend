import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';

import { useTranslate } from 'app/providers/locales';
import type { AdminCashDesk, AdminCashDeskPayload } from 'shared/api/admin-types';
import { Form, RHFSelect, RHFTextField } from 'shared/ui/HookForm';

import {
  useCreateCashDeskMutation,
  useGetIntegrationConfigsListQuery,
  useUpdateCashDeskMutation,
} from '../../application';

const schema = z.object({
  name: z.string().min(1),
  fiscalIntegration: z.string(),
  paymentIntegration: z.string(),
  printerIntegration: z.string(),
});

type Values = z.infer<typeof schema>;

function getPrinterIntegrationLabel(integration: {
  id?: string;
  provider: string;
  displayName?: string;
  display_name?: string;
  settings: Record<string, unknown>;
}) {
  if (integration.displayName || integration.display_name) {
    return integration.displayName ?? integration.display_name;
  }

  const connectionType = integration.settings.connection_type ?? integration.settings.connectionType;
  const printerName = integration.settings.printer_name ?? integration.settings.printerName;
  const host = integration.settings.host;
  const port = integration.settings.port;

  if (host) {
    return `${integration.provider} (LAN TCP/IP: ${String(host)}${port ? `:${String(port)}` : ''})`;
  }
  if (printerName) {
    return `${integration.provider} (Windows/USB: ${String(printerName)})`;
  }
  if (connectionType) {
    return `${integration.provider} (${String(connectionType)})`;
  }
  return integration.id ? `${integration.provider} (${integration.id.slice(-6)})` : integration.provider;
}

function getIntegrationLabel(integration: {
  id?: string;
  provider: string;
  displayName?: string;
  display_name?: string;
  settings: Record<string, unknown>;
  kind?: string;
}) {
  if (integration.displayName || integration.display_name) {
    return integration.displayName ?? integration.display_name;
  }
  if (integration.kind === 'printer') {
    return getPrinterIntegrationLabel(integration);
  }

  const terminalId = integration.settings.terminal_id ?? integration.settings.terminalId ?? integration.settings.fiscal;
  const endpointUrl = integration.settings.endpoint_url ?? integration.settings.endpointUrl;
  const suffix = terminalId ?? endpointUrl;
  return suffix ? `${integration.provider} (${String(suffix)})` : integration.provider;
}

export function RestaurantCashDeskDialog({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: AdminCashDesk | null;
  onClose: () => void;
}) {
  const { t } = useTranslate('organizations');
  const isEditMode = Boolean(item);
  const createMutation = useCreateCashDeskMutation();
  const updateMutation = useUpdateCashDeskMutation(item?.id ?? '');
  const fiscalIntegrationsQuery = useGetIntegrationConfigsListQuery({
    page: 1,
    pageSize: 100,
    kindIn: 'fiscal',
    isEnabled: true,
  });
  const fiscalIntegrations = (fiscalIntegrationsQuery.data?.data ?? []).filter(
    (integration) => integration.kind === 'fiscal' && integration.isEnabled,
  );
  const paymentIntegrationsQuery = useGetIntegrationConfigsListQuery({
    page: 1,
    pageSize: 100,
    kindIn: 'payment',
    isEnabled: true,
  });
  const paymentIntegrations = (paymentIntegrationsQuery.data?.data ?? []).filter(
    (integration) =>
      integration.kind === 'payment' && integration.provider === 'marta-softpos' && integration.isEnabled,
  );
  const printerIntegrationsQuery = useGetIntegrationConfigsListQuery({
    page: 1,
    pageSize: 100,
    kindIn: 'printer',
    isEnabled: true,
  });
  const printerIntegrations = (printerIntegrationsQuery.data?.data ?? []).filter(
    (integration) => integration.kind === 'printer' && integration.isEnabled,
  );

  const methods = useForm<Values>({
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues: { name: '', fiscalIntegration: '', paymentIntegration: '', printerIntegration: '' },
  });

  useEffect(() => {
    methods.reset({
      name: item?.name ?? '',
      fiscalIntegration: item?.fiscalIntegration ?? '',
      paymentIntegration: item?.paymentIntegration ?? '',
      printerIntegration: item?.printerIntegration ?? '',
    });
  }, [item, methods, open]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload: AdminCashDeskPayload = {
      name: values.name.trim(),
      fiscalIntegration: values.fiscalIntegration || null,
      paymentIntegration: values.paymentIntegration || null,
      printerIntegration: values.printerIntegration || null,
    };

    if (isEditMode && item) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  });

  return (
    <Dialog open={open} onClose={methods.formState.isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{isEditMode ? t('pages.cashDeskEdit.title') : t('pages.cashDeskCreate.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField<Values> name="name" label={t('fields.name')} />
            <RHFSelect<Values>
              name="fiscalIntegration"
              label={t('fields.fiscalIntegration')}
              disabled={fiscalIntegrationsQuery.isLoading}>
              <MenuItem value="">{t('labels.notSelected')}</MenuItem>
              {fiscalIntegrations.map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {getIntegrationLabel(integration)}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect<Values>
              name="paymentIntegration"
              label={t('fields.paymentIntegration')}
              disabled={paymentIntegrationsQuery.isLoading}>
              <MenuItem value="">{t('labels.notConnected')}</MenuItem>
              {paymentIntegrations.map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {getIntegrationLabel(integration)}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect<Values>
              name="printerIntegration"
              label={t('fields.printerIntegration')}
              disabled={printerIntegrationsQuery.isLoading}>
              <MenuItem value="">{t('labels.notSelected')}</MenuItem>
              {printerIntegrations.map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {getIntegrationLabel(integration)}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button color="inherit" variant="outlined" onClick={onClose} disabled={methods.formState.isSubmitting}>
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button type="submit" variant="contained" color="black" loading={methods.formState.isSubmitting}>
            {isEditMode ? t('actions.save') : t('actions.create')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
