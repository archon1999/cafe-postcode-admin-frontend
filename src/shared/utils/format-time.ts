import type { Dayjs, OpUnitType } from 'dayjs';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

import dayjs, { getCurrentTashkentTime, toTashkentDayjs } from './dayjs';

dayjs.extend(duration);
dayjs.extend(relativeTime);

export type DateInput = Dayjs | Date | string | number | null | undefined;

export const FORMAT_PATTERNS = {
  dateTime: 'DD-MM-YYYY, HH:mm',
  date: 'DD-MM-YYYY',
  time: 'HH:mm',
  split: {
    dateTime: 'DD-MM-YYYY, HH:mm',
    date: 'DD-MM-YYYY',
  },
  paramCase: {
    dateTime: 'DD-MM-YYYY, HH:mm',
    date: 'DD-MM-YYYY',
  },
} as const;

const INVALID_DATE = 'Invalid';

export function today(template?: string): string {
  return getCurrentTashkentTime().startOf('day').format(template);
}

export function fDateTime(input: DateInput, template = FORMAT_PATTERNS.dateTime): string {
  if (!input) return '';

  const date = toTashkentDayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.format(template);
}

export function fDateTimeUtc(input: DateInput, template = FORMAT_PATTERNS.dateTime): string {
  if (!input) return '';

  const date = dayjs.utc(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.format(template);
}

export function fDate(input: DateInput, template = FORMAT_PATTERNS.date): string {
  if (!input) return '';

  const date = toTashkentDayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.format(template);
}

export function fTime(input: DateInput, template = FORMAT_PATTERNS.time): string {
  if (!input) return '';

  const date = toTashkentDayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.format(template);
}

export function fTimestamp(input: DateInput): number | string {
  if (!input) return '';

  const date = toTashkentDayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.valueOf();
}

export function fToNow(input: DateInput): string {
  if (!input) return '';

  const date = toTashkentDayjs(input);
  if (!date.isValid()) return INVALID_DATE;

  return date.toNow(true);
}

type FormatDatePatternOptions = {
  emptyResult?: string;
  invalidResult?: string;
  useUtc?: boolean;
};

const DEFAULT_DISPLAY_OPTIONS: FormatDatePatternOptions = {
  emptyResult: '-',
  invalidResult: '-',
};

const formatWithPattern = (
  input: DateInput,
  format: string,
  { emptyResult = '', invalidResult = INVALID_DATE, useUtc = false }: FormatDatePatternOptions = {},
) => {
  if (!input) {
    return emptyResult;
  }

  try {
    const date = useUtc ? dayjs.utc(input) : toTashkentDayjs(input);

    if (!date.isValid()) {
      return invalidResult;
    }

    return date.format(format);
  } catch {
    return invalidResult;
  }
};

export function formatDate(input: DateInput, options: FormatDatePatternOptions = {}): string {
  return formatWithPattern(input, FORMAT_PATTERNS.date, { ...DEFAULT_DISPLAY_OPTIONS, ...options });
}

export function formatDateTime(input: DateInput, options: FormatDatePatternOptions = {}): string {
  return formatWithPattern(input, FORMAT_PATTERNS.dateTime, { ...DEFAULT_DISPLAY_OPTIONS, ...options });
}

export function fIsBetween(input: DateInput, start: DateInput, end: DateInput): boolean {
  if (!input || !start || !end) return false;

  const inputDate = toTashkentDayjs(input);
  const startDate = toTashkentDayjs(start);
  const endDate = toTashkentDayjs(end);

  if (!inputDate.isValid() || !startDate.isValid() || !endDate.isValid()) {
    return false;
  }

  const inputValue = inputDate.valueOf();
  const startValue = startDate.valueOf();
  const endValue = endDate.valueOf();

  return inputValue >= Math.min(startValue, endValue) && inputValue <= Math.max(startValue, endValue);
}

export function fIsAfter(start: DateInput, end: DateInput): boolean {
  if (!start || !end) return false;

  const startDate = toTashkentDayjs(start);
  const endDate = toTashkentDayjs(end);

  if (!startDate.isValid() || !endDate.isValid()) {
    return false;
  }

  return startDate.isAfter(endDate);
}

export function fIsSame(start: DateInput, end: DateInput, unit: OpUnitType = 'year'): boolean {
  if (!start || !end) return false;

  const startDate = toTashkentDayjs(start);
  const endDate = toTashkentDayjs(end);

  if (!startDate.isValid() || !endDate.isValid()) {
    return false;
  }

  return startDate.isSame(endDate, unit);
}

export function fDateRangeShortLabel(start: DateInput, end: DateInput, initial?: boolean): string {
  if (!start || !end) return '';

  const startDate = toTashkentDayjs(start);
  const endDate = toTashkentDayjs(end);

  if (!startDate.isValid() || !endDate.isValid() || startDate.isAfter(endDate)) {
    return INVALID_DATE;
  }

  if (initial) {
    return `${fDate(startDate)} - ${fDate(endDate)}`;
  }

  const isSameDay = startDate.isSame(endDate, 'day');

  if (isSameDay) {
    return fDate(endDate);
  }

  return `${fDate(startDate)} - ${fDate(endDate)}`;
}

export type DurationProps = {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
};

export function fAdd({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps): string {
  const result = getCurrentTashkentTime()
    .add(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      }),
    )
    .format();

  return result;
}

export function fSub({
  years = 0,
  months = 0,
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  milliseconds = 0,
}: DurationProps): string {
  const result = getCurrentTashkentTime()
    .subtract(
      dayjs.duration({
        years,
        months,
        days,
        hours,
        minutes,
        seconds,
        milliseconds,
      }),
    )
    .format();

  return result;
}
