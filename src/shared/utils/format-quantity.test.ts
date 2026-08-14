import { describe, expect, it, vi } from 'vitest';

vi.mock('i18next', () => ({
  default: {
    resolvedLanguage: 'uz',
    t: (key: string) =>
      ({
        'common:quantityUnits.piece': 'ta',
        'common:quantityUnits.kilogram': 'kg',
      })[key] ?? key,
  },
}));

vi.mock('app/providers/locales/locales-config', () => ({
  fallbackLng: 'uz',
  getCurrentLang: () => ({
    numberFormat: { code: 'uz-UZ', currency: 'UZS' },
  }),
}));

import { formatQuantityNumber, formatSaleQuantity } from './format-quantity';

describe('format-quantity', () => {
  it('normalizes backend decimal strings for piece products', () => {
    expect(formatSaleQuantity('1.000', 'piece')).toBe('1 ta');
    expect(formatSaleQuantity('3.000')).toBe('3 ta');
  });

  it('keeps up to three meaningful decimals for kilogram products', () => {
    expect(formatSaleQuantity('1.400', 'kg')).toBe('1,4 kg');
    expect(formatSaleQuantity('0.125', 'kg')).toBe('0,125 kg');
    expect(formatQuantityNumber('2.000', 'kg')).toBe('2');
  });
});
