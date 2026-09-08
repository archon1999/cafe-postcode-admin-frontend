import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import dayjs, { TASHKENT_TIMEZONE, toTashkentCalendarDayjs } from 'shared/utils/dayjs';
import { FORMAT_PATTERNS } from 'shared/utils/format-time';

export function InventoryDatePicker({
  label,
  value,
  onChange,
  error = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}) {
  return (
    <DatePicker
      label={label}
      value={value ? (dayjs(value).isValid() ? toTashkentCalendarDayjs(value) : dayjs('')) : null}
      onChange={(date) => onChange(date ? (date.isValid() ? date.format('YYYY-MM-DD') : 'Invalid Date') : '')}
      timezone={TASHKENT_TIMEZONE}
      format={FORMAT_PATTERNS.date}
      slotProps={{
        field: { clearable: true },
        textField: { size: 'medium', fullWidth: true, error: error || Boolean(value && !dayjs(value).isValid()) },
      }}
    />
  );
}
