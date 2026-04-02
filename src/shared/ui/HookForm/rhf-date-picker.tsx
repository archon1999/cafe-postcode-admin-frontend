import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import type { PickersTextFieldProps } from '@mui/x-date-pickers/PickersTextField';
import type { TimePickerProps } from '@mui/x-date-pickers/TimePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import type { Dayjs } from 'dayjs';
import { Controller, useFormContext } from 'react-hook-form';

import dayjs, { TASHKENT_TIMEZONE, toTashkentCalendarDayjs } from 'shared/utils/dayjs';

type DateInput = Dayjs | Date | string | number | null | undefined;

function normalizeDateValue(value: DateInput): Dayjs | null {
  if (dayjs.isDayjs(value)) return toTashkentCalendarDayjs(value);

  const parsed = value ? toTashkentCalendarDayjs(value) : null;
  return parsed?.isValid() ? parsed : null;
}

type PickerProps<T extends DatePickerProps | TimePickerProps | DateTimePickerProps> = T & {
  name: string;
  slotProps?: T['slotProps'] & {
    textField?: Partial<PickersTextFieldProps>;
  };
};

export function RHFDatePicker({ name, slotProps, ...other }: PickerProps<DatePickerProps>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...field}
          value={normalizeDateValue(field.value)}
          onChange={(newValue) => {
            if (!newValue) {
              field.onChange(null);
              return;
            }

            const parsedValue = toTashkentCalendarDayjs(newValue);
            field.onChange(parsedValue.isValid() ? parsedValue.format() : newValue);
          }}
          slotProps={{
            ...slotProps,
            field: {
              clearable: true,
              ...slotProps?.field,
            },
            textField: {
              ...slotProps?.textField,
              error: !!error,
              helperText: error?.message ?? slotProps?.textField?.helperText,
            },
          }}
          timezone={TASHKENT_TIMEZONE}
          {...other}
        />
      )}
    />
  );
}

export function RHFTimePicker({ name, slotProps, ...other }: PickerProps<TimePickerProps>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TimePicker
          {...field}
          value={normalizeDateValue(field.value)}
          onChange={(newValue) => {
            if (!newValue) {
              field.onChange(null);
              return;
            }

            const parsedValue = toTashkentCalendarDayjs(newValue);
            field.onChange(parsedValue.isValid() ? parsedValue.format() : newValue);
          }}
          slotProps={{
            ...slotProps,
            field: {
              clearable: true,
              ...slotProps?.field,
            },
            textField: {
              ...slotProps?.textField,
              error: !!error,
              helperText: error?.message ?? slotProps?.textField?.helperText,
            },
          }}
          timezone={TASHKENT_TIMEZONE}
          {...other}
        />
      )}
    />
  );
}

export function RHFDateTimePicker({ name, slotProps, ...other }: PickerProps<DateTimePickerProps>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DateTimePicker
          {...field}
          value={normalizeDateValue(field.value)}
          onChange={(newValue) => {
            if (!newValue) {
              field.onChange(null);
              return;
            }

            const parsedValue = toTashkentCalendarDayjs(newValue);
            field.onChange(parsedValue.isValid() ? parsedValue.format() : newValue);
          }}
          slotProps={{
            ...slotProps,
            field: {
              clearable: true,
              ...slotProps?.field,
            },
            textField: {
              ...slotProps?.textField,
              error: !!error,
              helperText: error?.message ?? slotProps?.textField?.helperText,
            },
          }}
          timezone={TASHKENT_TIMEZONE}
          {...other}
        />
      )}
    />
  );
}
