import { describe, expect, it } from 'vitest';

import { countFilledCatalogNames, getCatalogLocalizedName, resolveCatalogNameForLocale } from './catalogLocalizedName';

describe('catalog localized names', () => {
  const values = {
    nameUz: 'Issiq choy',
    nameUzCrl: 'Иссиқ чой',
    nameRu: 'Горячий чай',
  };

  it('enables translation only when exactly one language is filled', () => {
    expect(countFilledCatalogNames({ nameUz: 'Choy', nameUzCrl: '', nameRu: '' })).toBe(1);
    expect(countFilledCatalogNames(values)).toBe(3);
  });

  it('maps form values to the backend translation contract', () => {
    expect(getCatalogLocalizedName(values)).toEqual({
      nameUz: 'Issiq choy',
      nameUzCrl: 'Иссиқ чой',
      nameRu: 'Горячий чай',
    });
  });

  it('selects the legacy name using the active interface locale', () => {
    expect(resolveCatalogNameForLocale(values, 'uz')).toBe('Issiq choy');
    expect(resolveCatalogNameForLocale(values, 'uz-Cyrl')).toBe('Иссиқ чой');
    expect(resolveCatalogNameForLocale(values, 'ru')).toBe('Горячий чай');
  });
});
