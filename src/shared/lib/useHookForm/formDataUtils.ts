import type { FieldValues } from 'react-hook-form';

type FormFieldValue = string | number | boolean | object | null | undefined;

interface FieldOptionsWithDefault<T> {
  apiValue: FormFieldValue;

  defaultValue: T;

  allowEmptyString?: boolean;
}

interface FieldOptionsWithoutDefault {
  apiValue: FormFieldValue;

  defaultValue?: undefined;

  allowEmptyString?: boolean;
}

type FieldOptions<T> = FieldOptionsWithDefault<T> | FieldOptionsWithoutDefault;

export function getFormFieldValue<T = FormFieldValue>(options: FieldOptionsWithDefault<T>): T;
export function getFormFieldValue<T = FormFieldValue>(options: FieldOptionsWithoutDefault): T | undefined;
export function getFormFieldValue<T = FormFieldValue>({
  apiValue,
  defaultValue,
  allowEmptyString = false,
}: FieldOptions<T>): T | undefined {
  const hasValidApiValue = apiValue !== null && apiValue !== undefined && (allowEmptyString || apiValue !== '');

  if (hasValidApiValue) {
    return apiValue as T;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  return undefined;
}

interface SelectValue {
  label: string;
  value: number | string;
}

interface SelectOptionsWithDefault<T extends SelectValue> {
  apiValue?: T | null;
  defaultValue: T;
}

interface SelectOptionsWithoutDefault {
  apiValue?: SelectValue | null;
  defaultValue?: undefined;
}

type SelectOptions<T extends SelectValue> = SelectOptionsWithDefault<T> | SelectOptionsWithoutDefault;

export function getSelectFieldValue<T extends SelectValue>(options: SelectOptionsWithDefault<T>): T;
export function getSelectFieldValue<T extends SelectValue>(options: SelectOptionsWithoutDefault): T | undefined;
export function getSelectFieldValue<T extends SelectValue>({
  apiValue,
  defaultValue,
}: SelectOptions<T>): T | undefined {
  if (apiValue && apiValue.value !== null && apiValue.value !== undefined) {
    return apiValue as T;
  }

  return defaultValue;
}

interface DefaultValuesOptions {
  requiredStringFields?: string[];
  optionalFields?: string[];
}

export function createDefaultValues<T extends Record<string, unknown>>(options: DefaultValuesOptions = {}): Partial<T> {
  const { requiredStringFields = [], optionalFields = [] } = options;
  const defaultValues: Partial<T> = {};

  requiredStringFields.forEach((field) => {
    (defaultValues as Record<string, unknown>)[field] = '';
  });

  optionalFields.forEach((field) => {
    (defaultValues as Record<string, unknown>)[field] = undefined;
  });

  return defaultValues;
}

export function extractDirtyValues<T extends FieldValues>(
  formValues: T,
  dirtyFields: Record<string, unknown>,
): Partial<T> {
  if (!dirtyFields || typeof dirtyFields !== 'object') {
    return {} as Partial<T>;
  }

  const result: Record<string, unknown> = {};

  for (const key of Object.keys(dirtyFields)) {
    const dirtyField = dirtyFields[key];
    const fieldValue = formValues[key];

    if (dirtyField === true) {
      result[key] = fieldValue;
    } else if (dirtyField && typeof dirtyField === 'object' && dirtyField !== null) {
      const nestedResult = extractDirtyValues(fieldValue as T, dirtyField as Record<string, unknown>);

      if (hasNonEmptyValues(nestedResult)) {
        result[key] = nestedResult;
      }
    }
  }

  return result as Partial<T>;
}

export function extractAndTransformDirtyValues<TForm extends FieldValues, TApi>(
  formValues: TForm,
  dirtyFields: Record<string, unknown>,
  transformFn: (data: TForm) => TApi,
): Partial<TApi> {
  const dirtyFormValues = extractDirtyValues(formValues, dirtyFields);

  if (Object.keys(dirtyFormValues).length === 0) {
    return {} as Partial<TApi>;
  }

  const fullFormData = { ...formValues, ...dirtyFormValues };
  const transformedData = transformFn(fullFormData);

  const result: Record<string, unknown> = {};
  for (const key of Object.keys(dirtyFormValues)) {
    const transformedKey = findTransformedKey(key, transformedData as Record<string, unknown>);
    if (transformedKey && transformedData[transformedKey as keyof TApi] !== undefined) {
      result[transformedKey] = transformedData[transformedKey as keyof TApi];
    }
  }

  return result as Partial<TApi>;
}

function findTransformedKey(originalKey: string, _transformedData: Record<string, unknown>): string | null {
  const keyMappings: Record<string, string> = {
    country: 'country_id',
    state: 'state_id',
    city: 'city_id',
  };

  return keyMappings[originalKey] || originalKey;
}

function hasNonEmptyValues(obj: unknown): boolean {
  if (obj === null || obj === undefined) return false;

  if (Array.isArray(obj)) {
    return obj.length > 0;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).length > 0;
  }

  return true;
}
