import { ruRU as ruRUCore } from '@mui/material/locale';
import type { Components, Theme } from '@mui/material/styles';
import { ruRU as ruRUDataGrid } from '@mui/x-data-grid/locales';
import { ruRU as ruRUDate } from '@mui/x-date-pickers/locales';
import type { InitOptions } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

export const supportedLngs = ['uz', 'uz-Cyrl', 'ru'] as const;
export type LangCode = (typeof supportedLngs)[number];

export const fallbackLng: LangCode = 'uz';
export const defaultNS = 'common';

export const storageConfig = {
  cookie: { key: 'i18next', autoDetection: false },
  localStorage: { key: 'i18nextLng', autoDetection: false },
} as const;

export type LangOption = {
  value: LangCode;
  label: string;
  countryCode: string;
  adapterLocale?: string;
  numberFormat: { code: string; currency: string };
  systemValue?: { components: Components<Theme> };
};

export const allLangs: LangOption[] = [
  {
    value: 'uz',
    label: "O'zbekcha",
    countryCode: 'UZ',
    adapterLocale: 'uz-latn',
    numberFormat: { code: 'uz-UZ', currency: 'UZS' },
  },
  {
    value: 'uz-Cyrl',
    label: 'Ўзбекча',
    countryCode: 'UZ',
    adapterLocale: 'uz',
    numberFormat: { code: 'uz-Cyrl-UZ', currency: 'UZS' },
    systemValue: {
      components: { ...ruRUCore.components, ...ruRUDate.components, ...ruRUDataGrid.components },
    },
  },
  {
    value: 'ru',
    label: 'Русский',
    countryCode: 'RU',
    adapterLocale: 'ru',
    numberFormat: { code: 'ru-RU', currency: 'UZS' },
    systemValue: {
      components: { ...ruRUCore.components, ...ruRUDate.components, ...ruRUDataGrid.components },
    },
  },
];

export const i18nResourceLoader = resourcesToBackend(
  (lang: LangCode, namespace: string) => import(`./langs/${lang}/${namespace}.json`),
);

export function i18nOptions(lang = fallbackLng, namespace = defaultNS): InitOptions {
  return {
    supportedLngs,
    fallbackLng,
    lng: lang,
    fallbackNS: defaultNS,
    defaultNS,
    ns: namespace,
  };
}

export function getCurrentLang(lang?: string): LangOption {
  const fallbackLang = allLangs.find((item) => item.value === fallbackLng) ?? allLangs[0];

  if (!lang) {
    return fallbackLang;
  }

  return allLangs.find((item) => item.value === lang) ?? fallbackLang;
}
