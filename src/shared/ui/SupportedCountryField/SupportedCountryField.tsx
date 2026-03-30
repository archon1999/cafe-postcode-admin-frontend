import type { FormControlProps } from '@mui/material/FormControl';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import type { FormLabelProps } from '@mui/material/FormLabel';
import FormLabel from '@mui/material/FormLabel';
import type { RadioProps } from '@mui/material/Radio';
import Radio from '@mui/material/Radio';
import type { RadioGroupProps } from '@mui/material/RadioGroup';
import RadioGroup from '@mui/material/RadioGroup';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { Controller, useFormContext, type FieldValues, type Path } from 'react-hook-form';
import { z } from 'zod';

const SUPPORTED_COUNTRY_KEYS = ['usa', 'canada', 'mexico'] as const;

export const supportedCountrySchema = z.enum(SUPPORTED_COUNTRY_KEYS);

export type SupportedCountryValue = z.infer<typeof supportedCountrySchema>;

export const SUPPORTED_COUNTRIES: Record<SupportedCountryValue, { label: string; matchers: string[] }> = {
  usa: { label: 'USA', matchers: ['united states', 'usa'] },
  canada: { label: 'Canada', matchers: ['canada'] },
  mexico: { label: 'Mexico', matchers: ['mexico'] },
};

export const SUPPORTED_COUNTRY_OPTIONS: { label: string; value: SupportedCountryValue }[] = SUPPORTED_COUNTRY_KEYS.map(
  (key) => ({
    label: SUPPORTED_COUNTRIES[key].label,
    value: key,
  }),
);

export const resolveSupportedCountryByName = (name?: string): SupportedCountryValue => {
  if (!name) {
    return 'usa';
  }

  const normalized = name.toLowerCase();

  const match = SUPPORTED_COUNTRY_KEYS.find((key) =>
    SUPPORTED_COUNTRIES[key].matchers.some((matcher) => normalized.includes(matcher)),
  );

  return match ?? 'usa';
};

type SupportedCountryFieldProps<TForm extends FieldValues, TValue extends string> = {
  name: Path<TForm>;
  disabled?: boolean;
  helperText?: ReactNode;
  label?: ReactNode;
  formControlProps?: FormControlProps;
  formLabelProps?: FormLabelProps;
  radioProps?: RadioProps;
  radioGroupProps?: Omit<RadioGroupProps, 'name' | 'onChange'>;
  optionValues?: Partial<Record<SupportedCountryValue, TValue>>;
  sx?: SxProps<Theme>;
};

export function SupportedCountryField<
  TForm extends FieldValues = FieldValues,
  TValue extends string = SupportedCountryValue,
>({
  name,
  disabled = false,
  helperText,
  label,
  formControlProps,
  formLabelProps,
  radioProps,
  radioGroupProps,
  optionValues,
  sx,
}: SupportedCountryFieldProps<TForm, TValue>) {
  const { control } = useFormContext<TForm>();
  const formControlSx = Array.isArray(formControlProps?.sx) ? [...formControlProps.sx, sx] : [formControlProps?.sx, sx];
  const { sx: radioGroupSx, ...restRadioGroupProps } = radioGroupProps ?? {};
  const labelId = `${String(name)}-supported-country-label`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <FormControl
          component="fieldset"
          disabled={disabled}
          error={!!fieldState.error}
          {...formControlProps}
          sx={formControlSx}>
          {label ? (
            <FormLabel id={labelId} component="legend" sx={{ typography: 'body2', mb: 1 }} {...formLabelProps}>
              {label}
            </FormLabel>
          ) : null}

          <RadioGroup
            {...field}
            row
            aria-labelledby={label ? labelId : undefined}
            onChange={(event) => field.onChange(event.target.value as TValue)}
            sx={[
              {
                flexWrap: 'wrap',
                '& .MuiFormControlLabel-root': {
                  flex: '1 0 33.333%',
                  margin: 0,
                },
              },
              ...(Array.isArray(radioGroupSx) ? radioGroupSx : [radioGroupSx]),
            ]}
            {...restRadioGroupProps}>
            {SUPPORTED_COUNTRY_OPTIONS.map((option) => {
              const optionValue = (optionValues?.[option.value] ?? option.value) as TValue;

              return (
                <FormControlLabel
                  key={option.value}
                  value={optionValue}
                  control={<Radio {...radioProps} />}
                  label={option.label}
                  disabled={disabled}
                />
              );
            })}
          </RadioGroup>
          {fieldState.error?.message || helperText ? (
            <FormHelperText>{fieldState.error?.message ?? helperText}</FormHelperText>
          ) : null}
        </FormControl>
      )}
    />
  );
}
