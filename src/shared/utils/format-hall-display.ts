type TranslateFn = (key: string, options?: Record<string, unknown>) => string;

export function formatHallDisplayName(
  name?: string | null,
  _level?: number | null,
  _t?: TranslateFn,
) {
  if (!name) {
    return '-';
  }
  return name;
}
