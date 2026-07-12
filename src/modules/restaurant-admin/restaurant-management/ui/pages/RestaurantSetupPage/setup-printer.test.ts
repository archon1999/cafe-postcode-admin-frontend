import { describe, expect, it } from 'vitest';

import { getSetupPrinterSettings, getSetupPrinterTarget } from './setup-printer';

describe('getSetupPrinterSettings', () => {
  it('uses the default Windows printer for an empty value', () => {
    expect(getSetupPrinterSettings('')).toEqual({ connectionType: 'system_printer' });
  });

  it('treats a printer name as a Windows system printer', () => {
    expect(getSetupPrinterSettings('EPSON TM-T20III')).toEqual({
      connectionType: 'system_printer',
      printerName: 'EPSON TM-T20III',
    });
  });

  it('treats an IPv4 address as a socket printer with the default port', () => {
    expect(getSetupPrinterSettings('192.168.1.50')).toEqual({
      connectionType: 'socket',
      host: '192.168.1.50',
      port: 9100,
    });
  });

  it('accepts a custom socket printer port', () => {
    expect(getSetupPrinterSettings('192.168.1.50:9101')).toEqual({
      connectionType: 'socket',
      host: '192.168.1.50',
      port: 9101,
    });
  });
});

describe('getSetupPrinterTarget', () => {
  it('reads an existing Windows printer name', () => {
    expect(getSetupPrinterTarget({ connection_type: 'system_printer', printer_name: 'POS-80 USB' })).toBe('POS-80 USB');
  });

  it('reads an existing socket printer address', () => {
    expect(getSetupPrinterTarget({ connection_type: 'socket', host: '192.168.0.254', port: 9100 })).toBe(
      '192.168.0.254',
    );
    expect(getSetupPrinterTarget({ connection_type: 'socket', host: '192.168.0.254', port: 9101 })).toBe(
      '192.168.0.254:9101',
    );
  });
});
