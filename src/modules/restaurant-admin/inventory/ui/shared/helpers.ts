import { getMoneySuffix } from 'shared/utils/format-money';

export function inventoryError(error: unknown): string {
  const data = (error as { response?: { data?: unknown } })?.response?.data;
  const flatten = (value: unknown): string[] => {
    if (typeof value === 'string') return [value];
    if (Array.isArray(value)) return value.flatMap(flatten);
    if (value && typeof value === 'object') return Object.values(value).flatMap(flatten);
    return [];
  };
  return flatten(data).join(' · ');
}

export const inventoryNumber = (value: string | number | null | undefined) =>
  value === null || value === undefined
    ? '—'
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(Number(value));

export const inventoryUnitCost = (value: string | null | undefined) =>
  value === null || value === undefined ? '—' : `${inventoryNumber(value)} ${getMoneySuffix()}`;

export const localDateTime = (value = new Date()) => {
  const date = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return date.toISOString().slice(0, 16);
};
