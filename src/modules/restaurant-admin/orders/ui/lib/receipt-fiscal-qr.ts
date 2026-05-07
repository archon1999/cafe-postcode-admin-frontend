import type { AdminReceipt } from 'shared/api/admin-types';

const QR_URL_KEYS = ['qrCodeUrl', 'qr_code_url', 'QRCodeURL'] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeUrl(value: unknown) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : null;
}

function findQrUrl(value: unknown, depth = 0): string | null {
  if (!isRecord(value) || depth > 4) {
    return null;
  }

  for (const key of QR_URL_KEYS) {
    const url = normalizeUrl(value[key]);
    if (url) {
      return url;
    }
  }

  for (const nestedValue of Object.values(value)) {
    const url = findQrUrl(nestedValue, depth + 1);
    if (url) {
      return url;
    }
  }

  return null;
}

export function getReceiptFiscalQrUrl(receipt: AdminReceipt) {
  const directUrl =
    normalizeUrl((receipt as { qrCodeUrl?: unknown }).qrCodeUrl) ??
    normalizeUrl((receipt as { qr_code_url?: unknown }).qr_code_url);

  return directUrl ?? findQrUrl(receipt.payload);
}
