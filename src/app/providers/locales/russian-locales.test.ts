import { describe, expect, it } from 'vitest';

const russianLocales = import.meta.glob('./langs/ru/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

const mojibakeFragments = [
  'Рђ',
  'Р‘',
  'Р’',
  'Р“',
  'Р”',
  'Р•',
  'РЃ',
  'Р–',
  'Р—',
  'Р™',
  'Рљ',
  'Р›',
  'Рњ',
  'Рќ',
  'Рћ',
  'Рџ',
  'РЎ',
  'Рў',
  'РЈ',
  'Р¤',
  'РҐ',
  'Р¦',
  'Р§',
  'РЁ',
  'Р©',
  'РЄ',
  'Р«',
  'Р¬',
  'Р­',
  'Р®',
  'РЇ',
  'Р°',
  'Р±',
  'РІ',
  'Рі',
  'Рґ',
  'Рµ',
  'С‘',
  'Р¶',
  'Р·',
  'Рё',
  'Р№',
  'Рє',
  'Р»',
  'Рј',
  'РЅ',
  'Рѕ',
  'Рї',
  'СЂ',
  'СЃ',
  'С‚',
  'Сѓ',
  'С„',
  'С…',
  'С†',
  'С‡',
  'С€',
  'С‰',
  'СЉ',
  'С‹',
  'СЊ',
  'СЌ',
  'СЋ',
  'СЏ',
];

function collectStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];

  return Object.values(value).flatMap(collectStrings);
}

describe('Russian translations', () => {
  it('does not contain broken UTF-8 or placeholder text', () => {
    const strings = Object.values(russianLocales).flatMap(collectStrings);
    const brokenStrings = strings.filter(
      (value) =>
        /\?{3,}/.test(value) ||
        /[\u0080-\u009f\ufffd]/.test(value) ||
        mojibakeFragments.some((fragment) => value.includes(fragment)),
    );

    expect(brokenStrings).toEqual([]);
  });
});
