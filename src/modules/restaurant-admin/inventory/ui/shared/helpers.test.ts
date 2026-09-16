import { describe, expect, it } from 'vitest';

import { inventoryInputValue } from './helpers';

describe('inventoryInputValue', () => {
  it('removes only insignificant trailing zeroes from editable decimal values', () => {
    expect(inventoryInputValue('1.000000')).toBe('1');
    expect(inventoryInputValue('1.250000')).toBe('1.25');
    expect(inventoryInputValue('0.000001')).toBe('0.000001');
  });
});
