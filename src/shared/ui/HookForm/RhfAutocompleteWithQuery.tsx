import { Autocomplete, TextField, CircularProgress, type TextFieldProps } from '@mui/material';
import { createFilterOptions, type AutocompleteProps } from '@mui/material/Autocomplete';
import type { UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { debounce } from 'es-toolkit';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { type FieldValues, useFormContext, Controller, type Path } from 'react-hook-form';

import type { AutocompleteBaseProps } from './RhfAutocomplete';

export type OptionBase = { label: string; value: string | number; [k: string]: any };

type BaseAutocompleteProps<
  TOption,
  TMultiple extends boolean | undefined,
  TDisableClearable extends boolean | undefined,
  TFreeSolo extends boolean | undefined,
> = Omit<
  AutocompleteProps<TOption, TMultiple, TDisableClearable, TFreeSolo>,
  | 'value'
  | 'onChange'
  | 'options'
  | 'loading'
  | 'filterOptions'
  | 'getOptionLabel'
  | 'isOptionEqualToValue'
  | 'onInputChange'
  | 'renderInput'
>;

type WithQueryProps<TForm extends FieldValues, TQueryData, TOption extends OptionBase> = {
  name: Path<TForm>;
  label?: string;
  placeholder?: string;
  helperText?: string;

  useQueryHook: (
    params: Record<string, any>,
    options?: Omit<UseQueryOptions<TQueryData>, 'queryKey' | 'queryFn'>,
  ) => UseQueryResult<TQueryData>;
  queryFilters?: Record<string, any>;
  transformData: (data: TQueryData | undefined) => TOption[];

  enableSearch?: boolean;
  searchKey?: string;
  searchDebounce?: number;

  loadingText?: string;
  noOptionsText?: string;
  errorText?: string;

  valueMode?: 'id' | 'object';

  isOptionEqualToValue?: (opt: TOption, val: TOption) => boolean;

  onPicked?: (picked: TOption | null) => void;

  slotProps?: AutocompleteBaseProps['slotProps'] & {
    textField?: Partial<TextFieldProps>;
  };
  startadornment?: (formValue: TOption | null) => React.ReactNode;

  dependsOn?: Path<TForm>[];
  resetOnDependencyChange?: boolean;
  getDependencyValue?: (fieldValue: any) => any;
  required?: boolean;
};

export type RHFAutocompleteWithQueryProps<
  TForm extends FieldValues,
  TQueryData,
  TOption extends OptionBase,
  TMultiple extends boolean | undefined,
  TDisableClearable extends boolean | undefined,
  TFreeSolo extends boolean | undefined,
> = WithQueryProps<TForm, TQueryData, TOption> &
  BaseAutocompleteProps<TOption, TMultiple, TDisableClearable, TFreeSolo>;

export function RHFAutocompleteWithQuery<
  TForm extends FieldValues = FieldValues,
  TQueryData = unknown,
  TOption extends OptionBase = OptionBase,
  TMultiple extends boolean = false,
  TDisableClearable extends boolean = false,
  TFreeSolo extends boolean = false,
>({
  name,
  label,
  placeholder,
  helperText,
  disabled,
  useQueryHook,
  queryFilters = {},
  transformData,
  enableSearch = true,
  searchKey = 'search',
  searchDebounce = 300,
  loadingText = 'Loading...',
  noOptionsText = 'No options',
  errorText = 'Error loading options',
  valueMode = 'object',
  isOptionEqualToValue = (a, b) => a.value === b.value,
  onPicked,
  slotProps,
  dependsOn = [],
  resetOnDependencyChange = true,
  getDependencyValue = (val) => val?.value ?? null,
  required = false,
  renderOption: renderOptionProp,

  ...other
}: RHFAutocompleteWithQueryProps<TForm, TQueryData, TOption, TMultiple, TDisableClearable, TFreeSolo>) {
  const { control, watch, resetField } = useFormContext<TForm>();
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [open, setOpen] = useState<boolean>(false);
  const watchedValue = watch(name);

  const isInitialMount = useRef(true);
  const prevDependencyValuesRef = useRef<any[]>([]);

  const { textField, ...otherSlotProps } = slotProps ?? {};

  const debouncedSetSearch = useMemo(
    () => debounce((v: string) => setDebouncedSearch(v), searchDebounce),
    [searchDebounce],
  );

  useEffect(() => {
    if (dependsOn.length === 0 || !resetOnDependencyChange) return;

    const subscription = watch((formValues, { name: changedField }) => {
      if (isInitialMount.current) {
        isInitialMount.current = false;
        prevDependencyValuesRef.current = dependsOn.map((fieldName) => {
          const value = formValues[fieldName as string];
          return getDependencyValue(value);
        });
        return;
      }

      const isDependencyChanged = dependsOn.some((fieldName) => fieldName === changedField);

      if (isDependencyChanged) {
        const currentDependencyValues = dependsOn.map((fieldName) => {
          const value = formValues[fieldName as string];
          return getDependencyValue(value);
        });

        const hasChanged = currentDependencyValues.some(
          (currentVal, index) => currentVal !== prevDependencyValuesRef.current[index],
        );

        if (hasChanged) {
          resetField(name);
          prevDependencyValuesRef.current = currentDependencyValues;
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [dependsOn, resetOnDependencyChange, watch, resetField, name, getDependencyValue]);

  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  const finalQueryFilters = useMemo(() => {
    if (!enableSearch || !debouncedSearch) return queryFilters;
    return { ...queryFilters, [searchKey]: debouncedSearch };
  }, [queryFilters, debouncedSearch, enableSearch, searchKey]);

  const hasInitialValue = useMemo(() => {
    if (other.multiple) {
      return Array.isArray(watchedValue) ? watchedValue.length > 0 : false;
    }

    if (valueMode === 'object') {
      return Boolean(watchedValue);
    }

    return watchedValue !== null && watchedValue !== undefined && watchedValue !== '';
  }, [other.multiple, valueMode, watchedValue]);

  const query = useQueryHook(finalQueryFilters, {
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    enabled: open || hasInitialValue,
  });

  const { data, isLoading, isError, error } = query;

  const options = useMemo(() => {
    const transformedOptions = transformData(data);
    const optionsMap = new Map<string, TOption>();

    transformedOptions.forEach((option, index) => {
      const optionValue = option?.value;
      const hasPrimitiveValue = optionValue !== undefined && optionValue !== null && optionValue !== '';
      const optionKey = hasPrimitiveValue
        ? `value:${String(optionValue)}|label:${option?.label ?? ''}`
        : `label:${option?.label ?? ''}:${index}`;

      if (!optionsMap.has(optionKey)) {
        optionsMap.set(optionKey, option);
      }
    });

    return Array.from(optionsMap.values());
  }, [data, transformData]);

  const defaultFilterOptions = useMemo(() => createFilterOptions<TOption>(), []);

  const filterOptions = useCallback(
    (items: TOption[], state: Parameters<typeof defaultFilterOptions>[1]) => {
      const filtered = enableSearch ? items : defaultFilterOptions(items, state);
      const uniqueOptions = new Map<string, TOption>();

      filtered.forEach((option, index) => {
        const optionValue = option?.value;
        const hasValue = optionValue !== undefined && optionValue !== null && optionValue !== '';
        const optionKey = hasValue
          ? `value:${String(optionValue)}|label:${option?.label ?? ''}`
          : `label:${option?.label ?? ''}:${index}`;

        if (!uniqueOptions.has(optionKey)) {
          uniqueOptions.set(optionKey, option);
        }
      });

      return Array.from(uniqueOptions.values());
    },
    [enableSearch, defaultFilterOptions],
  );

  const defaultRenderOption = useCallback((props: React.HTMLAttributes<HTMLLIElement>, option: TOption) => {
    const otherProps = {
      ...props,
    } as React.HTMLAttributes<HTMLLIElement> & { key?: React.Key };

    delete otherProps.key;

    const optionKey = typeof option === 'string' ? option : String(option?.value ?? option?.label ?? '');

    return (
      <li key={optionKey} {...otherProps}>
        {typeof option === 'string' ? option : (option?.label ?? '')}
      </li>
    );
  }, []);

  const handleInputChange = useCallback(
    (_e: React.SyntheticEvent, newInput: string, reason: string) => {
      if (reason === 'input' && enableSearch) {
        debouncedSetSearch(newInput);
      } else if (reason === 'clear' || reason === 'reset') {
        debouncedSetSearch.cancel();
        setDebouncedSearch('');
      }
    },
    [enableSearch, debouncedSetSearch],
  );

  const handleChange = useCallback(
    (_e: React.SyntheticEvent, newOption: TOption | TOption[] | null, reason: string) => {
      if (newOption && reason === 'selectOption') {
        debouncedSetSearch.cancel();
        setDebouncedSearch('');
      }
    },
    [debouncedSetSearch],
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const formValue = field.value as any;

        const selectedOption: TOption | TOption[] | null = (() => {
          if (other.multiple) {
            if (!formValue) return [];

            if (Array.isArray(formValue)) {
              if (valueMode === 'object') {
                return formValue;
              } else {
                return formValue.map((val) => options.find((o) => o.value === val)).filter(Boolean) as TOption[];
              }
            }

            return [];
          } else {
            if (valueMode === 'object') {
              return formValue ?? null;
            } else {
              return options.find((o) => o.value === formValue) ?? null;
            }
          }
        })();

        return (
          <Autocomplete<TOption, TMultiple, TDisableClearable, TFreeSolo>
            open={open}
            onOpen={() => {
              setOpen(true);
            }}
            onClose={() => {
              setOpen(false);
            }}
            options={options}
            value={selectedOption as any}
            loading={isLoading}
            disabled={disabled}
            filterOptions={filterOptions}
            isOptionEqualToValue={isOptionEqualToValue}
            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : (opt?.label ?? ''))}
            noOptionsText={isError ? errorText : noOptionsText}
            loadingText={loadingText}
            renderOption={renderOptionProp ?? defaultRenderOption}
            onInputChange={handleInputChange}
            onChange={(e, newOption, reason) => {
              if (!newOption) {
                field.onChange(valueMode === 'object' ? null : '');
                onPicked?.(null);
              } else {
                field.onChange(valueMode === 'object' ? newOption : (newOption as TOption).value);
                onPicked?.(newOption as TOption);
              }

              handleChange(e, newOption as TOption, reason);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                {...textField}
                required={required}
                inputRef={field.ref}
                label={label}
                placeholder={placeholder}
                error={!!fieldState.error || isError}
                helperText={
                  fieldState.error?.message ?? (isError ? ((error as any)?.message ?? errorText) : helperText)
                }
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
                  input: {
                    ...params.InputProps,
                    ...textField?.slotProps?.input,
                    ...(!other.multiple && {
                      startAdornment: other.startadornment?.(formValue as TOption | null),
                    }),
                    endAdornment: (
                      <>
                        {isLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
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
        );
      }}
    />
  );
}
