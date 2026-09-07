import { describe, expect, it } from 'vitest';

import type { DocumentInput, RecipeInput } from '../entities';

import { isDecimal, validateDocument, validateRecipe } from './validation';

const receipt = (): DocumentInput => ({
  kind: 'receipt',
  warehouse: 'warehouse-a',
  supplier: 'supplier-a',
  reference: 'INV-23',
  responsibleName: 'Manager',
  reason: '',
  notes: '',
  attachmentUrl: '',
  occurredAt: '2026-09-06T10:00:00Z',
  lines: [{ item: 'potato', quantity: '2.5', unitCost: '8000', inputUnit: 'purchase', lotNumber: '', expiresOn: null }],
});
const recipe = (): RecipeInput => ({
  catalogItem: 'dish',
  name: '',
  yieldQuantity: '1',
  trigger: 'dispatch',
  lines: [{ item: 'egg', quantity: '1', modifierOption: null }],
});

describe('inventory document input safeguards', () => {
  it('allows a partial uncounted draft but never permits its approval', () => {
    const input = receipt();
    input.kind = 'stocktake';
    input.reason = 'Weekly count';
    input.lines[0].quantity = null;
    expect(validateDocument(input)).toBeNull();
    expect(validateDocument(input, true)).toBe('validation.quantity');
    input.lines[0].quantity = '0';
    expect(validateDocument(input, true)).toBeNull();
  });
  it('requires supplier and accountability metadata when posting, while allowing a draft', () => {
    const input = receipt();
    input.supplier = null;
    input.reference = '';
    expect(validateDocument(input)).toBeNull();
    expect(validateDocument(input, true)).toBe('validation.referenceResponsible');
    input.reference = 'INV-23';
    expect(validateDocument(input, true)).toBe('validation.supplier');
  });
  it('requires a reason for physical returns and write-offs', () => {
    for (const kind of ['issue', 'supplier_return', 'customer_return', 'stocktake'] as const) {
      const input = receipt();
      input.kind = kind;
      expect(validateDocument(input, true)).toBe('validation.reason');
    }
  });
  it('rejects duplicate products and invalid quantity formats before sending', () => {
    const input = receipt();
    input.lines.push({ ...input.lines[0] });
    expect(validateDocument(input)).toBe('validation.duplicateItem');
    for (const value of ['-1', '0', '1e309', 'NaN', '', '2.1234567']) expect(isDecimal(value)).toBe(false);
    expect(isDecimal('0', true)).toBe(true);
    expect(isDecimal('0.000001')).toBe(true);
  });
  it('allows only private inventory attachment paths or https URLs', () => {
    const input = receipt();
    input.attachmentUrl = 'javascript:alert(1)';
    expect(validateDocument(input)).toBe('validation.attachment');
    input.attachmentUrl = '/api/v1/admin/inventory/attachments/123/download/';
    expect(validateDocument(input)).toBeNull();
  });
});

describe('recipe input safeguards', () => {
  it('allows conditional extra consumption of the same ingredient but rejects duplicate conditions', () => {
    const input = recipe();
    input.lines.push({ item: 'egg', quantity: '1', modifierOption: 'extra-egg' });
    expect(validateRecipe(input)).toBeNull();
    input.lines.push({ ...input.lines[1] });
    expect(validateRecipe(input)).toBe('validation.duplicateRecipe');
  });
  it('rejects zero output and ingredient quantities', () => {
    const input = recipe();
    input.yieldQuantity = '0';
    expect(validateRecipe(input)).toBe('validation.quantity');
    input.yieldQuantity = '1';
    input.lines[0].quantity = '0';
    expect(validateRecipe(input)).toBe('validation.quantity');
  });
});
