import type { FormControlProps } from '@mui/material/FormControl';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import type { FormGroupProps } from '@mui/material/FormGroup';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';
import FormLabel from '@mui/material/FormLabel';
import type { FormLabelProps } from '@mui/material/FormLabel';
import Switch from '@mui/material/Switch';
import type { SwitchProps } from '@mui/material/Switch';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

import { HelperText } from './HelpText';

type RHFMultiSwitchProps<T extends FieldValues = FieldValues> = FormGroupProps & {
  name: FieldPath<T>;
  label?: string;
  helperText?: React.ReactNode;
  options: {
    label: string;
    value: string;
  }[];
  slotProps?: {
    wrapper?: FormControlProps;
    switch: SwitchProps;
    formLabel?: FormLabelProps;
    helperText?: FormHelperTextProps;
  };
};

export function RHFMultiSwitch<T extends FieldValues = FieldValues>({
  name,
  label,
  options,
  helperText,
  slotProps,
  ...other
}: RHFMultiSwitchProps<T>) {
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
                  <Switch
                    checked={field.value.includes(option.value)}
                    onChange={() => field.onChange(getSelected(field.value, option.value))}
                    {...slotProps?.switch}
                    slotProps={{
                      ...slotProps?.switch?.slotProps,
                      input: {
                        id: `${option.label}-switch`,
                        ...(!option.label && { 'aria-label': `${option.label} switch` }),
                        ...slotProps?.switch?.slotProps?.input,
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
