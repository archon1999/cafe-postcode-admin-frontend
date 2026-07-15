/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';

import {
  buildAdminRestaurantRequestPayload,
  buildRestaurantSelfServiceRequestPayload,
} from './admin-restaurant-form-data';

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
    expect(Array.from((result as FormData).entries())).toEqual([
      ['name', 'Restaurant'],
      ['legalName', 'Restaurant LLC'],
      ['taxNumber', '123456789'],
      ['phone', '+998900000000'],
      ['social', 'Instagram: cafe'],
      ['address', 'Tashkent'],
      ['fakturaPayload', JSON.stringify(basePayload.fakturaPayload)],
      ['serviceFeeEnabled', 'true'],
      ['serviceFeePercent', '10'],
      ['vatEnabled', 'true'],
      ['vatPercent', '12'],
      ['markingCheckEnabled', 'true'],
      ['isActive', 'true'],
      ['posAuthBackgroundImage', image],
    ]);
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

describe('buildRestaurantSelfServiceRequestPayload', () => {
  it('omits platform-owned restaurant fields', () => {
    const result = buildRestaurantSelfServiceRequestPayload({
      name: 'Cafe',
      legalName: 'Legal Cafe',
      taxNumber: '123456789',
      phone: '+998901234567',
      social: '@cafe',
      address: 'Tashkent',
      fakturaPayload: { CompanyName: 'Legal Cafe' },
      serviceFeeEnabled: true,
      serviceFeePercent: 10,
      vatEnabled: true,
      vatPercent: 12,
      markingCheckEnabled: false,
      isActive: true,
      tariffId: 'forbidden-tariff',
    });

    expect(result).toEqual({
      name: 'Cafe',
      phone: '+998901234567',
      social: '@cafe',
      address: 'Tashkent',
      serviceFeeEnabled: true,
      serviceFeePercent: 10,
      vatEnabled: true,
      vatPercent: 12,
      markingCheckEnabled: false,
    });
  });

  it('keeps only self-service fields in multipart uploads', () => {
    const image = new File(['image'], 'login.png', { type: 'image/png' });
    const result = buildRestaurantSelfServiceRequestPayload({
      name: 'Cafe',
      legalName: 'Legal Cafe',
      taxNumber: '123456789',
      phone: '+998901234567',
      social: '@cafe',
      address: 'Tashkent',
      fakturaPayload: { CompanyName: 'Legal Cafe' },
      posAuthBackgroundImage: image,
      serviceFeeEnabled: true,
      serviceFeePercent: 10,
      vatEnabled: true,
      vatPercent: 12,
      markingCheckEnabled: false,
      isActive: true,
      tariffId: 'forbidden-tariff',
    });

    expect(result).toBeInstanceOf(FormData);
    expect(Array.from((result as FormData).entries())).toEqual([
      ['name', 'Cafe'],
      ['phone', '+998901234567'],
      ['social', '@cafe'],
      ['address', 'Tashkent'],
      ['serviceFeeEnabled', 'true'],
      ['serviceFeePercent', '10'],
      ['vatEnabled', 'true'],
      ['vatPercent', '12'],
      ['markingCheckEnabled', 'false'],
      ['posAuthBackgroundImage', image],
    ]);
  });
});
