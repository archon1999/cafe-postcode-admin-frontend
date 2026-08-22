import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiClient } from 'shared/api/http/apiClient';

import { integrationConfigDefaultValues } from './integration-config.mapper';
import { checkPrinterConnection } from './integration-printer-check';

vi.mock('shared/api/http/apiClient', () => ({
  apiClient: {
    checkLocalAgentPrinter: vi.fn(),
  },
}));

const checkLocalAgentPrinterMock = vi.mocked(apiClient.checkLocalAgentPrinter);

describe('checkPrinterConnection', () => {
  beforeEach(() => {
    checkLocalAgentPrinterMock.mockReset();
  });

  it('checks a Windows printer after the hidden LAN inputs were unregistered', async () => {
    checkLocalAgentPrinterMock.mockResolvedValue({ ok: true, printerName: 'POS-80 USB' });

    const values = {
      ...integrationConfigDefaultValues,
      kind: 'printer' as const,
      connectionType: 'system_printer' as const,
      printerName: ' POS-80 USB ',
      printerHost: undefined,
      printerPort: undefined,
    } as unknown as typeof integrationConfigDefaultValues;

    await expect(checkPrinterConnection(values)).resolves.toMatchObject({ ok: true });
    expect(checkLocalAgentPrinterMock).toHaveBeenCalledWith({
      connectionType: 'system_printer',
      printerName: 'POS-80 USB',
      host: undefined,
      port: undefined,
    });
  });
});
