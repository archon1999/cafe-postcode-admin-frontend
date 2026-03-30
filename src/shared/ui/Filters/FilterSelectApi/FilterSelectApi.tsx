import { AutocompleteChangeReason, Autocomplete, Checkbox, TextField, AutocompleteChangeDetails } from '@mui/material';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import type { SyntheticEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

export type FilterOption = { value: string | number; label: string };

type FilterSelectApiProps<TData> = {
  label: string;
  value: Array<string | number>;
  useQueryHook: (
    filters: any,
    options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>,
  ) => UseQueryResult<TData, Error>;
  mapDataToOptions: (data: TData) => FilterOption[];
  onChange: (selectedValues: Array<string | number>) => void;
  onApply: () => void;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  filters?: any;
  fullWidth?: boolean;
  menuContainer?: HTMLElement | null;
  inputTestId?: string;
  emptyLabel?: string;
};

export function FilterSelectApi<TData>({
  label,
  value,
  useQueryHook,
  mapDataToOptions,
  onChange,
  loadingText = 'Loading...',
  errorText = 'Failed to load data',
  emptyText = 'No options available',
  filters = {},
  fullWidth = false,
  menuContainer,
  inputTestId,
  emptyLabel = 'All',
}: FilterSelectApiProps<TData>) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<FilterOption[]>([]);

  const shouldEnableQuery = isOpen || value.length > 0;
  const { data, isLoading, isError, error } = useQueryHook(filters, {
    enabled: shouldEnableQuery,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setOptions(mapDataToOptions(data));
  }, [data, mapDataToOptions]);

  const optionsMap = useMemo(() => {
    const map = new Map<string, FilterOption>();
    options.forEach((option) => {
      map.set(String(option.value), option);
    });
    return map;
  }, [options]);

  const selectedOptions = useMemo(() => {
    return value.map((selectedValue) => {
      const option = optionsMap.get(String(selectedValue));
      if (option) {
        return option;
      }

      return { value: selectedValue, label: String(selectedValue) } satisfies FilterOption;
    });
  }, [optionsMap, value]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleChange = (
    _event: SyntheticEvent,
    newValue: FilterOption[],
    _reason: AutocompleteChangeReason,
    _details?: AutocompleteChangeDetails<FilterOption>,
  ) => {
    onChange(newValue.map((item) => item.value));
  };

  const noOptionsText = isError ? error?.message || errorText : emptyText;

  return (
    <Autocomplete
      multiple
      disableCloseOnSelect
      options={options}
      value={selectedOptions}
      onChange={handleChange}
      open={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, selected) => String(option.value) === String(selected.value)}
      fullWidth={fullWidth}
      sx={fullWidth ? { width: 1 } : { flexShrink: 0, minWidth: { xs: 1, md: 230 } }}
      loading={isLoading}
      loadingText={loadingText}
      noOptionsText={noOptionsText}
      slotProps={{
        popper: {
          disablePortal: true,
          ...(menuContainer ? { container: menuContainer } : {}),
        },
        listbox: {
          sx: {
            maxHeight: 280,
            overflow: 'auto',
          },
        },
      }}
      renderOption={(props, option, { selected }) => (
        <li {...props}>
          <Checkbox
            disableRipple
            size="small"
            checked={selected}
            slotProps={{ input: { id: `${option.value}-checkbox` } }}
            sx={{ mr: 1 }}
          />
          {option.label}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={selectedOptions.length > 0 ? undefined : emptyLabel}
          variant="outlined"
          size="small"
          error={isError}
          helperText={isError ? (error?.message ?? errorText) : undefined}
          inputProps={{
            ...params.inputProps,
            ...(inputTestId ? { 'data-testid': inputTestId } : {}),
          }}
          InputLabelProps={{
            ...params.InputLabelProps,
            shrink: true,
          }}
        />
      )}
    />
  );
}
