import type { DateInput } from 'shared/utils/format-time';
import dayjs, { getCurrentTashkentTime, toTashkentCalendarDayjs } from 'shared/utils/dayjs';
import type { Dayjs } from 'dayjs';

export function normalizeDateValue(value: DateInput): Dayjs | null {
  if (dayjs.isDayjs(value)) return toTashkentCalendarDayjs(value);
  if (!value) return null;

  const parsed = toTashkentCalendarDayjs(value);
  if (parsed.isValid()) return parsed;

  if (typeof value === 'string') {
    const timeOnly = toTashkentCalendarDayjs(value, 'HH:mm');
    if (timeOnly.isValid()) {
      return getCurrentTashkentTime()
        .set('hour', timeOnly.hour())
        .set('minute', timeOnly.minute())
        .set('second', 0)
        .set('millisecond', 0);
    }
  }

  return null;
}
