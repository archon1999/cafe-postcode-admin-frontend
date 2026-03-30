type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function formatHallDisplayName(
  name?: string | null,
  level?: number | null,
  t?: TranslateFn,
) {
  if (!name) {
    return '-';
  }

  if (level === null || level === undefined) {
    return name;
  }

  if (!t) {
    return `${name} - ${level}`;
  }

  return t('labels.hallWithLevel', { name, level });
}
