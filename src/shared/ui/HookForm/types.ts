import type { DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import type { DateTimePickerProps } from '@mui/x-date-pickers/DateTimePicker';
import type { PickersTextFieldProps } from '@mui/x-date-pickers/PickersTextField';
import type { TimePickerProps } from '@mui/x-date-pickers/TimePicker';
import type { FieldValues, FieldPath } from 'react-hook-form';

export type PickerProps<
  T extends DatePickerProps | TimePickerProps | DateTimePickerProps,
  S extends FieldValues = FieldValues,
> = T & {
  name: FieldPath<S>;
  slotProps?: T['slotProps'] & {
    textField?: Partial<PickersTextFieldProps>;
  };
};
