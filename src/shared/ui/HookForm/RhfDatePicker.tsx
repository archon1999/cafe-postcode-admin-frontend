import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Controller, useFormContext, type FieldValues } from 'react-hook-form';

import { TASHKENT_TIMEZONE, toTashkentCalendarDayjs } from 'shared/utils/dayjs';
import type { PickerProps } from './types';
import { normalizeDateValue } from './utils';

export function RHFDatePicker<T extends FieldValues = FieldValues>({
  name,
  slotProps,
  outputFormat,
  required,
  onValueChange,
  ...other
}: PickerProps<DatePickerProps, T> & {
  outputFormat?: string;
  required?: boolean;
  onValueChange?: (value: string | undefined) => void;
}) {
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
              field.onChange(undefined);
              onValueChange?.(undefined);
              return;
            }

            const parsedValue = toTashkentCalendarDayjs(newValue);
            const fallbackValue = typeof newValue === 'string' ? newValue : newValue?.toString();
            const formattedValue = outputFormat
              ? parsedValue.isValid()
                ? parsedValue.format(outputFormat)
                : fallbackValue
              : parsedValue.isValid()
                ? parsedValue.format()
                : fallbackValue;

            field.onChange(formattedValue);
            onValueChange?.(formattedValue);
          }}
          slotProps={{
            ...slotProps,
            field: {
              clearable: true,
              ...slotProps?.field,
            },
            textField: {
              required,
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
