import type { BoxProps } from '@mui/material/Box';
import Box from '@mui/material/Box';
import type { CheckboxProps } from '@mui/material/Checkbox';
import Checkbox from '@mui/material/Checkbox';
import type { FormControlLabelProps } from '@mui/material/FormControlLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

import { HelperText } from './HelpText';

type RHFCheckboxProps<T extends FieldValues = FieldValues> = Omit<FormControlLabelProps, 'control'> & {
  name: FieldPath<T>;
  helperText?: React.ReactNode;
  slotProps?: {
    wrapper?: BoxProps;
    checkbox?: CheckboxProps;
    helperText?: FormHelperTextProps;
  };
};

export function RHFCheckbox<T extends FieldValues = FieldValues>({
  sx,
  name,
  label,
  slotProps,
  helperText,
  ...other
}: RHFCheckboxProps<T>) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Box {...slotProps?.wrapper}>
          <FormControlLabel
            label={label}
            control={
              <Checkbox
                {...field}
                checked={field.value}
                {...slotProps?.checkbox}
                slotProps={{
                  ...slotProps?.checkbox?.slotProps,
                  input: {
                    id: `${name}-checkbox`,
                    ...(!label && { 'aria-label': `${name} checkbox` }),
                    ...slotProps?.checkbox?.slotProps?.input,
                  },
                }}
              />
            }
            sx={[{ mx: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}
            {...other}
          />

          <HelperText {...slotProps?.helperText} errorMessage={error?.message} helperText={helperText} />
        </Box>
      )}
    />
  );
}
