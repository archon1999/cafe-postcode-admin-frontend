import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { debounce } from 'es-toolkit';
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type ReactNode } from 'react';

import { Iconify } from 'shared/ui/Iconify';

type DebouncedHandler = ((value: string) => void) & { cancel?: () => void };

type TableSearchInputProps = Omit<TextFieldProps, 'onChange' | 'value'> & {
  value?: string;
  onChange: (value: string) => void;
  debounceTime?: number;
  onClear?: () => void;
  startIcon?: ReactNode;
  clearIcon?: ReactNode;
  clearAriaLabel?: string;
};

export function TableSearchInput({
  value,
  onChange,
  onClear,
  startIcon = <Iconify icon="eva:search-fill" width={18} sx={{ color: 'text.disabled' }} />,
  clearIcon = <Iconify icon="mingcute:close-line" width={16} />,
  clearAriaLabel,
  debounceTime = 1000,
  InputProps,
  ...textFieldProps
}: TableSearchInputProps) {
  const [inputValue, setInputValue] = useState(value ?? '');

  useEffect(() => {
    if (value === undefined) {
      return;
    }

    setInputValue(value);
  }, [value]);

  const debouncedOnChange = useMemo<DebouncedHandler | null>(() => {
    if (debounceTime <= 0) {
      return ((nextValue: string) => onChange(nextValue)) as DebouncedHandler;
    }

    return debounce((nextValue: string) => {
      onChange(nextValue);
    }, debounceTime);
  }, [debounceTime, onChange]);

  useEffect(() => {
    return () => {
      debouncedOnChange?.cancel?.();
    };
  }, [debouncedOnChange]);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setInputValue(nextValue);
      debouncedOnChange?.(nextValue);
    },
    [debouncedOnChange],
  );

  const handleClear = useCallback(() => {
    debouncedOnChange?.cancel?.();
    setInputValue('');

    if (onClear) {
      onClear();
      return;
    }

    onChange('');
  }, [debouncedOnChange, onChange, onClear]);

  const hasValue = Boolean(inputValue?.length);

  return (
    <TextField
      {...textFieldProps}
      value={inputValue}
      onChange={handleChange}
      InputProps={{
        ...InputProps,
        startAdornment: InputProps?.startAdornment ?? <InputAdornment position="start">{startIcon}</InputAdornment>,
        endAdornment: hasValue ? (
          <InputAdornment position="end">
            <IconButton size="small" aria-label={clearAriaLabel} onClick={handleClear}>
              {clearIcon}
            </IconButton>
          </InputAdornment>
        ) : (
          InputProps?.endAdornment
        ),
      }}
    />
  );
}
