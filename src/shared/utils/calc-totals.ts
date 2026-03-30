type NumericKeys<T> = {
  [K in keyof T]-?: T[K] extends number ? K : never;
}[keyof T];

const toSafeNumber = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function calcTotals<T extends Record<string, unknown>, K extends NumericKeys<T>>(
  rows: readonly T[],
  keys: readonly K[],
): Record<K, number>;
export function calcTotals<T extends Record<string, unknown>>(rows: readonly T[]): Partial<Record<keyof T, number>>;
export function calcTotals<T extends Record<string, unknown>, K extends NumericKeys<T>>(
  rows: readonly T[],
  keys?: readonly K[],
) {
  if (keys?.length) {
    const result = {} as Record<K, number>;

    keys.forEach((key) => {
      result[key] = 0;
    });

    rows.forEach((row) => {
      keys.forEach((key) => {
        result[key] += toSafeNumber(row[key]);
      });
    });

    return result;
  }

  const result: Partial<Record<keyof T, number>> = {};

  rows.forEach((row) => {
    (Object.keys(row) as Array<keyof T>).forEach((key) => {
      const value = row[key];
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return;
      }

      result[key] = (result[key] ?? 0) + value;
    });
  });

  return result;
}
