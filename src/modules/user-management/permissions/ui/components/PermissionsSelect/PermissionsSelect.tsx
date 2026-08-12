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
import type { AdminPermission } from 'shared/api/admin-types';

import { useGetPermissionsQuery } from '../../../application';

type PermissionSelectOption = AdminPermission & {
  groupLabel: string;
};

type PermissionsSelectProps<T extends FieldValues = FieldValues> = {
  name: FieldPath<T>;
  label?: string;
  helperText?: ReactNode;
  enabled?: boolean;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

const filterOptions = createFilterOptions<PermissionSelectOption>({
  stringify: (option) => `${option.description} ${option.name} ${option.code} ${option.groupLabel}`,
});

function getPermissionPrefix(code: string) {
  return code.split('.')[0] ?? code;
}

export function PermissionsSelect<T extends FieldValues = FieldValues>({
  name,
  label,
  helperText,
  enabled = true,
  disabled,
  sx,
}: PermissionsSelectProps<T>) {
  const { t } = useTranslate('common');
  const { t: tUsers } = useTranslate('users');
  const { control } = useFormContext<T>();
  const permissionsQuery = useGetPermissionsQuery({ enabled });

  const options = useMemo<PermissionSelectOption[]>(
    () =>
      (permissionsQuery.data ?? [])
        .map((permission) => {
          const prefix = getPermissionPrefix(permission.code);

          return {
            ...permission,
            groupLabel: prefix,
          };
        })
        .sort((left, right) => left.groupLabel.localeCompare(right.groupLabel) || left.code.localeCompare(right.code)),
    [permissionsQuery.data],
  );

  const optionsById = useMemo(() => new Map(options.map((option) => [option.id, option])), [options]);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => {
        const selectedIds = Array.isArray(field.value) ? field.value : [];
        const selectedOptions = selectedIds
          .map((value) => optionsById.get(value))
          .filter((option): option is PermissionSelectOption => Boolean(option));

        return (
          <Autocomplete
            multiple
            disableCloseOnSelect
            options={options}
            value={selectedOptions}
            loading={permissionsQuery.isLoading}
            disabled={disabled || !enabled}
            filterOptions={filterOptions}
            groupBy={(option) => option.groupLabel}
            getOptionLabel={(option) => option.description || option.name || option.code}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(_event, newValue) => field.onChange(newValue.map((option) => option.id))}
            onBlur={field.onBlur}
            noOptionsText={permissionsQuery.isLoading ? t('labels.loading') : t('empty.noData')}
            renderTags={(value, getTagProps) => {
              if (value.length >= 6) {
                return [
                  <Chip
                    key="permissions-count"
                    size="small"
                    variant="soft"
                    label={tUsers('labels.permissionsSelectedCount', {
                      count: value.length,
                    })}
                  />,
                ];
              }

              return value.map((option, index) => (
                <Chip
                  {...getTagProps({ index })}
                  key={option.id}
                  size="small"
                  variant="soft"
                  label={option.description || option.name || option.code}
                />
              ));
            }}
            renderOption={(props, option, { selected }) => (
              <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                <Checkbox size="small" disableRipple checked={selected} sx={{ mt: 0.25, p: 0.5 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2">{option.description || option.name || option.code}</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {option.code}
                  </Typography>
                </Box>
              </Box>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={label}
                error={!!error}
                helperText={error?.message ?? (permissionsQuery.isLoading ? t('labels.loading') : helperText)}
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
