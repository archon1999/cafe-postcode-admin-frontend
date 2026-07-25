import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Controller, useFormContext, type FieldValues } from 'react-hook-form';

import { TASHKENT_TIMEZONE, toTashkentCalendarDayjs } from 'shared/utils/dayjs';
import { FORMAT_PATTERNS } from 'shared/utils/format-time';

import type { PickerProps } from './types';
import { normalizeDateValue } from './utils';

export function RHFDateTimePicker<T extends FieldValues = FieldValues>({
  name,
  slotProps,
  ...other
}: PickerProps<DateTimePickerProps, T>) {
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
          ampm={false}
          format={FORMAT_PATTERNS.dateTime}
        />
      )}
    />
  );
}
