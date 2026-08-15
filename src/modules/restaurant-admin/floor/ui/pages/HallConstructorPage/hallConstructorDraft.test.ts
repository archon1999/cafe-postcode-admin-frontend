import { describe, expect, it } from 'vitest';

import { normalizeServiceFeePercent } from './hallConstructorDraft';

describe('normalizeServiceFeePercent', () => {
  it.each([
    [10, 10],
    ['3.5', 4],
    ['2.49', 2],
    [-1, 0],
    [100, 99],
    ['', 0],
  ])('normalizes %p to the whole percentage %p', (value, expected) => {
    expect(normalizeServiceFeePercent(value)).toBe(expected);
  });
});
