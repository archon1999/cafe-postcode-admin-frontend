import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type {
  AdminIntegrationConfig,
  AdminIntegrationConfigKind,
  AdminIntegrationConfigPayload,
} from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Form, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useCreateIntegrationConfigMutation,
  useDeleteIntegrationConfigMutation,
  useGetIntegrationConfigsListQuery,
  useUpdateIntegrationConfigMutation,
} from '../../application';

import { OrganizationsGridToolbar } from './OrganizationsGridToolbar';
import { RestaurantManagementAccordion } from './RestaurantManagementAccordion';

const INTEGRATION_KIND_VALUES = ['printer', 'payment', 'fiscal'] as const;
const PAPER_WIDTH_VALUES = ['58', '80'] as const;
const PRINTER_CONNECTION_TYPE_VALUES = ['system_printer', 'socket'] as const;

const PROVIDER_OPTIONS: Record<AdminIntegrationConfigKind, { value: string; label: string }[]> = {
  printer: [{ value: 'windows-raw', label: 'Windows raw' }],
  payment: [{ value: 'marta-softpos', label: 'MARTA SoftPOS' }],
  fiscal: [{ value: 'unikassa', label: 'Unikassa' }],
};

const LOCAL_AGENT_PRINT_URL = 'http://127.0.0.1:18181';
const stringValue = z.preprocess((value) => (value === undefined || value === null ? '' : String(value)), z.string());

const MANAGED_SETTING_KEYS = new Set([
  'printer_name',
  'printerName',
  'paper_width_mm',
  'paperWidthMm',
  'cut_after_print',
  'cutAfterPrint',
  'encoding',
  'connection_type',
  'connectionType',
  'transport',
  'transportType',
  'use_local_agent',
  'useLocalAgent',
  'host',
  'port',
  'terminal_id',
  'terminalId',
  'merchant_id',
  'merchantId',
  'cashbox_id',
  'cashboxId',
  'tax_number',
  'taxNumber',
  'endpoint_url',
  'endpointUrl',
  'timeout_seconds',
  'timeoutSeconds',
  'amount_multiplier',
  'amountMultiplier',
  'hmac_secret',
  'hmacSecret',
  'api_key',
  'apiKey',
  'payment_qr_url',
  'paymentQrUrl',
]);

const schema = z
  .object({
    kind: z.enum(INTEGRATION_KIND_VALUES),
    provider: z.string().min(1),
    isEnabled: z.boolean(),
    connectionType: z.enum(PRINTER_CONNECTION_TYPE_VALUES),
    printerName: stringValue,
    printerHost: stringValue,
    printerPort: stringValue,
    paperWidthMm: z.enum(PAPER_WIDTH_VALUES),
    encoding: z.string(),
    cutAfterPrint: z.boolean(),
    terminalId: z.string(),
    merchantId: z.string(),
    cashboxId: z.string(),
    taxNumber: z.string(),
    endpointUrl: z.string(),
    timeoutSeconds: z.string(),
    amountMultiplier: z.string(),
    hmacSecret: z.string(),
    apiKey: z.string(),
    paymentQrUrl: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.kind === 'printer' && values.provider === 'windows-raw') {
      if (values.connectionType === 'socket') {
        if (!values.printerHost.trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['printerHost'],
            message: 'LAN printer IP manzilini kiriting',
          });
        }
        const port = Number(values.printerPort);
        if (values.printerPort.trim() && (!Number.isInteger(port) || port <= 0)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['printerPort'],
            message: "Printer porti bo'sh yoki musbat butun son bo'lishi kerak",
          });
        }
      } else if (!values.printerName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['printerName'],
          message: 'Printer nomini kiriting',
        });
      }
    }

    if (values.kind === 'payment' && values.provider === 'marta-softpos') {
      const timeoutSeconds = Number(values.timeoutSeconds);
      if (!Number.isInteger(timeoutSeconds) || timeoutSeconds <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['timeoutSeconds'],
          message: "Timeout musbat butun son bo'lishi kerak",
        });
      }

      const amountMultiplier = Number(values.amountMultiplier);
      if (!Number.isInteger(amountMultiplier) || amountMultiplier <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['amountMultiplier'],
          message: "Amount multiplier musbat butun son bo'lishi kerak",
        });
      }
    }
  });

type Values = z.infer<typeof schema>;

