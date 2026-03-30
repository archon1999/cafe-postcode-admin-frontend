import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

import type { PhoneInputProps } from '../PhoneInput';
import { PhoneInput } from '../PhoneInput';

export type RHFPhoneInputProps<T extends FieldValues = FieldValues> = Omit<PhoneInputProps, 'value' | 'onChange'> & {
  name: FieldPath<T>;
};

export function RHFPhoneInput<T extends FieldValues = FieldValues>({
  name,
  helperText,
  ...other
}: RHFPhoneInputProps<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { ref, ...field }, fieldState: { error } }) => (
        <PhoneInput
          {...field}
          inputRef={ref}
          fullWidth
          error={!!error}
          helperText={error?.message ?? helperText}
          {...other}
        />
      )}
    />
  );
}
