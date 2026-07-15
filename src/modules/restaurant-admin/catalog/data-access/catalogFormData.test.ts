import { describe, expect, it } from 'vitest';

import { buildCatalogCategoryFormData, buildCatalogItemFormData } from './catalogFormData';

describe('catalogFormData', () => {
  it('builds category form data with scalar, boolean, json, and file values', () => {
    const imageFile = new File(['cover'], 'cover.png', { type: 'image/png' });
    const formData = buildCatalogCategoryFormData({
      name: 'Salatlar',
      mxikCode: '00709001906000000',
      mxikName: 'Salat barg',
      mxikPayload: { mxikCode: '00709001906000000', mxikName: 'Salat barg' },
      imageUrl: 'https://example.com/mxik.png',
      imageSource: 'manual',
      imageFile,
      prepStation: 'station-1',
      clearImage: false,
      restoreMxikImage: true,
      sortOrder: 4,
      isActive: true,
    });

    expect(formData.get('name')).toBe('Salatlar');
    expect(formData.get('mxikCode')).toBe('00709001906000000');
    expect(formData.get('mxikPayload')).toBe('{"mxikCode":"00709001906000000","mxikName":"Salat barg"}');
    expect(formData.get('imageUrl')).toBe('https://example.com/mxik.png');
    expect(formData.get('imageSource')).toBe('manual');
    expect(formData.get('prepStation')).toBe('station-1');
    expect(formData.get('restoreMxikImage')).toBe('true');
    expect(formData.get('sortOrder')).toBe('4');
    expect(formData.get('isActive')).toBe('true');
    expect(formData.get('imageFile')).toBe(imageFile);
  });

  it('builds item form data with nullable fields and flags', () => {
    const formData = buildCatalogItemFormData({
      name: 'Lavash',
      category: null,
      description: 'Issiq',
      mxikCode: '',
      mxikName: '',
      mxikPayload: {},
      imageUrl: null,
      imageSource: '',
      clearImage: true,
      restoreMxikImage: false,
      price: 32000,
      isActive: false,
      isStoplisted: true,
    });

    expect(Object.fromEntries(formData.entries())).toEqual({
      name: 'Lavash',
      mxikCode: '',
      mxikName: '',
      mxikPayload: '{}',
      imageUrl: '',
      imageSource: '',
      clearImage: 'true',
      restoreMxikImage: 'false',
      category: '',
      description: 'Issiq',
      price: '32000',
      isActive: 'false',
      isStoplisted: 'true',
    });
    expect(formData.get('prepStation')).toBeNull();
  });
});
