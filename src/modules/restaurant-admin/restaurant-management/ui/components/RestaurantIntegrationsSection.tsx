import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type {
  AdminFiscalDevice,
  AdminIntegrationConfig,
  AdminIntegrationConfigKind,
  AdminIntegrationConfigMode,
  AdminIntegrationConfigPayload,
} from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import { Form, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useCreateIntegrationConfigMutation,
  useDetectFiscalDevicesMutation,
  useGetIntegrationConfigsListQuery,
  useUpdateIntegrationConfigMutation,
} from '../../application';

import { OrganizationsGridToolbar } from './OrganizationsGridToolbar';
import { RestaurantManagementAccordion } from './RestaurantManagementAccordion';

const INTEGRATION_KIND_VALUES = ['printer', 'payment', 'fiscal'] as const;
const INTEGRATION_MODE_VALUES = ['mock', 'live'] as const;
const PAPER_WIDTH_VALUES = ['58', '80'] as const;
const PRINTER_CONNECTION_TYPE_VALUES = ['system_printer', 'socket'] as const;

const PROVIDER_OPTIONS: Record<AdminIntegrationConfigKind, { value: string; label: string }[]> = {
  printer: [
    { value: 'qz-tray', label: 'QZ Tray' },
    { value: 'windows-raw', label: 'Windows raw' },
    { value: 'mock-printer', label: 'Mock printer' },
  ],
  payment: [
    { value: 'mock-payment', label: 'Mock payment' },
    { value: 'manual-qr', label: 'Manual QR' },
    { value: 'custom-payment', label: 'Custom payment' },
  ],
  fiscal: [
    { value: 'soliq-ofd', label: 'Soliq OFD' },
    { value: 'mock-fiscal', label: 'Mock fiscal' },
  ],
};

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
  'api_key',
  'apiKey',
  'payment_qr_url',
  'paymentQrUrl',
]);

const schema = z
  .object({
    kind: z.enum(INTEGRATION_KIND_VALUES),
    provider: z.string().min(1),
    mode: z.enum(INTEGRATION_MODE_VALUES),
    isEnabled: z.boolean(),
    connectionType: z.enum(PRINTER_CONNECTION_TYPE_VALUES),
    printerName: z.string(),
    printerHost: z.string(),
    printerPort: z.string(),
    paperWidthMm: z.enum(PAPER_WIDTH_VALUES),
    encoding: z.string(),
    cutAfterPrint: z.boolean(),
    terminalId: z.string(),
    merchantId: z.string(),
    cashboxId: z.string(),
    taxNumber: z.string(),
    endpointUrl: z.string(),
    apiKey: z.string(),
    paymentQrUrl: z.string(),
  })
  .superRefine((values, ctx) => {
    if (values.kind !== 'printer' || values.mode !== 'live') {
      return;
    }

    if (values.provider === 'qz-tray' && values.connectionType === 'socket') {
      if (!values.printerHost.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['printerHost'],
          message: 'Printer IP manzilini kiriting',
        });
      }

      const port = Number(values.printerPort);
      if (!Number.isInteger(port) || port <= 0 || port > 65535) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['printerPort'],
          message: "Port 1 dan 65535 gacha bo'lishi kerak",
        });
      }
      return;
    }

    if (values.provider === 'qz-tray' || values.provider === 'windows-raw') {
      if (!values.printerName.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['printerName'],
          message: 'Printer nomini kiriting',
        });
      }
    }
  });

type Values = z.infer<typeof schema>;

