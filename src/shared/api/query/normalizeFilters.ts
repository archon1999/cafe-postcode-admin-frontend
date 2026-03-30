export function normalizeFilters<T extends Record<string, unknown>>(filters: T): Partial<T> {
  if (!filters || typeof filters !== 'object') {
    return {} as Partial<T>;
  }

  const entries = Object.entries(filters)
    .filter(([, val]) => {
      if (val === undefined || val === null || val === '') return false;

      if (Array.isArray(val) && val.length === 0) return false;

      if (typeof val === 'object' && !Array.isArray(val) && Object.keys(val).length === 0) return false;

      if (typeof val === 'string' && val.trim() === '') return false;

      return true;
    })
    .sort(([a], [b]) => a.localeCompare(b));

  return Object.fromEntries(entries) as Partial<T>;
}
