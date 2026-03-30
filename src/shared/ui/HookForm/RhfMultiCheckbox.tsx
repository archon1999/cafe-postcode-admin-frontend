import type { CheckboxProps } from '@mui/material/Checkbox';
import Checkbox from '@mui/material/Checkbox';
import type { FormControlProps } from '@mui/material/FormControl';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { FormGroupProps } from '@mui/material/FormGroup';
import FormGroup from '@mui/material/FormGroup';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';
import type { FormLabelProps } from '@mui/material/FormLabel';
import FormLabel from '@mui/material/FormLabel';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

import { HelperText } from './HelpText';

type RHFMultiCheckboxProps<T extends FieldValues = FieldValues> = FormGroupProps & {
  name: FieldPath<T>;
  label?: string;
  helperText?: React.ReactNode;
  options: { label: string; value: string }[];
  slotProps?: {
    wrapper?: FormControlProps;
    checkbox?: CheckboxProps;
    formLabel?: FormLabelProps;
    helperText?: FormHelperTextProps;
  };
};

export function RHFMultiCheckbox<T extends FieldValues = FieldValues>({
  name,
  label,
  options,
  slotProps,
  helperText,
  ...other
}: RHFMultiCheckboxProps<T>) {
  const { control } = useFormContext();

  const getSelected = (selectedItems: string[], item: string) =>
    selectedItems.includes(item) ? selectedItems.filter((value) => value !== item) : [...selectedItems, item];

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl component="fieldset" {...slotProps?.wrapper}>
          {label && (
            <FormLabel
              component="legend"
              {...slotProps?.formLabel}
              sx={[
                { mb: 1, typography: 'body2' },
                ...(Array.isArray(slotProps?.formLabel?.sx) ? slotProps.formLabel.sx : [slotProps?.formLabel?.sx]),
              ]}>
              {label}
            </FormLabel>
          )}

          <FormGroup {...other}>
            {options.map((option) => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    checked={field.value.includes(option.value)}
                    onChange={() => field.onChange(getSelected(field.value, option.value))}
                    {...slotProps?.checkbox}
                    slotProps={{
                      ...slotProps?.checkbox?.slotProps,
                      input: {
                        id: `${option.label}-checkbox`,
                        ...(!option.label && { 'aria-label': `${option.label} checkbox` }),
                        ...slotProps?.checkbox?.slotProps?.input,
                      },
                    }}
                  />
                }
                label={option.label}
              />
            ))}
          </FormGroup>

          <HelperText {...slotProps?.helperText} disableGutters errorMessage={error?.message} helperText={helperText} />
        </FormControl>
      )}
    />
  );
}
