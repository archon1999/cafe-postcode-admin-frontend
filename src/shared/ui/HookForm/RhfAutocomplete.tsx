import type { AutocompleteProps } from '@mui/material/Autocomplete';
import Autocomplete from '@mui/material/Autocomplete';
import type { TextFieldProps } from '@mui/material/TextField';
import TextField from '@mui/material/TextField';
import { Controller, useFormContext, type FieldPath, type FieldValues, type PathValue } from 'react-hook-form';

type Multiple = boolean | undefined;
type DisableClearable = boolean | undefined;
type FreeSolo = boolean | undefined;

type ExcludedProps = 'renderInput';

export type AutocompleteBaseProps<TOption = unknown> = Omit<
  AutocompleteProps<TOption, Multiple, DisableClearable, FreeSolo>,
  ExcludedProps
>;

export type RHFAutocompleteProps<T extends FieldValues = FieldValues, TOption = unknown> = AutocompleteBaseProps<TOption> & {
  name: FieldPath<T>;
  label?: string;
  placeholder?: string;
  helperText?: React.ReactNode;
  slotProps?: AutocompleteBaseProps['slotProps'] & {
    textField?: Partial<TextFieldProps>;
  };
};

export function RHFAutocomplete<T extends FieldValues = FieldValues, TOption = unknown>({
  name,
  label,
  slotProps,
  helperText,
  placeholder,
  ...other
}: RHFAutocompleteProps<T, TOption>) {
  const { control, setValue } = useFormContext<T>();

  const { textField, ...otherSlotProps } = slotProps ?? {};

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <Autocomplete
          {...field}
          id={`${name}-rhf-autocomplete`}
          onChange={(_event, newValue) =>
            setValue(name, newValue as PathValue<T, FieldPath<T>>, { shouldValidate: true })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              {...textField}
              label={label}
              placeholder={placeholder}
              error={!!error}
              helperText={error?.message ?? helperText}
              slotProps={{
                ...textField?.slotProps,
                inputLabel: {
                  shrink: true,
                  ...textField?.slotProps?.inputLabel,
                },
                htmlInput: {
                  ...params.inputProps,
                  ...textField?.slotProps?.htmlInput,
                  autoComplete: 'new-password',
                },
              }}
            />
          )}
          slotProps={{
            ...otherSlotProps,
            chip: {
              size: 'small',
              variant: 'soft',
              ...otherSlotProps?.chip,
            },
          }}
          {...other}
        />
      )}
    />
  );
}
