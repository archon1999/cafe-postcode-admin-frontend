import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import type {
  AdminIntegrationConfig,
  AdminIntegrationConfigKind,
  AdminIntegrationConfigPayload,
} from 'shared/api/admin-types';
import { Form, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';

import { useCreateIntegrationConfigMutation, useUpdateIntegrationConfigMutation } from '../../application';

import {
  buildIntegrationConfigSettings,
  getPrinterConnectionLabel,
  integrationConfigDefaultValues,
  integrationConfigToFormValues,
  PAPER_WIDTH_VALUES,
  PRINTER_CONNECTION_TYPE_VALUES,
  PRINT_MODE_VALUES,
  QR_MODE_VALUES,
  RASTER_FONT_VALUES,
  type IntegrationConfigFormValues,
} from './integration-config.mapper';
import { INTEGRATION_KIND_VALUES, integrationConfigSchema } from './integration-config.schema';
import { checkPrinterConnection } from './integration-printer-check';

export { INTEGRATION_KIND_VALUES } from './integration-config.schema';

const PROVIDER_OPTIONS: Record<AdminIntegrationConfigKind, { value: string; label: string }[]> = {
  printer: [{ value: 'windows-raw', label: 'Windows raw' }],
  payment: [{ value: 'marta-softpos', label: 'MARTA SoftPOS' }],
  fiscal: [{ value: 'fiscal-drive-service', label: 'Fiscal Drive' }],
};

type Values = IntegrationConfigFormValues;

export function getKindLabel(kind: AdminIntegrationConfigKind) {
  const labels: Record<AdminIntegrationConfigKind, string> = {
    printer: 'Printer',
    payment: "To'lov",
    fiscal: 'Fiskal',
  };
  return labels[kind];
}

export function RestaurantIntegrationDialog({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: AdminIntegrationConfig | null;
  onClose: () => void;
}) {
  const { t } = useTranslate('organizations');
  const isEditMode = Boolean(item);
  const createMutation = useCreateIntegrationConfigMutation();
  const updateMutation = useUpdateIntegrationConfigMutation(item?.id ?? '');
  const [isCheckingPrinter, setIsCheckingPrinter] = useState(false);

  const methods = useForm<Values>({
    resolver: zodResolver(integrationConfigSchema) as Resolver<Values>,
    defaultValues: integrationConfigDefaultValues,
  });
  const selectedKind = methods.watch('kind');
  const selectedProvider = methods.watch('provider');
  const selectedPrintMode = methods.watch('printMode');
  const providerOptions = useMemo(() => {
    const options = PROVIDER_OPTIONS[selectedKind];
    if (item?.kind === selectedKind && item.provider && !options.some((option) => option.value === item.provider)) {
      return [{ value: item.provider, label: item.provider }, ...options];
    }
    return options;
  }, [item?.kind, item?.provider, selectedKind]);

  useEffect(() => {
    methods.reset(integrationConfigToFormValues(item));
  }, [item, methods, open]);

  useEffect(() => {
    if (!providerOptions.some((option) => option.value === selectedProvider)) {
      methods.setValue('provider', providerOptions[0]?.value ?? '');
    }
  }, [methods, providerOptions, selectedProvider]);

  const onSubmit = methods.handleSubmit(
    async (values) => {
      const payload: AdminIntegrationConfigPayload = {
        kind: values.kind,
        provider: values.provider.trim(),
        isEnabled: values.isEnabled,
        settings: buildIntegrationConfigSettings(values, item),
      };

      if (isEditMode && item) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
      }

      onClose();
    },
    (errors) => {
      const firstError = Object.values(errors)[0];
      toast.error(String(firstError?.message || t('integrations.messages.formInvalid')));
    },
  );

  const onCheckPrinter = async () => {
    const values = methods.getValues();
    if (values.kind !== 'printer' || values.provider !== 'windows-raw') {
      return;
    }

    const fieldsToValidate: Array<keyof Values> =
      values.connectionType === 'socket' ? ['printerHost', 'printerPort'] : ['printerName'];
    const isValid = await methods.trigger(fieldsToValidate);
    if (!isValid) {
      return;
    }

    setIsCheckingPrinter(true);
    try {
      const result = await checkPrinterConnection(values);
      const target =
        values.connectionType === 'socket'
          ? `${result.host ?? values.printerHost}${result.port ? `:${result.port}` : ''}`
          : (result.printerName ?? values.printerName);
      toast.success(t('integrations.messages.printerCheckSuccess', { target }));
    } catch (error) {
      toast.error(
        t('integrations.messages.printerCheckFailed', {
          error: error instanceof Error ? error.message : String(error),
        }),
      );
    } finally {
      setIsCheckingPrinter(false);
    }
  };

  return (
    <Dialog open={open} onClose={methods.formState.isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{isEditMode ? t('pages.integrationEdit.title') : t('pages.integrationCreate.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFSelect<Values> name="kind" label={t('fields.kind')}>
                {INTEGRATION_KIND_VALUES.map((kind) => (
                  <MenuItem key={kind} value={kind}>
                    {getKindLabel(kind)}
                  </MenuItem>
                ))}
              </RHFSelect>
            </Stack>

            <RHFSelect<Values> name="provider" label={t('integrations.fields.provider')}>
              {providerOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </RHFSelect>

            {selectedKind === 'printer' ? (
              <>
                <Divider />
                <Typography variant="subtitle2">{t('integrations.sections.printer')}</Typography>
                {selectedProvider === 'windows-raw' ? (
                  <>
                    <RHFSelect<Values> name="connectionType" label={t('integrations.fields.connectionType')}>
                      {PRINTER_CONNECTION_TYPE_VALUES.map((connectionType) => (
                        <MenuItem key={connectionType} value={connectionType}>
                          {getPrinterConnectionLabel(connectionType)}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                    {methods.watch('connectionType') === 'socket' ? (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
                        <RHFTextField<Values>
                          name="printerHost"
                          label={t('integrations.fields.printerHost')}
                          helperText={t('integrations.fields.printerHostHint')}
                        />
                        <RHFTextField<Values>
                          name="printerPort"
                          label={t('integrations.fields.printerPort')}
                          helperText={t('integrations.fields.printerPortHint')}
                        />
                        <Tooltip title={t('integrations.actions.checkPrinterConnection')}>
                          <IconButton
                            type="button"
                            color="primary"
                            onClick={onCheckPrinter}
                            disabled={isCheckingPrinter || methods.formState.isSubmitting}
                            sx={{ mt: { sm: 1 } }}>
                            <Iconify icon={isCheckingPrinter ? 'solar:refresh-bold' : 'solar:plug-circle-bold'} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    ) : (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'flex-start' }}>
                        <RHFTextField<Values>
                          name="printerName"
                          label={t('integrations.fields.printerName')}
                          helperText={t('integrations.fields.printerNameHint')}
                        />
                        <Tooltip title={t('integrations.actions.checkPrinterConnection')}>
                          <IconButton
                            type="button"
                            color="primary"
                            onClick={onCheckPrinter}
                            disabled={isCheckingPrinter || methods.formState.isSubmitting}
                            sx={{ mt: { sm: 1 } }}>
                            <Iconify icon={isCheckingPrinter ? 'solar:refresh-bold' : 'solar:plug-circle-bold'} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </>
                ) : null}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFSelect<Values> name="paperWidthMm" label={t('integrations.fields.paperWidthMm')}>
                    {PAPER_WIDTH_VALUES.map((width) => (
                      <MenuItem key={width} value={width}>
                        {t('integrations.units.millimeter', { value: width })}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  <RHFTextField<Values> name="encoding" label={t('integrations.fields.encoding')} />
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <RHFSelect<Values> name="printMode" label={t('integrations.fields.printMode')}>
                    {PRINT_MODE_VALUES.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {t(`integrations.options.printMode.${mode}`)}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                  <RHFSelect<Values> name="qrMode" label={t('integrations.fields.qrMode')}>
                    {QR_MODE_VALUES.map((mode) => (
                      <MenuItem key={mode} value={mode}>
                        {t(`integrations.options.qrMode.${mode}`)}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                </Stack>
                {selectedPrintMode === 'raster' ? (
                  <RHFSelect<Values> name="rasterFont" label={t('integrations.fields.rasterFont')}>
                    {RASTER_FONT_VALUES.map((fontName) => (
                      <MenuItem key={fontName} value={fontName}>
                        {t(`integrations.options.rasterFont.${fontName}`)}
                      </MenuItem>
                    ))}
                  </RHFSelect>
                ) : null}
                <RHFSwitch<Values> name="cutAfterPrint" label={t('integrations.fields.cutAfterPrint')} />
              </>
            ) : null}

            {selectedKind === 'payment' ? (
              <>
                <Divider />
                <Typography variant="subtitle2">{t('integrations.sections.payment')}</Typography>
                {selectedProvider === 'marta-softpos' ? (
                  <>
                    <RHFTextField<Values> name="endpointUrl" label={t('integrations.fields.endpointUrl')} />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <RHFTextField<Values> name="taxNumber" label={t('fields.taxNumber')} />
                      <RHFTextField<Values>
                        name="amountMultiplier"
                        label={t('integrations.fields.amountMultiplier')}
                        helperText={t('integrations.fields.amountMultiplierHint')}
                      />
                    </Stack>
                    <RHFTextField<Values>
                      name="timeoutSeconds"
                      label={t('integrations.fields.timeoutSeconds')}
                      helperText={t('integrations.fields.timeoutSecondsHint')}
                    />
                    <RHFTextField<Values>
                      name="hmacSecret"
                      label={t('integrations.fields.hmacSecret')}
                      type="password"
                      helperText={t('integrations.fields.hmacSecretHint')}
                    />
                  </>
                ) : (
                  <>
                    <RHFTextField<Values> name="terminalId" label={t('fields.terminalId')} />
                    <RHFTextField<Values> name="merchantId" label={t('integrations.fields.merchantId')} />
                    <RHFTextField<Values> name="endpointUrl" label={t('integrations.fields.endpointUrl')} />
                    <RHFTextField<Values>
                      name="paymentQrUrl"
                      label={t('integrations.fields.paymentQrUrl')}
                      helperText={t('integrations.fields.paymentQrUrlHint')}
                    />
                    <RHFTextField<Values> name="apiKey" label={t('integrations.fields.apiKey')} type="password" />
                  </>
                )}
              </>
            ) : null}

            {selectedKind === 'fiscal' ? (
              <>
                <Divider />
                <Typography variant="subtitle2">{t('integrations.sections.fiscal')}</Typography>
                <RHFTextField<Values> name="taxNumber" label={t('fields.taxNumber')} />
              </>
            ) : null}

            <Divider />
            <RHFSwitch<Values> name="isEnabled" label={t('fields.status')} />
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