const defaultValues: Values = {
  kind: 'printer',
  provider: 'windows-raw',
  isEnabled: true,
  connectionType: 'system_printer',
  printerName: 'POS-80 USB',
  printerHost: '',
  printerPort: '',
  paperWidthMm: '80',
  encoding: 'cp1251',
  cutAfterPrint: true,
  terminalId: '',
  merchantId: '',
  cashboxId: '',
  taxNumber: '',
  endpointUrl: '',
  timeoutSeconds: '180',
  amountMultiplier: '100',
  hmacSecret: '',
  apiKey: '',
  paymentQrUrl: '',
};

function readSetting(settings: Record<string, unknown> | undefined, keys: string[]) {
  for (const key of keys) {
    const value = settings?.[key];
    if (value !== undefined && value !== null) {
      return value;
    }
  }

  return undefined;
}

function readString(settings: Record<string, unknown> | undefined, keys: string[], fallback = '') {
  const value = readSetting(settings, keys);
  return typeof value === 'string' ? value : fallback;
}

function readBoolean(settings: Record<string, unknown> | undefined, keys: string[], fallback: boolean) {
  const value = readSetting(settings, keys);
  return typeof value === 'boolean' ? value : fallback;
}

function readPaperWidth(settings: Record<string, unknown> | undefined) {
  const value = readSetting(settings, ['paper_width_mm', 'paperWidthMm']);
  const normalized = String(value ?? '80');
  return PAPER_WIDTH_VALUES.includes(normalized as Values['paperWidthMm'])
    ? (normalized as Values['paperWidthMm'])
    : '80';
}

function readPrinterConnectionType(settings: Record<string, unknown> | undefined) {
  const value = readString(settings, ['connection_type', 'connectionType']);
  if (PRINTER_CONNECTION_TYPE_VALUES.includes(value as Values['connectionType'])) {
    return value as Values['connectionType'];
  }
  return readString(settings, ['host']) ? 'socket' : 'system_printer';
}

function valuesFromItem(item: AdminIntegrationConfig | null): Values {
  if (!item) {
    return {
      ...defaultValues,
    };
  }

  const settings = item.settings ?? {};

  return {
    kind: item.kind,
    provider: item.provider,
    isEnabled: item.isEnabled,
    connectionType: readPrinterConnectionType(settings),
    printerName: readString(settings, ['printer_name', 'printerName'], 'POS-80 USB'),
    printerHost: readString(settings, ['host']),
    printerPort: String(readSetting(settings, ['port']) ?? ''),
    paperWidthMm: readPaperWidth(settings),
    encoding: readString(settings, ['encoding'], 'cp1251'),
    cutAfterPrint: readBoolean(settings, ['cut_after_print', 'cutAfterPrint'], true),
    terminalId: readString(settings, ['terminal_id', 'terminalId']),
    merchantId: readString(settings, ['merchant_id', 'merchantId']),
    cashboxId: readString(settings, ['cashbox_id', 'cashboxId']),
    taxNumber: readString(settings, ['tax_number', 'taxNumber']),
    endpointUrl: readString(settings, ['endpoint_url', 'endpointUrl']),
    timeoutSeconds: String(readSetting(settings, ['timeout_seconds', 'timeoutSeconds']) ?? '180'),
    amountMultiplier: String(readSetting(settings, ['amount_multiplier', 'amountMultiplier']) ?? '100'),
    hmacSecret: readString(settings, ['hmac_secret', 'hmacSecret']),
    apiKey: readString(settings, ['api_key', 'apiKey']),
    paymentQrUrl: readString(settings, ['payment_qr_url', 'paymentQrUrl']),
  };
}

function trimOrUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function buildSettings(values: Values, item: AdminIntegrationConfig | null): Record<string, unknown> {
  const base = Object.fromEntries(
    Object.entries(item?.settings ?? {}).filter(([key]) => !MANAGED_SETTING_KEYS.has(key)),
  );

  if (values.kind === 'printer') {
    const settings: Record<string, unknown> = {
      ...base,
      connection_type: values.connectionType,
      paper_width_mm: Number(values.paperWidthMm),
      cut_after_print: values.cutAfterPrint,
      encoding: values.encoding.trim() || 'cp1251',
    };

    if (values.provider === 'windows-raw' && values.connectionType === 'socket') {
      settings.host = values.printerHost.trim();
      const printerPort = values.printerPort.trim();
      if (printerPort) {
        settings.port = Number(printerPort);
      }
      settings.transport = 'local-agent';
      settings.code_page = 46;
    } else if (values.provider === 'windows-raw') {
      settings.printer_name = values.printerName.trim();
      settings.transport = 'local-agent';
      settings.code_page = 46;
    } else if (values.printerName.trim()) {
      settings.printer_name = values.printerName.trim();
    }

    return settings;
  }

  if (values.kind === 'payment') {
    const settings: Record<string, unknown> = {
      ...base,
      terminal_id: trimOrUndefined(values.terminalId),
      merchant_id: trimOrUndefined(values.merchantId),
      endpoint_url: trimOrUndefined(values.endpointUrl),
      api_key: trimOrUndefined(values.apiKey),
      payment_qr_url: trimOrUndefined(values.paymentQrUrl),
    };

    if (values.provider === 'marta-softpos') {
      settings.timeout_seconds = Number(values.timeoutSeconds || 180);
      settings.amount_multiplier = Number(values.amountMultiplier || 100);
      settings.tax_number = trimOrUndefined(values.taxNumber);
      settings.hmac_secret = trimOrUndefined(values.hmacSecret);
    }

    return settings;
  }

  return {
    ...base,
    terminal_id: trimOrUndefined(values.terminalId),
    cashbox_id: trimOrUndefined(values.cashboxId),
    tax_number: trimOrUndefined(values.taxNumber),
    endpoint_url: trimOrUndefined(values.endpointUrl),
    api_key: trimOrUndefined(values.apiKey),
  };
}

function getKindLabel(kind: AdminIntegrationConfigKind) {
  const labels: Record<AdminIntegrationConfigKind, string> = {
    printer: 'Printer',
    payment: "To'lov",
    fiscal: 'Fiskal',
  };
  return labels[kind];
}

function getPrinterConnectionLabel(connectionType: Values['connectionType']) {
  return connectionType === 'socket' ? 'LAN TCP/IP' : 'Windows/USB';
}

function getSettingsSummary(row: AdminIntegrationConfig) {
  const settings = row.settings ?? {};

  if (row.kind === 'printer') {
    const connectionType = readPrinterConnectionType(settings);
    const paperWidth = readSetting(settings, ['paper_width_mm', 'paperWidthMm']) ?? '-';
    const encoding = readString(settings, ['encoding'], 'cp1251');
    if (connectionType === 'socket') {
      const host = readString(settings, ['host'], '-');
      const port = readSetting(settings, ['port']);
      const endpoint = port ? `${host}:${port}` : host;
      return `${getPrinterConnectionLabel(connectionType)}: ${endpoint} | ${paperWidth}mm | ${encoding}`;
    }
    const printerName = readString(settings, ['printer_name', 'printerName'], '-');
    return `${getPrinterConnectionLabel(connectionType)}: ${printerName} | ${paperWidth}mm | ${encoding}`;
  }

  if (row.kind === 'payment') {
    if (row.provider === 'marta-softpos') {
      const endpointUrl = readString(settings, ['endpoint_url', 'endpointUrl'], 'auto-discovery');
      const taxNumber = readString(settings, ['tax_number', 'taxNumber'], '-');
      const amountMultiplier = readSetting(settings, ['amount_multiplier', 'amountMultiplier']) ?? '100';
      const timeoutSeconds = readSetting(settings, ['timeout_seconds', 'timeoutSeconds']) ?? '180';
      return `MARTA: ${endpointUrl} | STIR: ${taxNumber} | x${amountMultiplier} | ${timeoutSeconds}s`;
    }

    const terminalId = readString(settings, ['terminal_id', 'terminalId'], '-');
    const merchantId = readString(settings, ['merchant_id', 'merchantId'], '-');
    const endpointUrl = readString(settings, ['endpoint_url', 'endpointUrl'], '-');
    return `Terminal: ${terminalId} | Merchant: ${merchantId} | ${endpointUrl}`;
  }

  const terminalId = readString(settings, ['terminal_id', 'terminalId'], '-');
  const cashboxId = readString(settings, ['cashbox_id', 'cashboxId'], '-');
  const taxNumber = readString(settings, ['tax_number', 'taxNumber'], '-');
  return `Terminal: ${terminalId} | Kassa: ${cashboxId} | STIR: ${taxNumber}`;
}

