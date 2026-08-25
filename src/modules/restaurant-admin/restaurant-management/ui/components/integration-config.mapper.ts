import type { AdminIntegrationConfig, AdminIntegrationConfigKind } from 'shared/api/admin-types';

export const PAPER_WIDTH_VALUES = ['80'] as const;
export const PRINTER_CONNECTION_TYPE_VALUES = ['system_printer', 'socket'] as const;
export const PRINT_MODE_VALUES = ['text', 'raster'] as const;
export const QR_MODE_VALUES = ['native', 'raster'] as const;
export const RASTER_FONT_VALUES = ['go_mono', 'inter', 'noto_sans', 'roboto_mono'] as const;

export type IntegrationConfigFormValues = {
  kind: AdminIntegrationConfigKind;
  provider: string;
  isEnabled: boolean;
  connectionType: (typeof PRINTER_CONNECTION_TYPE_VALUES)[number];
  printerName: string;
  printerHost: string;
  printerPort: string;
  paperWidthMm: (typeof PAPER_WIDTH_VALUES)[number];
  encoding: string;
  printMode: (typeof PRINT_MODE_VALUES)[number];
  qrMode: (typeof QR_MODE_VALUES)[number];
  rasterFont: (typeof RASTER_FONT_VALUES)[number];
  cutAfterPrint: boolean;
  terminalId: string;
  merchantId: string;
  cashboxId: string;
  taxNumber: string;
  endpointUrl: string;
  timeoutSeconds: string;
  factoryId: string;
  amountMultiplier: string;
  hmacSecret: string;
  apiKey: string;
  paymentQrUrl: string;
};

export const integrationConfigDefaultValues: IntegrationConfigFormValues = {
  kind: 'fiscal',
  provider: 'fiscal-drive-service',
  isEnabled: true,
  connectionType: 'system_printer',
  printerName: 'POS-80 USB',
  printerHost: '',
  printerPort: '',
  paperWidthMm: '80',
  encoding: 'cp1251',
  printMode: 'text',
  qrMode: 'native',
  rasterFont: 'go_mono',
  cutAfterPrint: true,
  terminalId: '',
  merchantId: '',
  cashboxId: '',
  taxNumber: '',
  endpointUrl: '',
  timeoutSeconds: '180',
  factoryId: '',
  amountMultiplier: '100',
  hmacSecret: '',
  apiKey: '',
  paymentQrUrl: '',
};

const MANAGED_SETTING_KEYS = new Set([
  'printer_name',
  'printerName',
  'paper_width_mm',
  'paperWidthMm',
  'cut_after_print',
  'cutAfterPrint',
  'encoding',
  'print_mode',
  'printMode',
  'qr_mode',
  'qrMode',
  'raster_font',
  'rasterFont',
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
  'factory_id',
  'factoryId',
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
  return PAPER_WIDTH_VALUES.includes(normalized as IntegrationConfigFormValues['paperWidthMm'])
    ? (normalized as IntegrationConfigFormValues['paperWidthMm'])
    : '80';
}

function readPrinterConnectionType(settings: Record<string, unknown> | undefined) {
  const value = readString(settings, ['connection_type', 'connectionType']);
  if (PRINTER_CONNECTION_TYPE_VALUES.includes(value as IntegrationConfigFormValues['connectionType'])) {
    return value as IntegrationConfigFormValues['connectionType'];
  }
  return readString(settings, ['host']) ? 'socket' : 'system_printer';
}

function readEnumSetting<T extends readonly string[]>(
  settings: Record<string, unknown> | undefined,
  keys: string[],
  values: T,
  fallback: T[number],
): T[number] {
  const value = readString(settings, keys).trim().toLowerCase();
  return values.includes(value as T[number]) ? (value as T[number]) : fallback;
}

export function integrationConfigToFormValues(item: AdminIntegrationConfig | null): IntegrationConfigFormValues {
  if (!item) {
    return { ...integrationConfigDefaultValues };
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
    printMode: readEnumSetting(settings, ['print_mode', 'printMode'], PRINT_MODE_VALUES, 'text'),
    qrMode: readEnumSetting(settings, ['qr_mode', 'qrMode'], QR_MODE_VALUES, 'native'),
    rasterFont: readEnumSetting(settings, ['raster_font', 'rasterFont'], RASTER_FONT_VALUES, 'go_mono'),
    cutAfterPrint: readBoolean(settings, ['cut_after_print', 'cutAfterPrint'], true),
    terminalId: readString(settings, ['terminal_id', 'terminalId']),
    merchantId: readString(settings, ['merchant_id', 'merchantId']),
    cashboxId: readString(settings, ['cashbox_id', 'cashboxId']),
    taxNumber: readString(settings, ['tax_number', 'taxNumber']),
    endpointUrl: readString(settings, ['endpoint_url', 'endpointUrl']),
    timeoutSeconds: String(readSetting(settings, ['timeout_seconds', 'timeoutSeconds']) ?? '180'),
    factoryId: readString(settings, ['factory_id', 'factoryId']),
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

export function buildIntegrationConfigSettings(
  values: IntegrationConfigFormValues,
  item: AdminIntegrationConfig | null,
): Record<string, unknown> {
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
      print_mode: values.printMode,
      qr_mode: values.qrMode,
      raster_font: values.rasterFont,
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
    factory_id: trimOrUndefined(values.factoryId),
    cashbox_id: trimOrUndefined(values.cashboxId),
    tax_number: trimOrUndefined(values.taxNumber),
    endpoint_url: trimOrUndefined(values.endpointUrl),
    api_key: trimOrUndefined(values.apiKey),
  };
}

export function getPrinterConnectionLabel(connectionType: IntegrationConfigFormValues['connectionType']) {
  return connectionType === 'socket' ? 'LAN TCP/IP' : 'Windows/USB';
}

export function getIntegrationSettingsSummary(row: AdminIntegrationConfig) {
  const settings = row.settings ?? {};

  if (row.kind === 'printer') {
    const connectionType = readPrinterConnectionType(settings);
    const paperWidth = readSetting(settings, ['paper_width_mm', 'paperWidthMm']) ?? '-';
    const encoding = readString(settings, ['encoding'], 'cp1251');
    const printMode = readEnumSetting(settings, ['print_mode', 'printMode'], PRINT_MODE_VALUES, 'text');
    const qrMode = readEnumSetting(settings, ['qr_mode', 'qrMode'], QR_MODE_VALUES, 'native');
    const rasterFont = readEnumSetting(settings, ['raster_font', 'rasterFont'], RASTER_FONT_VALUES, 'go_mono');
    const modes = printMode === 'raster' ? `${printMode}/${qrMode}/${rasterFont}` : `${printMode}/${qrMode}`;
    if (connectionType === 'socket') {
      const host = readString(settings, ['host'], '-');
      const port = readSetting(settings, ['port']);
      const endpoint = port ? `${host}:${port}` : host;
      return `${getPrinterConnectionLabel(connectionType)}: ${endpoint} | ${paperWidth}mm | ${encoding} | ${modes}`;
    }
    const printerName = readString(settings, ['printer_name', 'printerName'], '-');
    return `${getPrinterConnectionLabel(connectionType)}: ${printerName} | ${paperWidth}mm | ${encoding} | ${modes}`;
  }

  if (row.kind === 'payment') {
    if (row.provider === 'marta-softpos') {
      const endpointUrl = readString(settings, ['endpoint_url', 'endpointUrl'], '-');
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

  const taxNumber = readString(settings, ['tax_number', 'taxNumber'], '-');
  return `Fiscal Drive | STIR: ${taxNumber}`;
}
