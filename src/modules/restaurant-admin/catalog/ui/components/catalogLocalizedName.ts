import type { CatalogNameTranslationPayload } from 'shared/api/admin-types';

export type CatalogLocalizedNameFormValues = CatalogNameTranslationPayload;

export function getCatalogLocalizedName(
  values: Partial<CatalogLocalizedNameFormValues>,
): CatalogNameTranslationPayload {
  return {
    nameUz: values.nameUz?.trim() ?? '',
    nameUzCrl: values.nameUzCrl?.trim() ?? '',
    nameRu: values.nameRu?.trim() ?? '',
  };
}

export function countFilledCatalogNames(values: Partial<CatalogLocalizedNameFormValues>) {
  return Object.values(getCatalogLocalizedName(values)).filter(Boolean).length;
}

export function resolveCatalogNameForLocale(values: CatalogNameTranslationPayload, locale: string) {
  if (locale === 'ru') {
    return values.nameRu || values.nameUz || values.nameUzCrl;
  }
  if (locale === 'uz-Cyrl') {
    return values.nameUzCrl || values.nameUz || values.nameRu;
  }
  return values.nameUz || values.nameUzCrl || values.nameRu;
}
