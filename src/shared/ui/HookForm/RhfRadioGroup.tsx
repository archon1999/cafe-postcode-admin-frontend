import type { FormControlProps } from '@mui/material/FormControl';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { FormLabelProps } from '@mui/material/FormLabel';
import FormLabel from '@mui/material/FormLabel';
import type { RadioProps } from '@mui/material/Radio';
import Radio from '@mui/material/Radio';
import type { RadioGroupProps } from '@mui/material/RadioGroup';
import RadioGroup from '@mui/material/RadioGroup';
import type { ReactNode } from 'react';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

import type { HelperTextProps } from './HelpText';
import { HelperText } from './HelpText';

export type RHFRadioGroupProps<T extends FieldValues = FieldValues> = RadioGroupProps & {
  name: FieldPath<T>;
  label?: ReactNode;
  options: { label: ReactNode; value: number | string; disabled?: boolean }[];
  helperText?: React.ReactNode;
  slotProps?: {
    wrapper?: FormControlProps;
    radio?: RadioProps;
    formLabel?: FormLabelProps;
    helperText?: HelperTextProps;
  };
};

export function RHFRadioGroup({ sx, name, label, options, helperText, slotProps, ...other }: RHFRadioGroupProps) {
  const { control } = useFormContext();

  const labelledby = `${name}-radios`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl component="fieldset" {...slotProps?.wrapper}>
          {label && (
            <FormLabel
              id={labelledby}
              component="legend"
              {...slotProps?.formLabel}
              sx={[
                { mb: 1, typography: 'body2' },
                ...(Array.isArray(slotProps?.formLabel?.sx) ? slotProps.formLabel.sx : [slotProps?.formLabel?.sx]),
              ]}>
              {label}
            </FormLabel>
          )}

          <RadioGroup
            {...field}
            onChange={(event) => {
              const selectedOption = options.find((option) => String(option.value) === event.target.value);
              field.onChange(selectedOption?.value ?? event.target.value);
            }}
            aria-labelledby={labelledby}
            sx={sx}
            {...other}>
            {options.map((option) => {
              const radioId = `${name}-${option.value}-radio`;

              return (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  control={
                    <Radio
                      {...slotProps?.radio}
                      slotProps={{
                        ...slotProps?.radio?.slotProps,
                        input: {
                          id: radioId,
                          ...slotProps?.radio?.slotProps?.input,
                        },
                      }}
                    />
                  }
                  label={option.label}
                />
              );
            })}
          </RadioGroup>

          <HelperText {...slotProps?.helperText} disableGutters errorMessage={error?.message} helperText={helperText} />
        </FormControl>
      )}
    />
  );
}
