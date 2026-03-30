import type { DateInput } from './format-time';
import { fDateTime } from './format-time';

const TIMEZONE_LABEL_BY_VALUE: Record<number, string> = {
  1: 'EST',
  2: 'CST',
  3: 'MST',
  4: 'PST',
};

export type TimezoneValue = number | string | null | undefined;

export const resolveTimezoneLabel = (value?: TimezoneValue) => {
  if (typeof value === 'string') {
    return value.trim().toUpperCase();
  }

  if (typeof value === 'number') {
    return TIMEZONE_LABEL_BY_VALUE[value] ?? '';
  }

  return '';
};

export const withTimezoneLabel = (value: string, timezone?: TimezoneValue) => {
  const timezoneLabel = resolveTimezoneLabel(timezone);

  if (!value) {
    return value;
  }

  return timezoneLabel ? `${value} ${timezoneLabel}` : value;
};

export const formatDateTimeWithTimezone = (input: DateInput, timezone?: TimezoneValue, template?: string) =>
  withTimezoneLabel(fDateTime(input, template), timezone);
