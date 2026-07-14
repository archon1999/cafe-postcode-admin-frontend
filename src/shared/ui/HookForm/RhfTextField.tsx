import type { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import { transformValue, transformValueOnBlur, transformValueOnChange } from 'minimal-shared/utils';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

export type RHFTextFieldProps<T extends FieldValues = FieldValues> = TextFieldProps & {
  name: FieldPath<T>;
  rules?: any;
  numberMax?: number;
  integerOnly?: boolean;
  sanitizeValue?: (value: string) => string;
};

export function RHFTextField<T extends FieldValues = FieldValues>({
  name,
  rules,
  numberMax,
  integerOnly = false,
  sanitizeValue,
  helperText,
  slotProps,
  type = 'text',
  autoComplete = 'new-password',
  ...other
}: RHFTextFieldProps<T>) {
  const { control } = useFormContext<T>();

  const isNumberType = type === 'number';
  const isAllowedNumberInput = (input: string) => {
    if (input === '') return true;
    if (/[eE,+-]/.test(input)) return false;

    const pattern = integerOnly ? /^\d*$/ : /^\d*\.?\d*$/;
    if (!pattern.test(input)) return false;

    if (!integerOnly && input === '.') return true;

    const numericValue = Number(input);
    if (!Number.isFinite(numericValue)) return false;

    if (numberMax !== undefined && numericValue > numberMax) return false;

    return true;
  };

  const sanitizeInputValue = (value: string) => (sanitizeValue ? sanitizeValue(value) : value);

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          value={isNumberType ? transformValue(field.value) : field.value}
          onChange={(event) => {
            const sanitizedValue = sanitizeInputValue(event.target.value);

            if (isNumberType) {
              const candidate = sanitizedValue.trim();
              if (!isAllowedNumberInput(candidate)) return;
            }

            const transformedValue = isNumberType ? transformValueOnChange(sanitizedValue) : sanitizedValue;

            field.onChange(transformedValue);
          }}
          onBlur={(event) => {
            const sanitizedValue = sanitizeInputValue(event.target.value);
            const transformedValue = isNumberType ? transformValueOnBlur(sanitizedValue) : sanitizedValue;

            if (isNumberType && numberMax !== undefined) {
              const normalized = Number(transformedValue);
              if (Number.isFinite(normalized) && normalized > numberMax) {
                field.onChange(numberMax);
                return;
              }
            }

            field.onChange(transformedValue);
          }}
          type={isNumberType ? 'text' : type}
          autoComplete={autoComplete}
          error={!!error}
          helperText={error?.message ?? helperText}
          slotProps={{
            ...slotProps,
            htmlInput: {
              ...slotProps?.htmlInput,
              ...(isNumberType && {
                inputMode: 'decimal',
                pattern: '[0-9]*\\.?[0-9]*',
              }),
              autoComplete,
            },
          }}
          {...other}
        />
      )}
    />
  );
}
