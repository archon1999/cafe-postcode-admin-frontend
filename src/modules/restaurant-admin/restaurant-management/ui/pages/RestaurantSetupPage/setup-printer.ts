export type SetupPrinterSettings =
  | { connectionType: 'system_printer'; printerName?: string }
  | { connectionType: 'socket'; host: string; port: number };

const isIpv4Address = (value: string) => {
  const octets = value.split('.');
  return (
    octets.length === 4 &&
    octets.every((octet) => /^\d{1,3}$/.test(octet) && Number(octet) >= 0 && Number(octet) <= 255)
  );
};

export const getSetupPrinterSettings = (value: string): SetupPrinterSettings => {
  const target = value.trim();
  if (!target) return { connectionType: 'system_printer' };

  const [host, portValue] = target.split(':', 2);
  if (isIpv4Address(host)) {
    const parsedPort = Number(portValue);
    return {
      connectionType: 'socket',
      host,
      port: Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535 ? parsedPort : 9100,
    };
  }

  return { connectionType: 'system_printer', printerName: target };
};

export const getSetupPrinterTarget = (settings: Record<string, unknown>): string => {
  const connectionType = settings.connection_type ?? settings.connectionType;
  const host = String(settings.host ?? '').trim();
  if (connectionType === 'socket' || host) {
    const port = Number(settings.port ?? 9100);
    return host && Number.isInteger(port) && port !== 9100 ? `${host}:${port}` : host;
  }
  return String(settings.printer_name ?? settings.printerName ?? '').trim();
};
