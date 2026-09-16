import { describe, expect, it } from 'vitest';

import { getNextTableNumber } from './hall-constructor';

describe('getNextTableNumber', () => {
  it('continues numeric labels while accepting custom and leading-zero labels', () => {
    expect(getNextTableNumber([])).toBe('1');
    expect(getNextTableNumber(['A1', 'VIP-2', '002', '10'].map((tableNumber) => ({ tableNumber })))).toBe('11');
    expect(getNextTableNumber([{ tableNumber: 'Banket' }])).toBe('1');
  });
});
