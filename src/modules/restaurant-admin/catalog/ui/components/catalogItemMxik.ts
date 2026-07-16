import type { AdminMxikDetails, AdminMxikPackage } from 'shared/api/admin-types';

export function getMxikDetailLang(lang: string) {
  return lang === 'ru' ? 'ru' : 'uz_latn';
}

export function getMxikImageLang(lang: string) {
  return lang === 'ru' ? 'ru' : 'uz';
}

export function formatMxikFlag(value: number | null | undefined, yesLabel: string, noLabel: string) {
  if (value === null || value === undefined) {
    return '';
  }
  if (value === 1) {
    return `${yesLabel} (${value})`;
  }
  if (value === 0) {
    return `${noLabel} (${value})`;
  }
  return String(value);
}

export function formatMxikPackage(pkg: AdminMxikPackage | null | undefined) {
  if (!pkg) {
    return '';
  }
  return [pkg.code, pkg.name || pkg.unitName || pkg.containerName].filter(Boolean).join(' - ');
}

export function getMxikLabelStatus(
  details: AdminMxikDetails | null | undefined,
  fallbackRaw?: Record<string, unknown>,
) {
  if (details?.labelStatus !== null && details?.labelStatus !== undefined) {
    return details.labelStatus;
  }
  return typeof fallbackRaw?.label === 'number' ? fallbackRaw.label : null;
}

export function getMxikCashSaleStatus(
  details: AdminMxikDetails | null | undefined,
  fallbackRaw?: Record<string, unknown>,
) {
  if (details?.cashSale !== null && details?.cashSale !== undefined) {
    return details.cashSale;
  }
  return typeof fallbackRaw?.cashSale === 'number' ? fallbackRaw.cashSale : null;
}

export function formatCashSaleRestriction(
  value: number | null | undefined,
  labels: { forbidden: string; limited: string; unlimited: string },
) {
  if (value === null || value === undefined) {
    return '';
  }
  if (value === 0) {
    return labels.forbidden;
  }
  if (value === 1) {
    return labels.limited;
  }
  if (value === 2) {
    return labels.unlimited;
  }
  return String(value);
}