const defaultValues: Values = {
  kind: 'printer',
  provider: 'qz-tray',
  mode: 'live',
  isEnabled: true,
  connectionType: 'system_printer',
  printerName: 'POS-80 USB',
  printerHost: '',
  printerPort: '9100',
  paperWidthMm: '80',
  encoding: 'cp437',
  cutAfterPrint: true,
  terminalId: '',
  merchantId: '',
  cashboxId: '',
  taxNumber: '',
  endpointUrl: '',
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
      provider: 'soliq-ofd',
    };
  }

  const settings = item.settings ?? {};

  return {
    kind: item.kind,
    provider: item.provider,
    mode: item.mode,
    isEnabled: item.isEnabled,
    connectionType: readPrinterConnectionType(settings),
    printerName: readString(settings, ['printer_name', 'printerName'], 'POS-80 USB'),
    printerHost: readString(settings, ['host']),
    printerPort: String(readSetting(settings, ['port']) ?? '9100'),
    paperWidthMm: readPaperWidth(settings),
    encoding: readString(settings, ['encoding'], 'cp437'),
    cutAfterPrint: readBoolean(settings, ['cut_after_print', 'cutAfterPrint'], true),
    terminalId: readString(settings, ['terminal_id', 'terminalId']),
    merchantId: readString(settings, ['merchant_id', 'merchantId']),
    cashboxId: readString(settings, ['cashbox_id', 'cashboxId']),
    taxNumber: readString(settings, ['tax_number', 'taxNumber']),
    endpointUrl: readString(settings, ['endpoint_url', 'endpointUrl']),
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
      paper_width_mm: Number(values.paperWidthMm),
      cut_after_print: values.cutAfterPrint,
      encoding: values.encoding.trim() || 'cp437',
    };

    if (values.provider === 'qz-tray') {
      settings.connection_type = values.connectionType;
      if (values.connectionType === 'socket') {
        settings.host = values.printerHost.trim();
        settings.port = Number(values.printerPort || 9100);
      } else {
        settings.printer_name = values.printerName.trim();
      }
    } else if (values.provider === 'windows-raw') {
      settings.printer_name = values.printerName.trim();
    } else if (values.printerName.trim()) {
      settings.printer_name = values.printerName.trim();
    }

    return settings;
  }

  if (values.kind === 'payment') {
    return {
      ...base,
      terminal_id: trimOrUndefined(values.terminalId),
      merchant_id: trimOrUndefined(values.merchantId),
      endpoint_url: trimOrUndefined(values.endpointUrl),
      api_key: trimOrUndefined(values.apiKey),
      payment_qr_url: trimOrUndefined(values.paymentQrUrl),
    };
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

function getModeLabel(mode: AdminIntegrationConfigMode) {
  return mode === 'live' ? 'Live' : 'Mock';
}

function getPrinterConnectionLabel(connectionType: Values['connectionType']) {
  return connectionType === 'socket' ? 'LAN TCP/IP' : 'Windows/USB';
}

function getSettingsSummary(row: AdminIntegrationConfig) {
  const settings = row.settings ?? {};

  if (row.kind === 'printer') {
    const paperWidth = readSetting(settings, ['paper_width_mm', 'paperWidthMm']) ?? '-';
    const encoding = readString(settings, ['encoding'], 'cp437');
    if (row.provider === 'qz-tray') {
      const connectionType = readPrinterConnectionType(settings);
      if (connectionType === 'socket') {
        const host = readString(settings, ['host'], '-');
        const port = readSetting(settings, ['port']) ?? '9100';
        return `${getPrinterConnectionLabel(connectionType)}: ${host}:${port} | ${paperWidth}mm | ${encoding}`;
      }
      const printerName = readString(settings, ['printer_name', 'printerName'], '-');
      return `${getPrinterConnectionLabel(connectionType)}: ${printerName} | ${paperWidth}mm | ${encoding}`;
    }

    const printerName = readString(settings, ['printer_name', 'printerName'], '-');
    return `${printerName} | ${paperWidth}mm | ${encoding}`;
  }

  if (row.kind === 'payment') {
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
  const detectFiscalDevicesMutation = useDetectFiscalDevicesMutation();
  const updateMutation = useUpdateIntegrationConfigMutation(item?.id ?? '');

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues,
  });
  const [detectedFiscalDevices, setDetectedFiscalDevices] = useState<AdminFiscalDevice[]>([]);
  const [detectError, setDetectError] = useState('');

  const selectedKind = methods.watch('kind');
  const selectedProvider = methods.watch('provider');
  const selectedConnectionType = methods.watch('connectionType');
  const endpointUrl = methods.watch('endpointUrl');
  const selectedTerminalId = methods.watch('terminalId');
  const providerOptions = useMemo(() => {
    const options = PROVIDER_OPTIONS[selectedKind];
    if (item?.kind === selectedKind && item.provider && !options.some((option) => option.value === item.provider)) {
      return [{ value: item.provider, label: item.provider }, ...options];
    }
    return options;
  }, [item?.kind, item?.provider, selectedKind]);

  useEffect(() => {
    methods.reset(valuesFromItem(item));
    setDetectedFiscalDevices([]);
    setDetectError('');
  }, [item, methods, open]);

  useEffect(() => {
    if (!providerOptions.some((option) => option.value === selectedProvider)) {
      methods.setValue('provider', providerOptions[0]?.value ?? '');
    }
  }, [methods, providerOptions, selectedProvider]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload: AdminIntegrationConfigPayload = {
      kind: values.kind,
      provider: values.provider.trim(),
      mode: values.mode,
      isEnabled: values.isEnabled,
      settings: buildSettings(values, item),
    };

    if (isEditMode && item) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    onClose();
  });

  const detectFiscalDevices = async () => {
    setDetectError('');
    setDetectedFiscalDevices([]);

    try {
      const devices = await detectFiscalDevicesMutation.mutateAsync(endpointUrl.trim() || undefined);
      setDetectedFiscalDevices(devices);
      if (devices.length === 1 && devices[0]?.terminalId) {
        methods.setValue('terminalId', devices[0].terminalId, { shouldDirty: true, shouldTouch: true });
      }
      if (!devices.length) {
        setDetectError('Fiscal qurilma topilmadi.');
      }
    } catch (error) {
      setDetectError(error instanceof Error ? error.message : "Fiscal qurilmalarni aniqlab bo'lmadi.");
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
              <RHFSelect<Values> name="mode" label={t('fields.mode')}>
                {INTEGRATION_MODE_VALUES.map((mode) => (
                  <MenuItem key={mode} value={mode}>
                    {getModeLabel(mode)}
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
                {selectedProvider === 'qz-tray' ? (
                  <>
                    <RHFSelect<Values> name="connectionType" label={t('integrations.fields.connectionType')}>
                      {PRINTER_CONNECTION_TYPE_VALUES.map((connectionType) => (
                        <MenuItem key={connectionType} value={connectionType}>
                          {getPrinterConnectionLabel(connectionType)}
                        </MenuItem>
                      ))}
                    </RHFSelect>
                    {selectedConnectionType === 'socket' ? (
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
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
                      </Stack>
                    ) : (
                      <RHFTextField<Values>
                        name="printerName"
                        label={t('integrations.fields.printerName')}
                        helperText={t('integrations.fields.printerNameHint')}
                      />
                    )}
                  </>
                ) : null}
                {selectedProvider === 'windows-raw' ? (
                  <RHFTextField<Values>
                    name="printerName"
                    label={t('integrations.fields.printerName')}
                    helperText={t('integrations.fields.printerNameHint')}
                  />
                ) : null}
                {selectedProvider !== 'mock-printer' ? (
                  <>
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
              </>
            ) : null}

            {selectedKind === 'payment' ? (
              <>
                <Divider />
                <Typography variant="subtitle2">{t('integrations.sections.payment')}</Typography>
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
            ) : null}

            {selectedKind === 'fiscal' ? (
              <>
                <Divider />
                <Typography variant="subtitle2">{t('integrations.sections.fiscal')}</Typography>
                <RHFTextField<Values> name="terminalId" label={t('fields.terminalId')} />
                {selectedProvider === 'soliq-ofd' ? (
                  <>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={detectFiscalDevices}
                        loading={detectFiscalDevicesMutation.isPending}>
                        Terminallarni aniqlash
                      </Button>
                    </Stack>
                    {detectError ? <Alert severity="warning">{detectError}</Alert> : null}
                    {detectedFiscalDevices.length ? (
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          Topilgan terminallar
                        </Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                          {detectedFiscalDevices.map((device) => {
                            const isSelected = selectedTerminalId.trim() === device.terminalId;
                            return (
                              <Button
                                key={device.factoryId}
                                variant={isSelected ? 'contained' : 'outlined'}
                                color={isSelected ? 'black' : 'inherit'}
                                onClick={() => {
                                  methods.setValue('terminalId', device.terminalId, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                  });
                                }}>
                                {device.terminalId || device.factoryId}
                              </Button>
                            );
                          })}
                        </Stack>
                        {detectedFiscalDevices.map((device) => {
                          const meta = [device.readerName, device.description, device.appletVersion]
                            .filter(Boolean)
                            .join(' | ');
                          return (
                            <Typography key={`${device.factoryId}-meta`} variant="caption" color="text.secondary">
                              {device.terminalId || device.factoryId}
                              {meta ? ` - ${meta}` : ''}
                              {device.locked ? ' - Locked' : ''}
                              {device.posLocked ? ' - POS locked' : ''}
                            </Typography>
                          );
                        })}
                      </Stack>
                    ) : null}
                  </>
                ) : null}
                <RHFTextField<Values> name="cashboxId" label={t('integrations.fields.cashboxId')} />
                <RHFTextField<Values> name="taxNumber" label={t('fields.taxNumber')} />
                <RHFTextField<Values> name="endpointUrl" label={t('integrations.fields.endpointUrl')} />
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

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [modes, setModes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [editingRow, setEditingRow] = useState<AdminIntegrationConfig | null>(null);
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
    modeIn: modes.length ? modes.join(',') : undefined,
    isEnabled: statuses.length === 1 ? statuses[0] === 'enabled' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const kindOptions = useMemo<FilterOption[]>(
    () => INTEGRATION_KIND_VALUES.map((kind) => ({ value: kind, label: getKindLabel(kind) })),
    [],
  );
  const modeOptions = useMemo<FilterOption[]>(
    () => INTEGRATION_MODE_VALUES.map((mode) => ({ value: mode, label: getModeLabel(mode) })),
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
        field: 'mode',
        headerName: t('fields.mode'),
        minWidth: 120,
        flex: 0.4,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={getModeLabel(row.mode)}
            color={row.mode === 'live' ? 'success' : 'default'}
            variant="soft"
          />
        ),
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
        ],
      },
    ],
    [setDialogOpen, t, tCommon],
  );

  const hasActiveFilters = Boolean(search || kinds.length || modes.length || statuses.length);
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
                  id: 'modes',
                  label: t('fields.mode'),
                  value: modes,
                  options: modeOptions,
                  onApply: (values) => {
                    setModes(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  },
                  testId: 'restaurant-integrations-mode-filter',
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
    </>
  );
}
