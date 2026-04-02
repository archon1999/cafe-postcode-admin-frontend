import type { FieldValues, Path } from 'react-hook-form';

import { useTranslate } from 'app/providers/locales';
import type { AdminMxikLookupResult } from 'shared/api/admin-types';
import { RHFAutocompleteWithQuery, type OptionBase } from 'shared/ui/HookForm';

import { useSearchMxikQuery } from '../../application';

export type MxikOption = OptionBase & {
  value: string;
  code: string;
  name: string;
  raw?: Record<string, unknown>;
};

type MxikAutocompleteFieldProps<TForm extends FieldValues> = {
  name: Path<TForm>;
  label: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
};

export function buildMxikOption(code?: string | null, name?: string | null): MxikOption | null {
  const normalizedCode = code?.trim();

  if (!normalizedCode) {
    return null;
  }

  const normalizedName = name?.trim() ?? '';

  return {
    value: normalizedCode,
    code: normalizedCode,
    name: normalizedName,
    label: normalizedName ? `${normalizedCode} - ${normalizedName}` : normalizedCode,
  };
}

export function MxikAutocompleteField<TForm extends FieldValues>({
  name,
  label,
  helperText,
  placeholder,
  required,
}: MxikAutocompleteFieldProps<TForm>) {
  const { t: tCatalog, currentLang } = useTranslate('catalog');
  const providerLang = currentLang.value === 'ru' ? 'ru' : 'uz';

  return (
    <RHFAutocompleteWithQuery<TForm, AdminMxikLookupResult[], MxikOption, false, false, false>
      name={name}
      label={label}
      helperText={helperText}
      placeholder={placeholder}
      required={required}
      valueMode="object"
      searchKey="query"
      queryFilters={{ lang: providerLang, limit: 20 }}
      useQueryHook={useSearchMxikQuery}
      transformData={(data) =>
        (data ?? [])
          .map((item) => ({
            value: item.code,
            code: item.code,
            name: item.name,
            label: item.label || `${item.code} - ${item.name}`,
            raw: item.raw,
          }))
          .filter((item) => Boolean(item.value))
      }
      loadingText={tCatalog('labels.mxikLoading')}
      noOptionsText={tCatalog('labels.mxikNotFound')}
    />
  );
}
