import i18next from 'i18next';

import { fallbackLng, getCurrentLang } from 'app/providers/locales/locales-config';

type InputMoneyValue = string | number | null | undefined;

type FormatMoneyOptions = {
  fallback?: string;
  withSuffix?: boolean;
};

function normalizeFormattedNumber(value: string) {
  return value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveLocale() {
  const currentLang = getCurrentLang(i18next.resolvedLanguage ?? fallbackLng);

  return currentLang.numberFormat;
}

function normalizeNumericString(value: string) {
  return value
    .replace(/\u00a0/g, ' ')
    .trim()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/[^\d,.\-+]/g, '');
}

function parseSingleSeparatorNumber(value: string, separator: '.' | ',') {
  const parts = value.split(separator);

  if (parts.length === 1) {
    return Number(value);
  }

  if (parts.length === 2) {
    const [leftPart, rightPart] = parts;

    if (!rightPart) {
      return Number(leftPart);
    }

    if (rightPart.length === 3 && leftPart.length <= 3) {
      return Number(`${leftPart}${rightPart}`);
    }

    return Number(`${leftPart || '0'}.${rightPart}`);
  }

  const isGroupedThousands = parts.every((part, index) => {
    if (index === 0) {
      return part.length >= 1 && part.length <= 3;
    }

    return part.length === 3;
  });

  if (isGroupedThousands) {
    return Number(parts.join(''));
  }

  const decimalPart = parts.pop();

  if (!decimalPart) {
    return Number(parts.join(''));
  }

  return Number(`${parts.join('')}.${decimalPart}`);
}

function parseNumericString(value: string): number | null {
  const normalizedValue = normalizeNumericString(value);

  if (!normalizedValue) {
    return null;
  }

  const sign = normalizedValue.startsWith('-') ? -1 : 1;
  const unsignedValue = normalizedValue.replace(/^[+-]/, '');

  if (!unsignedValue || !/^\d[\d.,]*$/.test(unsignedValue)) {
    return null;
  }

  if (!/[.,]/.test(unsignedValue)) {
    const parsedValue = Number(unsignedValue);
    return Number.isFinite(parsedValue) ? sign * parsedValue : null;
  }

  const hasDot = unsignedValue.includes('.');
  const hasComma = unsignedValue.includes(',');

  if (hasDot && hasComma) {
    const decimalSeparator = unsignedValue.lastIndexOf('.') > unsignedValue.lastIndexOf(',') ? '.' : ',';
    const groupSeparator = decimalSeparator === '.' ? ',' : '.';
    const normalizedNumber = unsignedValue.split(groupSeparator).join('').replace(decimalSeparator, '.');
    const parsedValue = Number(normalizedNumber);

    return Number.isFinite(parsedValue) ? sign * parsedValue : null;
  }

  const parsedValue = parseSingleSeparatorNumber(unsignedValue, hasDot ? '.' : ',');

  return Number.isFinite(parsedValue) ? sign * parsedValue : null;
}

function resolveNumber(inputValue: InputMoneyValue): number | null {
  if (inputValue === null || inputValue === undefined || inputValue === '') {
    return null;
  }

  if (typeof inputValue === 'number') {
    return Number.isFinite(inputValue) ? inputValue : null;
  }

  return parseNumericString(inputValue);
}

export function getMoneySuffix() {
  return i18next.t('common:currency.som');
}

export function formatMoneyNumber(inputValue: InputMoneyValue, options: Pick<FormatMoneyOptions, 'fallback'> = {}) {
  const { fallback = '-' } = options;
  const number = resolveNumber(inputValue);

  if (number === null) {
    return fallback;
  }

  const locale = resolveLocale();

  return normalizeFormattedNumber(
    new Intl.NumberFormat(locale.code, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number),
  );
}

export function formatMoney(inputValue: InputMoneyValue, options: FormatMoneyOptions = {}) {
  const { fallback = '-', withSuffix = true } = options;
  const formattedNumber = formatMoneyNumber(inputValue, { fallback });

  if (formattedNumber === fallback) {
    return fallback;
  }

  return withSuffix ? `${formattedNumber} ${getMoneySuffix()}` : formattedNumber;
}

export function sanitizeMoneyInput(value: string) {
  return value.replace(/[^\d]/g, '');
}

export function parseMoneyInput(value: string): number | '' {
  const normalizedValue = sanitizeMoneyInput(value);

  if (!normalizedValue) {
    return '';
  }

  return Number(normalizedValue);
}
