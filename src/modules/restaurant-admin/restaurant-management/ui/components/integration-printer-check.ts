import { apiClient } from 'shared/api/http/apiClient';

import type { IntegrationConfigFormValues } from './integration-config.mapper';

export async function checkPrinterConnection(values: IntegrationConfigFormValues) {
  const result = await apiClient.checkLocalAgentPrinter({
    connectionType: values.connectionType,
    printerName: values.printerName.trim() || undefined,
    host: values.printerHost.trim() || undefined,
    port: values.printerPort.trim() ? Number(values.printerPort) : undefined,
  });
  const typedResult = result as {
    ok?: boolean;
    error?: string;
    printerName?: string;
    host?: string;
    port?: number;
  };
  if (!typedResult.ok) {
    throw new Error(typedResult.error || 'Local agent printer connection check failed.');
  }
  return typedResult;
}
