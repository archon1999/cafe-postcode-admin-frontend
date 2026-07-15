import { z } from 'zod';

import type { AdminRestaurant, AdminRestaurantPayload } from 'shared/api/admin-types';

export const restaurantFormSchema = z.object({
  name: z.string().min(1),
  legalName: z.string(),
  taxNumber: z.string(),
  phone: z.string(),
  social: z.string(),
  address: z.string(),
  fakturaPayload: z.record(z.string(), z.unknown()).optional(),
  posAuthBackgroundImage: z.custom<File | string | null | undefined>().optional(),
  clearPosAuthBackgroundImage: z.boolean().optional(),
  serviceFeeEnabled: z.boolean(),
  serviceFeePercent: z.coerce.number().min(0).max(99),
  vatEnabled: z.boolean(),
  vatPercent: z.coerce.number().min(0).max(99),
  markingCheckEnabled: z.boolean(),
  isActive: z.boolean(),
});

export type RestaurantFormInput = z.input<typeof restaurantFormSchema>;
export type RestaurantFormValues = z.output<typeof restaurantFormSchema>;

export const restaurantFormDefaultValues: RestaurantFormInput = {
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
  isActive: false,
};

export function restaurantToFormValues(restaurant: AdminRestaurant): RestaurantFormValues {
  return {
    name: restaurant.name,
    legalName: restaurant.legalName,
    taxNumber: restaurant.taxNumber,
    phone: restaurant.phone,
    social: restaurant.social ?? '',
    address: restaurant.address,
    fakturaPayload: restaurant.fakturaPayload ?? {},
    posAuthBackgroundImage: restaurant.posAuthBackgroundImageUrl ?? null,
    clearPosAuthBackgroundImage: false,
    serviceFeeEnabled: restaurant.serviceFeeEnabled,
    serviceFeePercent: Number(restaurant.serviceFeePercent ?? 0),
    vatEnabled: restaurant.vatEnabled,
    vatPercent: Number(restaurant.vatPercent ?? 12),
    markingCheckEnabled: Boolean(restaurant.markingCheckEnabled),
    isActive: restaurant.isActive,
  };
}

export function restaurantFormValuesToPayload(
  values: RestaurantFormValues,
  { isEditMode }: { isEditMode: boolean },
): AdminRestaurantPayload {
  const payload: AdminRestaurantPayload = {
    name: values.name.trim(),
    legalName: values.legalName.trim(),
    taxNumber: values.taxNumber.trim(),
    phone: values.phone.trim(),
    social: values.social.trim(),
    address: values.address.trim(),
    fakturaPayload: values.fakturaPayload,
    serviceFeeEnabled: values.serviceFeeEnabled,
    serviceFeePercent: values.serviceFeePercent,
    vatEnabled: values.vatEnabled,
    vatPercent: values.vatPercent,
    markingCheckEnabled: values.markingCheckEnabled,
    isActive: isEditMode ? values.isActive : false,
  };
  if (values.posAuthBackgroundImage instanceof File) payload.posAuthBackgroundImage = values.posAuthBackgroundImage;
  else if (values.clearPosAuthBackgroundImage) payload.clearPosAuthBackgroundImage = true;
  return payload;
}
