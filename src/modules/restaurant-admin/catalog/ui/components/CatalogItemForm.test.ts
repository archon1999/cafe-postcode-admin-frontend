import { describe, expect, it } from 'vitest';

import { catalogItemFormSchema } from '../../data-access/catalogItemForm.schema';

const validFormValues = {
  nameUz: 'Lavash',
  nameUzCrl: '',
  nameRu: '',
  category: '',
  description: '',
  mxik: null,
  imageFile: null,
  imageSource: '' as const,
  clearImage: false,
  restoreMxikImage: false,
  itemType: 'product' as const,
  isActive: true,
  isStoplisted: false,
};

describe('CatalogItemForm price coercion', () => {
  it.each([
    { input: '32000', expected: 32000 },
    { input: 32000, expected: 32000 },
    { input: '', expected: 0 },
  ])('parses $input as $expected', ({ input, expected }) => {
    const result = catalogItemFormSchema.parse({ ...validFormValues, price: input });

    expect(result.price).toBe(expected);
    expect(result.saleUnit).toBe('piece');
  });

  it('keeps kilogram as an explicit sale unit', () => {
    const result = catalogItemFormSchema.parse({ ...validFormValues, price: 100000, saleUnit: 'kg' });

    expect(result.saleUnit).toBe('kg');
  });

  it('defaults the item type to product', () => {
    const result = catalogItemFormSchema.parse({ ...validFormValues, itemType: undefined, price: 1000 });

    expect(result.itemType).toBe('product');
  });
});
