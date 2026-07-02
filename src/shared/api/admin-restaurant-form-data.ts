import type { AdminRestaurantPayload } from './admin-types';

function appendText(formData: FormData, key: string, value: string | number | boolean | null | undefined) {
  if (value === undefined || value === null) {
    return;
  }

  formData.append(key, String(value));
}

function appendJson(formData: FormData, key: string, value: Record<string, unknown> | undefined) {
  if (value === undefined) {
    return;
  }

  formData.append(key, JSON.stringify(value));
}

export function buildAdminRestaurantRequestPayload(payload: AdminRestaurantPayload): AdminRestaurantPayload | FormData {
  const imageFile = payload.posAuthBackgroundImage;
  const hasImageFile = imageFile instanceof File;
  const shouldClearImage = payload.clearPosAuthBackgroundImage === true;

  if (!hasImageFile && !shouldClearImage) {
    return payload;
  }

  const formData = new FormData();

  appendText(formData, 'name', payload.name);
  appendText(formData, 'legalName', payload.legalName);
  appendText(formData, 'taxNumber', payload.taxNumber);
  appendText(formData, 'phone', payload.phone);
  appendText(formData, 'social', payload.social);
  appendText(formData, 'address', payload.address);
  appendJson(formData, 'fakturaPayload', payload.fakturaPayload);
  appendText(formData, 'serviceFeeEnabled', payload.serviceFeeEnabled);
  appendText(formData, 'serviceFeePercent', payload.serviceFeePercent);
  appendText(formData, 'vatEnabled', payload.vatEnabled);
  appendText(formData, 'vatPercent', payload.vatPercent);
  appendText(formData, 'isActive', payload.isActive);

  if (payload.tariffId) {
    appendText(formData, 'tariffId', payload.tariffId);
  }

  if (hasImageFile) {
    formData.append('posAuthBackgroundImage', imageFile);
  }

  if (shouldClearImage) {
    formData.append('clearPosAuthBackgroundImage', 'true');
  }

  return formData;
}
