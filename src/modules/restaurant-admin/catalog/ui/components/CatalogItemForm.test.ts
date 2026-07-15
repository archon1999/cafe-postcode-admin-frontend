import { describe, expect, it } from 'vitest';

import { catalogItemFormSchema } from '../../data-access/catalogItemForm.schema';

const validFormValues = {
  name: 'Lavash',
  category: '',
  description: '',
  mxik: null,
  imageFile: null,
  imageSource: '' as const,
  clearImage: false,
  restoreMxikImage: false,
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
  });
});
