import type { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import { Controller, useFormContext, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';

import { sanitizeZipCode, ZIP_CODE_MAX_LENGTH } from 'shared/utils/zip-code';

export type RHFZipCodeFieldProps<T extends FieldValues = FieldValues> = Omit<
  TextFieldProps,
  'name' | 'value' | 'onChange' | 'type'
> & {
  name: FieldPath<T>;
  rules?: ControllerProps<T, FieldPath<T>>['rules'];
};

export function RHFZipCodeField<T extends FieldValues = FieldValues>({
  name,
  rules,
  helperText,
  slotProps,
  ...other
}: RHFZipCodeFieldProps<T>) {
  const { control } = useFormContext<T>();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const value = field.value === undefined || field.value === null ? '' : String(field.value);

        return (
          <TextField
            {...field}
            fullWidth
            value={value}
            onChange={(event) => {
              const sanitized = sanitizeZipCode(event.target.value);
              field.onChange(sanitized);
            }}
            onBlur={field.onBlur}
            type="text"
            error={!!error}
            helperText={error?.message ?? helperText}
            slotProps={{
              ...slotProps,
              htmlInput: {
                ...slotProps?.htmlInput,
                inputMode: 'numeric',
                pattern: '[0-9]*',
                maxLength: ZIP_CODE_MAX_LENGTH,
                autoComplete: 'new-password',
              },
            }}
            {...other}
          />
        );
      }}
    />
  );
}
