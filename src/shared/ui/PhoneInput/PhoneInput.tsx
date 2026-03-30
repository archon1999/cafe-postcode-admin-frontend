import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';
import { useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import type { TextFieldProps } from '@mui/material/TextField';
import { forwardRef, useMemo, useState, useCallback, useEffect, useRef, type Ref } from 'react';
import PhoneNumberInput, { parsePhoneNumber } from 'react-phone-number-input/input';

import { countries } from 'shared/assets/data';

import { Iconify } from '../Iconify';

import { CountryListPopover } from './ListPopover';
import type { PhoneValue, PhoneCountry, PhoneInputProps } from './types';

export function PhoneInput({
  sx,
  size,
  label,
  placeholder,
  fullWidth = true,
  variant: variantProp,

  value,
  country,
  onChange,
  defaultCountry,
  inputRef,

  hideSelect,
  ...other
}: PhoneInputProps) {
  const theme = useTheme();
  const variant = variantProp ?? theme.components?.MuiTextField?.defaultProps?.variant;

  const normalizedValue = normalizePhoneValue(value);

  const [searchCountry, setSearchCountry] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry | undefined>(
    parseCountryFromPhone(normalizedValue) ?? country ?? defaultCountry,
  );

  const hasLabel = !!label;
  const isCountryLocked = !!country;

  const parsedCountry = useMemo(() => parseCountryFromPhone(normalizedValue), [normalizedValue]);
  const normalizedValueRef = useRef(normalizedValue);

  useEffect(() => {
    normalizedValueRef.current = normalizedValue;
  }, [normalizedValue]);

  const activeCountry = useMemo(() => {
    return parsedCountry ?? country ?? selectedCountry ?? defaultCountry;
  }, [parsedCountry, country, selectedCountry, defaultCountry]);

  const handleChangeInput = useCallback(
    (inputValue: PhoneValue | undefined) => {
      const nextValue = normalizePhoneValue(inputValue);

      if (nextValue === normalizedValueRef.current) {
        return;
      }

      onChange(nextValue);
    },
    [onChange],
  );

  const handleClearInput = useCallback(() => {
    handleChangeInput(undefined);
  }, [handleChangeInput]);

  const handleSearchCountry = useCallback((inputQuery: string) => {
    setSearchCountry(inputQuery);
  }, []);

  const handleSelectedCountry = useCallback(
    (countryCode: PhoneCountry) => {
      setSearchCountry('');
      handleClearInput();
      setSelectedCountry(countryCode);
    },
    [handleClearInput],
  );

  const renderSelect = () => (
    <CountryListPopover
      options={countries}
      searchCountry={searchCountry}
      selectedCountry={activeCountry}
      onSearchCountry={handleSearchCountry}
      onSelectedCountry={handleSelectedCountry}
      disabled={isCountryLocked}
      sx={{
        pl: variant === 'standard' ? 0 : 1.5,
        ...(variant === 'standard' && hasLabel && { mt: size === 'small' ? '16px' : '20px' }),
        ...((variant === 'filled' || variant === 'outlined') && {
          mt: size === 'small' ? '8px' : '16px',
        }),
        ...(variant === 'filled' && hasLabel && { mt: size === 'small' ? '21px' : '25px' }),
      }}
    />
  );

  const renderInput = () => {
    const textFieldProps: Omit<TextFieldProps, 'value' | 'onChange'> = {
      size,
      label,
      variant,
      fullWidth,
      hiddenLabel: !label,
      placeholder: placeholder ?? 'Enter phone number',
      slotProps: {
        inputLabel: { shrink: true },
        input: {
          endAdornment: normalizedValue && (
            <InputAdornment position="end">
              <IconButton size="small" edge="end" onClick={handleClearInput}>
                <Iconify width={16} icon="mingcute:close-line" />
              </IconButton>
            </InputAdornment>
          ),
          sx: (theme) => {
            const backgroundColor = theme.vars?.palette.background.paper ?? theme.palette.background.paper;
            const textColor = theme.vars?.palette.text.primary ?? theme.palette.text.primary;

            return {
              '&:-webkit-autofill,&:-webkit-autofill:hover,&:-webkit-autofill:focus': {
                WebkitBoxShadow: `0 0 0 1000px ${backgroundColor} inset`,
                boxShadow: `0 0 0 1000px ${backgroundColor} inset`,
                WebkitTextFillColor: textColor,
                transition: 'background-color 0s ease-in-out 0s',
              },
              '& input:-webkit-autofill,& input:-webkit-autofill:hover,& input:-webkit-autofill:focus': {
                WebkitBoxShadow: `0 0 0 1000px ${backgroundColor} inset`,
                boxShadow: `0 0 0 1000px ${backgroundColor} inset`,
                WebkitTextFillColor: textColor,
                transition: 'background-color 0s ease-in-out 0s',
              },
            };
          },
        },
      },
    };

    const inputCountry = country ?? selectedCountry ?? defaultCountry;

    const phoneInputProps: PhoneInputProps = {
      value: normalizedValue,
      onChange: handleChangeInput,
      inputRef,
      inputComponent: CustomInput,
      international: true,
      smartCaret: false,
      withCountryCallingCode: true,
      useNationalFormatForDefaultCountryValue: false,
      ...(isCountryLocked ? { country: inputCountry } : { defaultCountry: inputCountry }),
    };

    return <PhoneNumberInput {...textFieldProps} {...phoneInputProps} {...other} />;
  };

  const baseButtonWidth = variant === 'standard' ? '48px' : '60px';
  const disabledButtonWidth = `calc(${baseButtonWidth} - 16px)`;
  const buttonWidth = isCountryLocked ? disabledButtonWidth : baseButtonWidth;

  return (
    <Box
      sx={[
        {
          '--popover-button-mr': '12px',
          '--popover-button-height': '22px',
          '--popover-button-width': buttonWidth,
          position: 'relative',
          ...(fullWidth && { width: 1 }),
          ...(!hideSelect && {
            [`& .${inputBaseClasses.input}`]: {
              pl: 'calc(var(--popover-button-width) + var(--popover-button-mr))',
            },
          }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}>
      {!hideSelect && renderSelect()}
      {renderInput()}
    </Box>
  );
}

const CustomInput = forwardRef<HTMLInputElement, TextFieldProps>(({ inputRef, ...other }, ref) => (
  <TextField inputRef={mergeRefs(ref, inputRef)} {...other} />
));

CustomInput.displayName = 'PhoneInputTextField';

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (value: T | null) => {
    refs.forEach((ref) => {
      if (!ref) return;

      if (typeof ref === 'function') {
        ref(value);
        return;
      }

      (ref as { current: T | null }).current = value;
    });
  };
}

function normalizePhoneValue(inputValue?: PhoneInputProps['value']): PhoneValue | undefined {
  if (!inputValue) {
    return undefined;
  }

  const sanitizedValue = inputValue.trim().replace(/[\s-]+/g, '');
  return sanitizedValue.length > 0 ? (sanitizedValue as PhoneValue) : undefined;
}

function parseCountryFromPhone(inputValue?: PhoneInputProps['value']): PhoneCountry | undefined {
  const parsed = inputValue ? parsePhoneNumber(inputValue) : undefined;
  return parsed?.country ?? undefined;
}
