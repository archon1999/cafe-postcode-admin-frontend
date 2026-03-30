import type { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import { merge } from 'es-toolkit';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

export type RHFSelectProps<T extends FieldValues = FieldValues> = TextFieldProps & {
  name: FieldPath<T>;
  children: React.ReactNode;
};

export function RHFSelect<T extends FieldValues = FieldValues>({
  name,
  children,
  helperText,
  slotProps = {},
  ...other
}: RHFSelectProps<T>) {
  const { control } = useFormContext();

  const labelId = `${name}-select`;

  const baseSlotProps: TextFieldProps['slotProps'] = {
    select: {
      sx: { textTransform: 'capitalize' },
      MenuProps: {
        slotProps: {
          paper: {
            sx: { maxHeight: 240 },
          },
        },
      },
    },
    htmlInput: { id: labelId },
    inputLabel: { htmlFor: labelId, shrink: true },
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          select
          fullWidth
          error={!!error}
          helperText={error?.message ?? helperText}
          slotProps={merge(baseSlotProps, slotProps)}
          {...other}>
          {children}
        </TextField>
      )}
    />
  );
}
