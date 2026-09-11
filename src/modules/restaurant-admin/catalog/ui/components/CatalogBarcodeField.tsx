import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useEffect, useRef, useState } from 'react';
import { useController, useFormContext } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import type { AdminMxikLookupResult } from 'shared/api/admin-types';

import { useSearchMxikByBarcodeQuery } from '../../application';
import type { CatalogItemFormInput } from '../../data-access/catalogItemForm.schema';

import { buildMxikOption } from './MxikAutocompleteField';
import { useCatalogBarcodeScanner } from './useCatalogBarcodeScanner';

type Request = { barcode: string; mxik: CatalogItemFormInput['mxik'] };

export function CatalogBarcodeField({
  disabled,
  onMxikNamePicked,
  onLookupPendingChange,
}: {
  disabled: boolean;
  onMxikNamePicked: (name: string) => void;
  onLookupPendingChange?: (pending: boolean) => void;
}) {
  const { t, currentLang } = useTranslate('catalog');
  const { control, getValues, setValue } = useFormContext<CatalogItemFormInput>();
  const { field, fieldState } = useController({ control, name: 'barcode' });
  const [request, setRequest] = useState<Request | null>(null);
  const [queued, setQueued] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const applied = useRef<Request | null>(null);
  const query = useSearchMxikByBarcodeQuery(request?.barcode ?? '', currentLang.value);
  const isCurrent = request !== null && request.barcode === (field.value ?? '').trim();
  const options = isCurrent ? (query.data ?? []) : [];
  const pending = queued || (isCurrent && query.isFetching);

  useEffect(() => {
    onLookupPendingChange?.(pending);
  }, [onLookupPendingChange, pending]);
  useEffect(() => () => onLookupPendingChange?.(false), [onLookupPendingChange]);

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!request || applied.current === request || query.data?.length !== 1 || disabled) return;
    if (getValues('barcode')?.trim() !== request.barcode || getValues('mxik') !== request.mxik) return;
    applied.current = request;
    const result = query.data[0];
    setValue('mxik', buildMxikOption(result.code, result.name, result.raw), {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (result.name) onMxikNamePicked(result.name);
  }, [disabled, getValues, onMxikNamePicked, query.data, request, setValue]);

  const search = (value: string, immediate = false) => {
    clearTimeout(timer.current);
    setRequest(null);
    setQueued(false);
    const barcode = value.trim();
    if (!/^(?:[0-9]{8}|[0-9]{12,14})$/.test(barcode)) return;
    const next = { barcode, mxik: getValues('mxik') };
    if (immediate) setRequest(next);
    else {
      setQueued(true);
      timer.current = setTimeout(() => {
        setQueued(false);
        setRequest(next);
      }, 500);
    }
  };
  const pick = (result: AdminMxikLookupResult) => {
    applied.current = request;
    setValue('mxik', buildMxikOption(result.code, result.name, result.raw), {
      shouldDirty: true,
      shouldValidate: true,
    });
    if (result.name) onMxikNamePicked(result.name);
  };
  useCatalogBarcodeScanner(!disabled, (barcode) => {
    field.onChange(barcode);
    search(barcode, true);
  });
  const helper = fieldState.error
    ? 'barcode.invalid'
    : isCurrent && query.isFetching
      ? 'barcode.loading'
      : isCurrent && query.isError
        ? 'barcode.error'
        : isCurrent && query.isSuccess && options.length === 0
          ? 'barcode.notFound'
          : options.length > 1
            ? 'barcode.choose'
            : options.length === 1
              ? 'barcode.found'
              : 'barcode.hint';

  return (
    <Stack spacing={1}>
      <TextField
        {...field}
        value={field.value ?? ''}
        label={t('barcode.label')}
        disabled={disabled}
        error={Boolean(fieldState.error) || (isCurrent && query.isError)}
        helperText={t(helper)}
        slotProps={{ htmlInput: { inputMode: 'numeric', autoComplete: 'off' } }}
        onChange={(event) => {
          field.onChange(event);
          search(event.target.value);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.stopPropagation();
            search(field.value ?? '', true);
          }
        }}
      />
      {isCurrent && query.isError && (
        <Button type="button" disabled={disabled || query.isFetching} onClick={() => void query.refetch()}>
          {t('barcode.retry')}
        </Button>
      )}
      {options.length > 1 &&
        options.map((option) => (
          <Button type="button" key={option.code} disabled={disabled} onClick={() => pick(option)}>
            {option.label}
          </Button>
        ))}
    </Stack>
  );
}
