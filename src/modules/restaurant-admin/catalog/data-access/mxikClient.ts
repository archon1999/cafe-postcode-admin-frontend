import axios from 'axios';

import type { AdminMxikDetails, AdminMxikLookupResult, AdminMxikPackage } from 'shared/api/admin-types';

type MxikSearchParams = {
  query: string;
  lang?: string;
  limit?: number;
};

const DEFAULT_MXIK_API_BASE_URL = 'https://tasnif.soliq.uz/api/cls-api';
const DEFAULT_MXIK_INTEGRATION_API_BASE_URL = 'https://tasnif.soliq.uz/api/cl-api';

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

function deriveMxikIntegrationBaseUrl(baseUrl: string) {
  if (/\/api\/cls-api$/i.test(baseUrl)) {
    return baseUrl.replace(/\/api\/cls-api$/i, '/api/cl-api');
  }

  if (/\/cls-api$/i.test(baseUrl)) {
    return baseUrl.replace(/\/cls-api$/i, '/cl-api');
  }

  try {
    return new URL('/api/cl-api', baseUrl).toString();
  } catch {
    return DEFAULT_MXIK_INTEGRATION_API_BASE_URL;
  }
}

const mxikBaseUrl = normalizeBaseUrl(import.meta.env.VITE_MXIK_API_BASE_URL || DEFAULT_MXIK_API_BASE_URL);
const mxikIntegrationBaseUrl = normalizeBaseUrl(
  import.meta.env.VITE_MXIK_INTEGRATION_API_BASE_URL || deriveMxikIntegrationBaseUrl(mxikBaseUrl),
);
const mxikTimeout = Number(import.meta.env.VITE_MXIK_TIMEOUT) || Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

const mxikHttp = axios.create({
  baseURL: mxikBaseUrl,
  timeout: mxikTimeout,
});

const mxikIntegrationHttp = axios.create({
  baseURL: mxikIntegrationBaseUrl,
  timeout: mxikTimeout,
});

function normalizeLang(lang?: string) {
  return lang === 'ru' ? 'ru' : 'uz';
}

function normalizePictureLang(lang?: string) {
  return lang === 'ru' ? 'ru' : 'uz_cyrl';
}

function normalizeDetailLang(lang?: string) {
  return lang === 'ru' ? 'ru' : 'uz_latn';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value).trim();
  }

  return '';
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim();

    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function extractItems(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const data = payload.data;
  if (isRecord(data) && Array.isArray(data.content)) {
    return data.content.filter(isRecord);
  }

  if (Array.isArray(data)) {
    return data.filter(isRecord);
  }

  return [payload];
}

function getMxikCode(payload: Record<string, unknown>) {
  return asString(payload.mxikCode) || asString(payload.mxik) || asString(payload.code);
}

function normalizeItem(payload: Record<string, unknown>): AdminMxikLookupResult {
  const code = getMxikCode(payload);
  let name = asString(payload.mxikName) || asString(payload.name) || asString(payload.shortName);

  if (!name) {
    name = [payload.subPositionName, payload.positionName, payload.className].map(asString).filter(Boolean).join(' / ');
  }

  const label = [code, name].filter(Boolean).join(' - ') || code || name;

  return {
    code,
    name,
    label,
    raw: payload,
  };
}

export async function searchMxik(params: MxikSearchParams): Promise<AdminMxikLookupResult[]> {
  const query = params.query.trim();

  if (!query) {
    return [];
  }

  const limit = params.limit ?? 20;
  const lang = normalizeLang(params.lang);
  const isCodeSearch = /^\d+$/.test(query);

  const response = await mxikHttp.get(isCodeSearch ? 'mxik/search/by-params' : 'mxik/search-symbol', {
    params: isCodeSearch
      ? {
          mxikCode: query,
          size: limit,
          lang,
        }
      : {
          search_text: query,
          size: limit,
          lang,
        },
  });

  return extractItems(response.data)
    .map(normalizeItem)
    .filter((item) => Boolean(item.code));
}

function normalizePackage(payload: Record<string, unknown>): AdminMxikPackage {
  const code = asString(payload.code);
  const preferredName =
    asString(payload.nameLat) ||
    asString(payload.name) ||
    asString(payload.nameUz) ||
    asString(payload.nameRu) ||
    asString(payload.unitName);

  return {
    code,
    name: preferredName,
    unitName: asString(payload.unitName),
    containerName: asString(payload.containerName),
    parentCode: asString(payload.parentCode),
    isUnitPackage: asString(payload.isUnitPackage),
    raw: payload,
  };
}

