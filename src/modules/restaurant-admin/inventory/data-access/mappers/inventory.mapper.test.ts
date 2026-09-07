import { describe, expect, it } from 'vitest';

import { mapDocumentInput, mapInventoryFilters, mapRecipeInput } from './inventory.mapper';

describe('inventory transport boundary', () => {
  it('preserves zero filters and removes unset selections', () => {
    expect(mapInventoryFilters({ warehouse: '', offset: 0, limit: 26, from: undefined })).toEqual({
      offset: 0,
      limit: 26,
    });
  });
  it('preserves uncounted stocktake and decimal precision without conversion to float', () => {
    const mapped = mapDocumentInput({
      kind: 'stocktake',
      warehouse: 'w',
      supplier: '',
      reference: '',
      reason: '',
      occurredAt: '2026-09-06T00:00:00Z',
      responsibleName: '',
      attachmentUrl: '',
      notes: '',
      lines: [{ item: 'i', quantity: null, inputUnit: 'base', lotNumber: '', expiresOn: '' }],
    });
    expect(mapped.supplier).toBeNull();
    expect(mapped.lines[0].quantity).toBeNull();
    expect(mapped.lines[0].expiresOn).toBeNull();
  });
  it('strips immutable version fields when creating a recipe revision', () => {
    const mapped = mapRecipeInput({
      catalogItem: 'dish',
      name: '',
      trigger: 'sale',
      yieldQuantity: '2',
      lines: [{ id: 'old-line', item: 'egg', itemName: 'Egg', quantity: '0.000001', modifierOption: '' }],
    });
    expect(mapped.lines).toEqual([{ item: 'egg', quantity: '0.000001', modifierOption: null }]);
    expect(mapped.trigger).toBe('sale');
  });
});