async function checkPrinterConnection(values: Values) {
  const response = await fetch(`${LOCAL_AGENT_PRINT_URL}/printer/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      connectionType: values.connectionType,
      printerName: values.printerName.trim() || undefined,
      host: values.printerHost.trim() || undefined,
      port: values.printerPort.trim() ? Number(values.printerPort) : undefined,
    }),
  });

  const result = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    printerName?: string;
    host?: string;
    port?: number;
  };
  if (!response.ok || !result.ok) {
    throw new Error(result.error || 'Local agent printer connection check failed.');
  }
  return result;
}

function RestaurantIntegrationDialog({
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
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues,
  });
  const selectedKind = methods.watch('kind');
  const selectedProvider = methods.watch('provider');
  const providerOptions = useMemo(() => {
    const options = PROVIDER_OPTIONS[selectedKind];
    if (item?.kind === selectedKind && item.provider && !options.some((option) => option.value === item.provider)) {
      return [{ value: item.provider, label: item.provider }, ...options];
    }
    return options;
  }, [item?.kind, item?.provider, selectedKind]);

  useEffect(() => {
    methods.reset(valuesFromItem(item));
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
        settings: buildSettings(values, item),
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
          : result.printerName ?? values.printerName;
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
                <RHFSwitch<Values> name="cutAfterPrint" label={t('integrations.fields.cutAfterPrint')} />
              </>
            ) : null}

            {selectedKind === 'payment' ? (
              <>
                <Divider />
                <Typography variant="subtitle2">{t('integrations.sections.payment')}</Typography>
                {selectedProvider === 'marta-softpos' ? (
                  <>
                    <RHFTextField<Values>
                      name="endpointUrl"
                      label={t('integrations.fields.endpointUrl')}
                      helperText="Bo'sh qoldirilsa local agent MARTA terminalni avtomatik topadi"
                    />
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
                <RHFTextField<Values> name="terminalId" label={t('fields.terminalId')} />
                <RHFTextField<Values> name="cashboxId" label={t('integrations.fields.cashboxId')} />
                <RHFTextField<Values> name="taxNumber" label={t('fields.taxNumber')} />
                <RHFTextField<Values>
                  name="endpointUrl"
                  label={t('integrations.fields.endpointUrl')}
                  helperText="Bo'sh qoldirilsa local agent Unikassa terminalni avtomatik topadi"
                />
                <RHFTextField<Values> name="apiKey" label={t('integrations.fields.apiKey')} type="password" />
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

export function RestaurantIntegrationsSection({
  defaultExpanded = false,
  title,
  description,
  actionLabel,
  searchPlaceholder,
  layoutMode = 'accordion',
  createDialogOpen,
  onCreateDialogOpenChange,
}: {
  defaultExpanded?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  searchPlaceholder?: string;
  layoutMode?: 'accordion' | 'page';
  createDialogOpen?: boolean;
  onCreateDialogOpenChange?: (open: boolean) => void;
}) {
  const { t, currentLang } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const deleteMutation = useDeleteIntegrationConfigMutation();

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [editingRow, setEditingRow] = useState<AdminIntegrationConfig | null>(null);
  const [rowToDelete, setRowToDelete] = useState<AdminIntegrationConfig | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const setDialogOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        return;
      }
      if (onCreateDialogOpenChange) {
        onCreateDialogOpenChange(false);
      }
      setIsCreateDialogOpen(false);
    },
    [onCreateDialogOpenChange],
  );

  const query = useGetIntegrationConfigsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    kindIn: kinds.length ? kinds.join(',') : undefined,
    isEnabled: statuses.length === 1 ? statuses[0] === 'enabled' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const kindOptions = useMemo<FilterOption[]>(
    () => INTEGRATION_KIND_VALUES.map((kind) => ({ value: kind, label: getKindLabel(kind) })),
    [],
  );
  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'enabled', label: tCommon('status.active') },
      { value: 'disabled', label: tCommon('status.inactive') },
    ],
    [tCommon],
  );

  const columns = useMemo<GridColDef<AdminIntegrationConfig>[]>(
    () => [
      {
        field: 'kind',
        headerName: t('fields.kind'),
        minWidth: 130,
        flex: 0.5,
        renderCell: ({ row }) => <Chip size="small" label={getKindLabel(row.kind)} variant="soft" />,
      },
      {
        field: 'provider',
        headerName: t('integrations.fields.provider'),
        minWidth: 180,
        flex: 0.8,
      },
      {
        field: 'settings',
        headerName: t('integrations.fields.settings'),
        minWidth: 300,
        flex: 1.3,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {getSettingsSummary(row)}
          </Typography>
        ),
      },
      {
        field: 'isEnabled',
        headerName: t('fields.status'),
        minWidth: 120,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isEnabled ? tCommon('status.active') : tCommon('status.inactive')}
            color={row.isEnabled ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        getActions: (params) => [
          <CustomGridActionsCellItem
            actionKind="edit"
            key="edit"
            label={t('actions.edit')}
            icon={<Iconify icon="solar:pen-bold" />}
            onClick={() => {
              setEditingRow(params.row);
              setDialogOpen(true);
            }}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete')}
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setRowToDelete(params.row)}
          />,
        ],
      },
    ],
    [setDialogOpen, t, tCommon],
  );

  const hasActiveFilters = Boolean(search || kinds.length || statuses.length);
  const isDialogOpen = Boolean(editingRow) || Boolean(createDialogOpen) || isCreateDialogOpen;

  const openCreateDialog = () => {
    setEditingRow(null);
    if (onCreateDialogOpenChange) {
      onCreateDialogOpenChange(true);
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingRow(null);
    if (onCreateDialogOpenChange) {
      onCreateDialogOpenChange(false);
    }
    setIsCreateDialogOpen(false);
  };

  const grid = (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        ...(layoutMode === 'page' ? { flex: 1 } : { height: { xs: 520, md: 600 } }),
      }}>
      <DataGrid
        checkboxSelection
        rows={query.data?.data ?? []}
        columns={columns}
        rowCount={query.data?.total ?? 0}
        loading={query.isLoading}
        localeText={localeText}
        paginationMode="server"
        sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={setSelectedRows}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        disableColumnMenu
        slots={{
          noRowsOverlay: () => (
            <DataGridEmptyState
              hasActiveFilters={hasActiveFilters}
              noData={{
                title: t('empty.integrations.noData.title'),
                description: t('empty.integrations.noData.description'),
              }}
              noResults={{
                title: t('empty.integrations.noResults.title'),
                description: t('empty.integrations.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{
                title: t('empty.integrations.noData.title'),
                description: t('empty.integrations.noData.description'),
              }}
              noResults={{
                title: t('empty.integrations.noResults.title'),
                description: t('empty.integrations.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <OrganizationsGridToolbar
              searchLabel={t('filters.search')}
              searchPlaceholder={searchPlaceholder ?? t('filters.searchIntegrationsPlaceholder')}
              clearSearchLabel={t('filters.clearSearch')}
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              onClearSearch={() => {
                setSearch('');
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              filters={[
                {
                  id: 'kinds',
                  label: t('fields.kind'),
                  value: kinds,
                  options: kindOptions,
                  onApply: (values) => {
                    setKinds(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  },
                  testId: 'restaurant-integrations-kind-filter',
                  emptyLabel: t('filters.all'),
                },
                {
                  id: 'statuses',
                  label: t('filters.status'),
                  value: statuses,
                  options: statusOptions,
                  onApply: (values) => {
                    setStatuses(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  },
                  testId: 'restaurant-integrations-status-filter',
                  emptyLabel: t('filters.all'),
                },
              ]}
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
              onSave={setColumnVisibilityModel}
            />
          ),
        }}
        sx={{
          border: 'none',
          [`& .${gridClasses.cell}`]: { display: 'flex', alignItems: 'center' },
          '& .MuiDataGrid-toolbarContainer': { px: 2.5, py: 2 },
        }}
      />
    </Card>
  );

  return (
    <>
      {layoutMode === 'page' ? (
        grid
      ) : (
        <RestaurantManagementAccordion
          icon="solar:plug-circle-bold-duotone"
          title={title ?? t('pages.integrations.title')}
          description={description ?? t('restaurantManagement.sections.integrations.description')}
          total={query.data?.total ?? 0}
          actionLabel={actionLabel ?? t('actions.createIntegration')}
          onActionClick={openCreateDialog}
          defaultExpanded={defaultExpanded}>
          {grid}
        </RestaurantManagementAccordion>
      )}

      <RestaurantIntegrationDialog open={isDialogOpen} item={editingRow} onClose={closeDialog} />
      <ConfirmDialog
        open={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        title={t('dialogs.deleteIntegration.title')}
        content={t('dialogs.deleteIntegration.description', {
          name: rowToDelete ? `${getKindLabel(rowToDelete.kind)}: ${rowToDelete.provider}` : '',
        })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteMutation.isPending}
            onClick={async () => {
              if (!rowToDelete) {
                return;
              }
              await deleteMutation.mutateAsync(rowToDelete.id);
              setRowToDelete(null);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />
    </>
  );
}
