import type { AdminRestaurantBranchCreatePayload, AdminRestaurantPayload } from './admin-types';

type RestaurantSelfServicePayload = Pick<
  AdminRestaurantPayload,
  | 'name'
  | 'phone'
  | 'social'
  | 'address'
  | 'serviceFeeEnabled'
  | 'serviceFeePercent'
  | 'vatEnabled'
  | 'vatPercent'
  | 'markingCheckEnabled'
  | 'posMonitorVariant'
  | 'paymentTotalMode'
>;

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
  appendText(formData, 'markingCheckEnabled', payload.markingCheckEnabled);
  appendText(formData, 'posMonitorVariant', payload.posMonitorVariant);
  appendText(formData, 'paymentTotalMode', payload.paymentTotalMode);
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

export function buildAdminRestaurantBranchRequestPayload(
  payload: AdminRestaurantBranchCreatePayload,
): AdminRestaurantBranchCreatePayload | FormData {
  const requestPayload = buildAdminRestaurantRequestPayload(payload);
  if (requestPayload instanceof FormData) {
    appendText(requestPayload, 'copyCatalog', payload.copyCatalog);
    appendText(requestPayload, 'copySettings', payload.copySettings);
    return requestPayload;
  }
  return payload;
}

export function buildRestaurantSelfServiceRequestPayload(
  payload: AdminRestaurantPayload,
): RestaurantSelfServicePayload | FormData {
  const safePayload: RestaurantSelfServicePayload = {
    name: payload.name,
    phone: payload.phone,
    social: payload.social,
    address: payload.address,
    serviceFeeEnabled: payload.serviceFeeEnabled,
    serviceFeePercent: payload.serviceFeePercent,
    vatEnabled: payload.vatEnabled,
    vatPercent: payload.vatPercent,
    markingCheckEnabled: payload.markingCheckEnabled,
    posMonitorVariant: payload.posMonitorVariant,
    ...(payload.paymentTotalMode ? { paymentTotalMode: payload.paymentTotalMode } : {}),
  };
  const imageFile = payload.posAuthBackgroundImage;
  const hasImageFile = imageFile instanceof File;
  const shouldClearImage = payload.clearPosAuthBackgroundImage === true;

  if (!hasImageFile && !shouldClearImage) {
    return safePayload;
  }

  const formData = new FormData();
  Object.entries(safePayload).forEach(([key, value]) => appendText(formData, key, value));
  if (hasImageFile) {
    formData.append('posAuthBackgroundImage', imageFile);
  }
  if (shouldClearImage) {
    formData.append('clearPosAuthBackgroundImage', 'true');
  }
  return formData;
}
