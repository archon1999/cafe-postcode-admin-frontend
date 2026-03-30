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

function resolveNumber(inputValue: InputMoneyValue): number | null {
  if (inputValue === null || inputValue === undefined || inputValue === '') {
    return null;
  }

  if (typeof inputValue === 'number') {
    return Number.isFinite(inputValue) ? inputValue : null;
  }

  const normalizedValue = inputValue.replace(/[^\d]/g, '');

  if (!normalizedValue) {
    return null;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function getMoneySuffix() {
  return i18next.t('common:currency.som', { defaultValue: "so'm" });
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
