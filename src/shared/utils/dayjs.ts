import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const TASHKENT_TIMEZONE = 'Asia/Tashkent';

dayjs.tz.setDefault(TASHKENT_TIMEZONE);

export type TashkentDateInput = Dayjs | Date | string | number | null | undefined;

function hasExplicitTimezone(value: string) {
  return /(?:[zZ]|[+-]\d{2}:\d{2}|[+-]\d{4})$/.test(value.trim());
}

export function toTashkentDayjs(input: TashkentDateInput): Dayjs {
  if (dayjs.isDayjs(input)) {
    return input.tz(TASHKENT_TIMEZONE);
  }

  if (input instanceof Date || typeof input === 'number') {
    return dayjs(input).tz(TASHKENT_TIMEZONE);
  }

  if (typeof input === 'string') {
    const value = input.trim();
    if (!value) {
      return dayjs('');
    }

    return hasExplicitTimezone(value) ? dayjs(value).tz(TASHKENT_TIMEZONE) : dayjs.tz(value, TASHKENT_TIMEZONE);
  }

  return dayjs(input).tz(TASHKENT_TIMEZONE);
}

export function toTashkentCalendarDayjs(input: TashkentDateInput, format?: string): Dayjs {
  if (dayjs.isDayjs(input)) {
    return input.tz(TASHKENT_TIMEZONE, true);
  }

  if (!input) {
    return dayjs('');
  }

  if (typeof input === 'string' && format) {
    return dayjs.tz(input, format, TASHKENT_TIMEZONE);
  }

  if (typeof input === 'string') {
    return dayjs.tz(input, TASHKENT_TIMEZONE);
  }

  return toTashkentDayjs(input);
}

export function getCurrentTashkentTime(): Dayjs {
  return dayjs().tz(TASHKENT_TIMEZONE);
}

export default dayjs;
