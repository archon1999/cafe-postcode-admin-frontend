/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest';

import { restaurantFormDefaultValues, restaurantFormSchema, restaurantFormValuesToPayload } from './restaurant-form';

describe('restaurant form contract', () => {
  it('keeps the established defaults', () => {
    expect(restaurantFormDefaultValues).toEqual({
      name: '',
      legalName: '',
      taxNumber: '',
      phone: '',
      social: '',
      address: '',
      fakturaPayload: {},
      posAuthBackgroundImage: null,
      clearPosAuthBackgroundImage: false,
      serviceFeeEnabled: false,
      serviceFeePercent: 0,
      vatEnabled: false,
      vatPercent: 12,
      markingCheckEnabled: false,
      posMonitorVariant: 'default',
      paymentTotalMode: 'fixed',
      isActive: false,
    });
  });

  it('coerces percentage inputs and preserves auxiliary values', () => {
    const image = new File(['image'], 'login.png', { type: 'image/png' });
    const fakturaPayload = { CompanyName: 'Restaurant LLC', CompanyInn: '123456789' };

    const result = restaurantFormSchema.parse({
      ...restaurantFormDefaultValues,
      name: 'Restaurant',
      fakturaPayload,
      posAuthBackgroundImage: image,
      clearPosAuthBackgroundImage: true,
      serviceFeePercent: '10',
      vatPercent: '15',
    });

    expect(result.serviceFeePercent).toBe(10);
    expect(result.vatPercent).toBe(15);
    expect(result.fakturaPayload).toEqual(fakturaPayload);
    expect(result.posAuthBackgroundImage).toBe(image);
    expect(result.clearPosAuthBackgroundImage).toBe(true);
  });

  it('trims text, forces new restaurants inactive and prefers an uploaded image over clear', () => {
    const image = new File(['image'], 'login.png', { type: 'image/png' });

    const result = restaurantFormValuesToPayload(
      {
        ...restaurantFormDefaultValues,
        name: '  Restaurant  ',
        legalName: '  Restaurant LLC  ',
        taxNumber: '  123456789  ',
        phone: '  +998900000000  ',
        social: '  @restaurant  ',
        address: '  Tashkent  ',
        fakturaPayload: { CompanyName: 'Restaurant LLC' },
        posAuthBackgroundImage: image,
        clearPosAuthBackgroundImage: true,
        serviceFeeEnabled: true,
        serviceFeePercent: 10,
        vatEnabled: true,
        vatPercent: 12,
        markingCheckEnabled: true,
        posMonitorVariant: 'light_compact',
        paymentTotalMode: 'cashier_editable',
        isActive: true,
      },
      { isEditMode: false },
    );

    expect(result).toEqual({
      name: 'Restaurant',
      legalName: 'Restaurant LLC',
      taxNumber: '123456789',
      phone: '+998900000000',
      social: '@restaurant',
      address: 'Tashkent',
      fakturaPayload: { CompanyName: 'Restaurant LLC' },
      posAuthBackgroundImage: image,
      serviceFeeEnabled: true,
      serviceFeePercent: 10,
      vatEnabled: true,
      vatPercent: 12,
      markingCheckEnabled: true,
      posMonitorVariant: 'light_compact',
      paymentTotalMode: 'cashier_editable',
      isActive: false,
    });
  });

  it('serializes an explicit background-image clear only when no file is uploaded', () => {
    const values = restaurantFormSchema.parse({
      ...restaurantFormDefaultValues,
      name: 'Restaurant',
      clearPosAuthBackgroundImage: true,
    });
    const result = restaurantFormValuesToPayload(values, { isEditMode: true });

    expect(result.clearPosAuthBackgroundImage).toBe(true);
    expect(result.posAuthBackgroundImage).toBeUndefined();
  });
});
