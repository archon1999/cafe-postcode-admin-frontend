/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';

import { buildAdminRestaurantRequestPayload } from './admin-restaurant-form-data';

describe('buildAdminRestaurantRequestPayload', () => {
  const basePayload = {
    name: 'Restaurant',
    legalName: 'Restaurant LLC',
    taxNumber: '123456789',
    phone: '+998900000000',
    social: 'Instagram: cafe',
    address: 'Tashkent',
    fakturaPayload: { CompanyName: 'Restaurant' },
    serviceFeeEnabled: true,
    serviceFeePercent: 10,
    vatEnabled: true,
    vatPercent: 12,
    markingCheckEnabled: true,
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
    expect((result as FormData).get('social')).toBe('Instagram: cafe');
    expect((result as FormData).get('fakturaPayload')).toBe(JSON.stringify(basePayload.fakturaPayload));
    expect((result as FormData).get('serviceFeeEnabled')).toBe('true');
    expect((result as FormData).get('serviceFeePercent')).toBe('10');
    expect((result as FormData).get('markingCheckEnabled')).toBe('true');
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
