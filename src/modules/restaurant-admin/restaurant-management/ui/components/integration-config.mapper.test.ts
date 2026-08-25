import { describe, expect, it } from 'vitest';

import type { AdminIntegrationConfig } from 'shared/api/admin-types';

import {
  buildIntegrationConfigSettings,
  getIntegrationSettingsSummary,
  integrationConfigDefaultValues,
  integrationConfigToFormValues,
} from './integration-config.mapper';

function integration(overrides: Partial<AdminIntegrationConfig>): AdminIntegrationConfig {
  return {
    id: 'integration-1',
    kind: 'fiscal',
    provider: 'fiscal-drive-service',
    isEnabled: true,
    settings: {},
    ...overrides,
  };
}

describe('integration config form mapper', () => {
  it('returns the unchanged create defaults as a fresh object', () => {
    const values = integrationConfigToFormValues(null);

    expect(values).toEqual(integrationConfigDefaultValues);
    expect(values).not.toBe(integrationConfigDefaultValues);
  });

  it('hydrates legacy printer aliases and canonicalizes a socket printer without losing extensions', () => {
    const item = integration({
      kind: 'printer',
      provider: 'windows-raw',
      settings: {
        connectionType: 'socket',
        paperWidthMm: 80,
        cutAfterPrint: false,
        host: '192.168.1.50',
        port: 9100,
        encoding: 'cp866',
        printMode: 'raster',
        qrMode: 'raster',
        rasterFont: 'noto_sans',
        printerName: 'obsolete',
        vendor_extension: 'keep-me',
      },
    });

    const values = integrationConfigToFormValues(item);

    expect(values).toMatchObject({
      connectionType: 'socket',
      printerHost: '192.168.1.50',
      printerPort: '9100',
      paperWidthMm: '80',
      encoding: 'cp866',
      printMode: 'raster',
      qrMode: 'raster',
      rasterFont: 'noto_sans',
      cutAfterPrint: false,
    });
    expect(buildIntegrationConfigSettings(values, item)).toEqual({
      vendor_extension: 'keep-me',
      connection_type: 'socket',
      paper_width_mm: 80,
      cut_after_print: false,
      encoding: 'cp866',
      print_mode: 'raster',
      qr_mode: 'raster',
      raster_font: 'noto_sans',
      host: '192.168.1.50',
      port: 9100,
      transport: 'local-agent',
      code_page: 46,
    });
    expect(getIntegrationSettingsSummary(item)).toBe(
      'LAN TCP/IP: 192.168.1.50:9100 | 80mm | cp866 | raster/raster/noto_sans',
    );
  });

  it('keeps system-printer defaults and emits the exact Windows raw settings', () => {
    const values = {
      ...integrationConfigDefaultValues,
      kind: 'printer' as const,
      provider: 'windows-raw',
      printerName: '  POS-80  ',
      encoding: '   ',
    };

    expect(buildIntegrationConfigSettings(values, null)).toEqual({
      connection_type: 'system_printer',
      paper_width_mm: 80,
      cut_after_print: true,
      encoding: 'cp1251',
      print_mode: 'text',
      qr_mode: 'native',
      raster_font: 'go_mono',
      printer_name: 'POS-80',
      transport: 'local-agent',
      code_page: 46,
    });
  });

  it('falls back to safe output modes for legacy and malformed settings', () => {
    const item = integration({
      kind: 'printer',
      provider: 'windows-raw',
      settings: { printer_name: 'POS-80', print_mode: 'pdf', qr_mode: 'unknown' },
    });

    const values = integrationConfigToFormValues(item);

    expect(values.printMode).toBe('text');
    expect(values.qrMode).toBe('native');
    expect(values.rasterFont).toBe('go_mono');
  });

  it('canonicalizes MARTA aliases while retaining managed hidden values and unmanaged keys', () => {
    const item = integration({
      kind: 'payment',
      provider: 'marta-softpos',
      settings: {
        endpointUrl: 'http://127.0.0.1:8765',
        taxNumber: '312217845',
        timeoutSeconds: 90,
        amountMultiplier: 100,
        hmacSecret: 'legacy-secret',
        terminalId: 'legacy-terminal',
        vendor_extension: 'keep-me',
      },
    });
    const values = integrationConfigToFormValues(item);

    expect(
      buildIntegrationConfigSettings({ ...values, taxNumber: ' 999999999 ', timeoutSeconds: '120' }, item),
    ).toEqual({
      vendor_extension: 'keep-me',
      terminal_id: 'legacy-terminal',
      merchant_id: undefined,
      endpoint_url: 'http://127.0.0.1:8765',
      api_key: undefined,
      payment_qr_url: undefined,
      timeout_seconds: 120,
      amount_multiplier: 100,
      tax_number: '999999999',
      hmac_secret: 'legacy-secret',
    });
    expect(getIntegrationSettingsSummary(item)).toBe('MARTA: http://127.0.0.1:8765 | STIR: 312217845 | x100 | 90s');
  });

  it('canonicalizes fiscal aliases and preserves the fiscal summary', () => {
    const item = integration({
      settings: {
        terminalId: 'terminal-1',
        factoryId: 'factory-1',
        cashboxId: 'cashbox-1',
        taxNumber: '312217845',
        endpointUrl: 'http://fiscal',
        apiKey: 'secret',
        custom: 7,
      },
    });
    const values = integrationConfigToFormValues(item);

    expect(buildIntegrationConfigSettings(values, item)).toEqual({
      custom: 7,
      terminal_id: 'terminal-1',
      factory_id: 'factory-1',
      cashbox_id: 'cashbox-1',
      tax_number: '312217845',
      endpoint_url: 'http://fiscal',
      api_key: 'secret',
    });
    expect(getIntegrationSettingsSummary(item)).toBe('Fiscal Drive | STIR: 312217845');
  });
});