function extractPackages(payload: unknown): AdminMxikPackage[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .filter(isRecord)
    .map(normalizePackage)
    .filter((item) => Boolean(item.code));
}

function pickPrimaryPackage(packages: AdminMxikPackage[]) {
  return (
    packages.find((item) => item.isUnitPackage === '1') ??
    packages.find((item) => !item.parentCode) ??
    packages[0] ??
    null
  );
}

function normalizeDetails(payload: Record<string, unknown>): AdminMxikDetails {
  const packages = extractPackages(payload.packages);

  return {
    code: getMxikCode(payload),
    name: asString(payload.mxikName) || asString(payload.name) || asString(payload.shortName),
    shortName: asString(payload.shortName),
    unitName: asString(payload.unitName),
    commonUnitName: asString(payload.commonUnitName),
    useCard: asNumber(payload.useCard),
    cashSale: asNumber(payload.cashSale),
    labelStatus: asNumber(payload.label),
    primaryPackage: pickPrimaryPackage(packages),
    packages,
    raw: payload,
  };
}

function extractIntegrationDetail(payload: unknown, code: string) {
  const items = extractItems(payload);

  return items.find((item) => getMxikCode(item) === code) ?? items[0] ?? null;
}

function mergeDetailsPayloads(
  detailsPayload: Record<string, unknown> | null,
  integrationPayload: Record<string, unknown> | null,
) {
  if (!detailsPayload && !integrationPayload) {
    return null;
  }

  const mergedPayload = {
    ...(integrationPayload ?? {}),
    ...(detailsPayload ?? {}),
  };

  if (integrationPayload && 'cashSale' in integrationPayload) {
    mergedPayload.cashSale = integrationPayload.cashSale;
  }

  if (Array.isArray(detailsPayload?.packages)) {
    mergedPayload.packages = detailsPayload.packages;
  } else if (Array.isArray(integrationPayload?.packages)) {
    mergedPayload.packages = integrationPayload.packages;
  }

  return mergedPayload;
}

export async function getMxikDetails(code: string, lang?: string): Promise<AdminMxikDetails | null> {
  const normalizedCode = code.trim();

  if (!normalizedCode) {
    return null;
  }

  const [detailsResult, integrationResult] = await Promise.allSettled([
    mxikHttp.get('mxik/get/by-mxik', {
      params: {
        mxikCode: normalizedCode,
        lang: normalizeDetailLang(lang),
      },
    }),
    mxikIntegrationHttp.get('integration-mxik/get/information', {
      params: {
        page: 0,
        size: 25,
        search_text: normalizedCode,
        type: 1,
      },
    }),
  ]);

  const detailsPayload =
    detailsResult.status === 'fulfilled' && isRecord(detailsResult.value.data) ? detailsResult.value.data : null;
  const integrationPayload =
    integrationResult.status === 'fulfilled'
      ? extractIntegrationDetail(integrationResult.value.data, normalizedCode)
      : null;
  const mergedPayload = mergeDetailsPayloads(detailsPayload, integrationPayload);

  if (!mergedPayload) {
    if (detailsResult.status === 'rejected') {
      throw detailsResult.reason;
    }

    if (integrationResult.status === 'rejected') {
      throw integrationResult.reason;
    }

    return null;
  }

  return normalizeDetails(mergedPayload);
}

function extractPictureNames(payload: unknown): string[] {
  if (Array.isArray(payload)) {
    return payload.map(asString).filter(Boolean);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const value = payload.value;
  if (Array.isArray(value)) {
    return value.map(asString).filter(Boolean);
  }

  return [];
}

export async function getMxikPrimaryPictureUrl(code: string, lang?: string): Promise<string> {
  const normalizedCode = code.trim();

  if (!normalizedCode) {
    return '';
  }

  try {
    const response = await mxikHttp.get('integration-mxik/references/get/mxik/picture-names', {
      params: {
        mxik_code: normalizedCode,
        lang: normalizePictureLang(lang),
      },
    });
    const [filename] = extractPictureNames(response.data);

    return filename ? `${mxikBaseUrl}/integration-mxik/references/get/file/${encodeURIComponent(filename)}` : '';
  } catch {
    return '';
  }
}
