type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function formatHallDisplayName(
  name?: string | null,
  _legacyLevelOrTranslate?: number | TranslateFn | null,
  _legacyTranslate?: TranslateFn,
) {
  if (!name) {
    return '-';
  }
  return name;
}
