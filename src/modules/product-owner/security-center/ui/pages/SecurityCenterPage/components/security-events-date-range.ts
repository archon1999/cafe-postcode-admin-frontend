import { toTashkentCalendarDayjs } from 'shared/utils/dayjs';

export type SecurityEventsDateRange = {
  rolling?: boolean;
  startDate: string;
  endDate: string;
};

export function defaultSecurityEventsDateRange(): SecurityEventsDateRange {
  const end = new Date();
  const start = new Date(end.getTime() - 86400000);
  return { startDate: start.toISOString().slice(0, 10), endDate: end.toISOString().slice(0, 10), rolling: true };
}

const DATE_FORMAT = 'YYYY-MM-DD';
const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function parseDate(value: string) {
  if (!DATE_VALUE_PATTERN.test(value)) return null;

  try {
    const date = toTashkentCalendarDayjs(value, DATE_FORMAT);
    return date.isValid() && date.format(DATE_FORMAT) === value ? date : null;
  } catch {
    return null;
  }
}

export function normalizeSecurityEventsDateRange(startDate: string, endDate: string): SecurityEventsDateRange | null {
  const parsedStart = parseDate(startDate);
  const parsedEnd = parseDate(endDate);

  if (!parsedStart || !parsedEnd) return null;

  return parsedStart.isAfter(parsedEnd, 'day') ? { startDate: endDate, endDate: startDate } : { startDate, endDate };
}

export function securityEventsDateRangeToQueryBounds(dateRange: SecurityEventsDateRange | null | undefined): {
  from?: string;
  to?: string;
} {
  if (!dateRange) return {};
  if (dateRange.rolling) return { from: new Date(Date.now() - 86400000).toISOString() };

  const normalized = normalizeSecurityEventsDateRange(dateRange.startDate, dateRange.endDate);
  if (!normalized) return {};

  return {
    from: toTashkentCalendarDayjs(normalized.startDate, DATE_FORMAT).startOf('day').toISOString(),
    to: toTashkentCalendarDayjs(normalized.endDate, DATE_FORMAT).endOf('day').toISOString(),
  };
}
