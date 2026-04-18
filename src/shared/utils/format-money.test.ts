import { describe, expect, it, vi } from 'vitest';

vi.mock('i18next', () => ({
  default: {
    resolvedLanguage: 'uz',
    t: (key: string) => {
      if (key === 'common:currency.som') {
        return "so'm";
      }

      return key;
    },
  },
}));

vi.mock('app/providers/locales/locales-config', () => ({
  fallbackLng: 'uz',
  getCurrentLang: () => ({
    numberFormat: { code: 'uz-UZ', currency: 'UZS' },
  }),
}));

import { formatMoney, formatMoneyNumber, parseMoneyInput } from './format-money';

describe('format-money', () => {
  it('formats backend decimal strings without inflating them by 1000', () => {
    expect(formatMoneyNumber('12000.000')).toBe('12 000');
    expect(formatMoney('45000.000')).toBe("45 000 so'm");
  });

  it('keeps grouped strings readable across common separator styles', () => {
    expect(formatMoneyNumber('20 000')).toBe('20 000');
    expect(formatMoneyNumber('20.000')).toBe('20 000');
    expect(formatMoneyNumber('20,000')).toBe('20 000');
    expect(formatMoneyNumber('20,000.000')).toBe('20 000');
    expect(formatMoneyNumber('20.000,000')).toBe('20 000');
  });

  it('still parses form input as integer sums', () => {
    expect(parseMoneyInput('12 345')).toBe(12345);
    expect(parseMoneyInput("12 345 so'm")).toBe(12345);
    expect(parseMoneyInput('')).toBe('');
  });
});
