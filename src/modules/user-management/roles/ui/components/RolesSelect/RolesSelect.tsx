import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import type { SxProps, Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, type ReactNode } from 'react';
import { Controller, useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';

export type RoleSelectOption = {
  code?: string;
  description?: string;
  id: string;
  name: string;
};

type RolesSelectProps<T extends FieldValues = FieldValues> = {
  enabled?: boolean;
  helperText?: ReactNode;
  label?: string;
  name: FieldPath<T>;
  options: RoleSelectOption[];
  sx?: SxProps<Theme>;
};

const filterOptions = createFilterOptions<RoleSelectOption>({
  stringify: (option) => `${option.description ?? ''} ${option.name} ${option.code ?? ''}`,
});

export function RolesSelect<T extends FieldValues = FieldValues>({
  enabled = true,
  helperText,
  label,
  name,
  options,
  sx,
}: RolesSelectProps<T>) {
  const { t } = useTranslate('common');
  const { control } = useFormContext<T>();
  const optionsById = useMemo(() => new Map(options.map((option) => [option.id, option])), [options]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selectedIds = Array.isArray(field.value) ? field.value : [];
        const selectedOptions = selectedIds
          .map((value) => optionsById.get(value))
          .filter((option): option is RoleSelectOption => Boolean(option));

        return (
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={options}
            value={selectedOptions}
            disabled={!enabled}
            filterOptions={filterOptions}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, newValue) => field.onChange(newValue.map((option) => option.id))}
            onBlur={field.onBlur}
            noOptionsText={t('empty.noData')}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} size="small" variant="soft" label={option.name} />
              ))
            }
            renderOption={(props, option, { selected }) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Checkbox size="small" disableRipple checked={selected} sx={{ mt: 0.25, p: 0.5 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2">{option.name}</Typography>
                  {option.description || option.code ? (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {option.description || option.code}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!error}
                helperText={error?.message ?? helperText}
                inputProps={{
                  ...params.inputProps,
                  autoComplete: 'new-password',
                }}
              />
            )}
            slotProps={{
              chip: {
                size: 'small',
                variant: 'soft',
              },
            }}
            sx={sx}
          />
        );
      }}
    />
  );
}
