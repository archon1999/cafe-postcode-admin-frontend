import InputAdornment from '@mui/material/InputAdornment';
import type { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import { Controller, useFormContext, type FieldPath, type FieldValues, type RegisterOptions } from 'react-hook-form';

import { formatMoneyNumber, getMoneySuffix, parseMoneyInput } from 'shared/utils/format-money';

export type RHFSumCurrencyFieldProps<T extends FieldValues = FieldValues> = TextFieldProps & {
  name: FieldPath<T>;
  rules?: RegisterOptions<T, FieldPath<T>>;
  numberMax?: number;
};

export function RHFSumCurrencyField<T extends FieldValues = FieldValues>({
  name,
  rules,
  numberMax,
  helperText,
  slotProps,
  ...other
}: RHFSumCurrencyFieldProps<T>) {
  const { control } = useFormContext<T>();
  const suffix = getMoneySuffix();
  const inputSlotProps = typeof slotProps?.input === 'function' ? undefined : slotProps?.input;

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type="text"
          value={formatMoneyNumber(field.value, { fallback: '' })}
          onChange={(event) => {
            const parsedValue = parseMoneyInput(event.target.value);

            if (parsedValue !== '' && numberMax !== undefined && parsedValue > numberMax) {
              return;
            }

            field.onChange(parsedValue);
          }}
          onBlur={(event) => {
            field.onBlur();

            const parsedValue = parseMoneyInput(event.target.value);
            field.onChange(parsedValue);
          }}
          error={!!error}
          helperText={error?.message ?? helperText}
          slotProps={{
            ...slotProps,
            input: {
              ...inputSlotProps,
              endAdornment: (
                <>
                  {inputSlotProps?.endAdornment}
                  <InputAdornment position="end" sx={{ color: 'text.secondary', pointerEvents: 'none' }}>
                    {suffix}
                  </InputAdornment>
                </>
              ),
            },
            htmlInput: {
              ...slotProps?.htmlInput,
              inputMode: 'numeric',
              pattern: '[0-9]*',
              autoComplete: 'new-password',
            },
          }}
          {...other}
        />
      )}
    />
  );
}
