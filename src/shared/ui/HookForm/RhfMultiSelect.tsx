import Box from '@mui/material/Box';
import type { CheckboxProps } from '@mui/material/Checkbox';
import Checkbox from '@mui/material/Checkbox';
import type { ChipProps } from '@mui/material/Chip';
import Chip from '@mui/material/Chip';
import type { FormControlProps } from '@mui/material/FormControl';
import FormControl from '@mui/material/FormControl';
import type { FormHelperTextProps } from '@mui/material/FormHelperText';
import type { InputLabelProps } from '@mui/material/InputLabel';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import type { SelectProps } from '@mui/material/Select';
import Select from '@mui/material/Select';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

import { HelperText } from './HelpText';

type RHFMultiSelectProps<T extends FieldValues = FieldValues> = FormControlProps & {
  name: FieldPath<T>;
  label?: string;
  chip?: boolean;
  checkbox?: boolean;
  placeholder?: string;
  helperText?: React.ReactNode;
  options: { label: string; value: string }[];
  slotProps?: {
    chip?: ChipProps;
    select?: SelectProps;
    checkbox?: CheckboxProps;
    inputLabel?: InputLabelProps;
    helperText?: FormHelperTextProps;
  };
};

export function RHFMultiSelect<T extends FieldValues = FieldValues>({
  name,
  chip,
  label,
  options,
  checkbox,
  placeholder,
  slotProps,
  helperText,
  ...other
}: RHFMultiSelectProps<T>) {
  const { control } = useFormContext();

  const labelId = `${name}-multi-select`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const renderLabel = () => (
          <InputLabel htmlFor={labelId} {...slotProps?.inputLabel}>
            {label}
          </InputLabel>
        );

        const renderOptions = () =>
          options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {checkbox && (
                <Checkbox
                  size="small"
                  disableRipple
                  checked={field.value.includes(option.value)}
                  {...slotProps?.checkbox}
                />
              )}

              {option.label}
            </MenuItem>
          ));

        return (
          <FormControl error={!!error} {...other}>
            {label && renderLabel()}

            <Select
              {...field}
              multiple
              displayEmpty={!!placeholder}
              label={label}
              renderValue={(selected) => {
                const selectedItems = options.filter((item) => (selected as string[]).includes(item.value));

                if (!selectedItems.length && placeholder) {
                  return <Box sx={{ color: 'text.disabled' }}>{placeholder}</Box>;
                }

                if (chip) {
                  return (
                    <Box sx={{ gap: 0.5, display: 'flex', flexWrap: 'wrap' }}>
                      {selectedItems.map((item) => (
                        <Chip key={item.value} size="small" variant="soft" label={item.label} {...slotProps?.chip} />
                      ))}
                    </Box>
                  );
                }

                return selectedItems.map((item) => item.label).join(', ');
              }}
              {...slotProps?.select}
              inputProps={{
                id: labelId,
                ...slotProps?.select?.inputProps,
              }}>
              {renderOptions()}
            </Select>

            <HelperText {...slotProps?.helperText} errorMessage={error?.message} helperText={helperText} />
          </FormControl>
        );
      }}
    />
  );
}
