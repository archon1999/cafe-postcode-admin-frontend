import { getMxikDetails } from './mxikClient';

export async function resolveCatalogMxikPayload(
  code: string | undefined,
  raw: Record<string, unknown> = {},
): Promise<Record<string, unknown>> {
  if (code === undefined) return raw;
  if (!code.trim()) return {};
  const hasPackages =
    Array.isArray(raw.packages) &&
    raw.packages.some((pkg) => pkg && typeof pkg === 'object' && 'code' in pkg && String(pkg.code ?? '').trim());
  if (hasPackages) return raw;

  const details = await getMxikDetails(code);
  if (!details || details.code !== code.trim()) return raw;
  // Search responses omit packages; preserve other saved metadata while adding
  // the same detailed Tasnif package list shown in the catalog form.
  const detailsRaw = details.raw ?? {};
  const payload = { ...detailsRaw, ...raw };
  if (Array.isArray(detailsRaw.packages)) payload.packages = detailsRaw.packages;
  return payload;
}
