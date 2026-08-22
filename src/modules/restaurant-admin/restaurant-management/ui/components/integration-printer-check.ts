import { apiClient } from 'shared/api/http/apiClient';

import type { IntegrationConfigFormValues } from './integration-config.mapper';

export async function checkPrinterConnection(values: IntegrationConfigFormValues) {
  // React Hook Form may unregister the inputs from the previously selected
  // connection type when the LAN/Windows field set is swapped.  Keep the
  // connection probe tolerant of those absent, inactive values instead of
  // throwing before the request reaches the Local Agent.
  const printerName = String(values.printerName ?? '').trim();
  const host = String(values.printerHost ?? '').trim();
  const port = String(values.printerPort ?? '').trim();

  const result = await apiClient.checkLocalAgentPrinter({
    connectionType: values.connectionType,
    printerName: printerName || undefined,
    host: host || undefined,
    port: port ? Number(port) : undefined,
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
