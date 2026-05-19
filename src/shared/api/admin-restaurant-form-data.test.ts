/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';

import { buildAdminRestaurantRequestPayload } from './admin-restaurant-form-data';

describe('buildAdminRestaurantRequestPayload', () => {
  const basePayload = {
    name: 'Restaurant',
    legalName: 'Restaurant LLC',
    taxNumber: '123456789',
    phone: '+998900000000',
    address: 'Tashkent',
    fakturaPayload: { CompanyName: 'Restaurant' },
    vatEnabled: true,
    vatPercent: 12,
    isActive: true,
  };

  it('keeps json payload when no image action is present', () => {
    expect(buildAdminRestaurantRequestPayload(basePayload)).toBe(basePayload);
  });

  it('builds multipart payload for background image upload', () => {
    const image = new File(['image'], 'login.png', { type: 'image/png' });
    const result = buildAdminRestaurantRequestPayload({
      ...basePayload,
      posAuthBackgroundImage: image,
    });

    expect(result).toBeInstanceOf(FormData);
    expect((result as FormData).get('name')).toBe('Restaurant');
    expect((result as FormData).get('fakturaPayload')).toBe(JSON.stringify(basePayload.fakturaPayload));
    expect((result as FormData).get('posAuthBackgroundImage')).toBe(image);
  });

  it('builds multipart payload for background image removal', () => {
    const result = buildAdminRestaurantRequestPayload({
      ...basePayload,
      clearPosAuthBackgroundImage: true,
    });

    expect(result).toBeInstanceOf(FormData);
    expect((result as FormData).get('clearPosAuthBackgroundImage')).toBe('true');
  });
});
