import type { CatalogCategoryPayload, CatalogItemPayload } from 'shared/api/admin-types';

type CatalogMutationPayload = CatalogCategoryPayload | CatalogItemPayload;

function appendBoolean(formData: FormData, key: string, value: boolean | undefined) {
  if (value === undefined) {
    return;
  }

  formData.append(key, value ? 'true' : 'false');
}

function appendNumber(formData: FormData, key: string, value: number | undefined) {
  if (value === undefined) {
    return;
  }

  formData.append(key, String(value));
}

function appendText(formData: FormData, key: string, value: string | null | undefined) {
  if (value === undefined) {
    return;
  }

  formData.append(key, value ?? '');
}

function buildCatalogFormData(payload: CatalogMutationPayload): FormData {
  const formData = new FormData();

  appendText(formData, 'name', payload.name);
  appendText(formData, 'nameUz', payload.nameUz);
  appendText(formData, 'nameUzCrl', payload.nameUzCrl);
  appendText(formData, 'nameRu', payload.nameRu);
  appendText(formData, 'mxikCode', payload.mxikCode ?? '');
  appendText(formData, 'mxikName', payload.mxikName ?? '');
  formData.append('mxikPayload', JSON.stringify(payload.mxikPayload ?? {}));
  appendText(formData, 'imageUrl', payload.imageUrl);
  appendText(formData, 'imageSource', payload.imageSource);
  appendBoolean(formData, 'clearImage', payload.clearImage);
  appendBoolean(formData, 'restoreMxikImage', payload.restoreMxikImage);

  if (payload.imageFile instanceof File) {
    formData.append('imageFile', payload.imageFile);
  }

  if ('sortOrder' in payload) {
    appendNumber(formData, 'sortOrder', payload.sortOrder);
  }

  if ('category' in payload) {
    appendText(formData, 'category', payload.category);
  }

  if ('barcode' in payload) {
    appendText(formData, 'barcode', payload.barcode);
  }

  if ('prepStation' in payload) {
    appendText(formData, 'prepStation', payload.prepStation);
  }

  if ('description' in payload) {
    appendText(formData, 'description', payload.description);
  }

  if ('itemType' in payload) {
    appendText(formData, 'itemType', payload.itemType);
  }

  if ('price' in payload) {
    appendNumber(formData, 'price', payload.price);
  }

  if ('saleUnit' in payload) {
    appendText(formData, 'saleUnit', payload.saleUnit);
  }

  if ('modifierGroups' in payload) {
    for (const groupId of payload.modifierGroups ?? []) {
      appendText(formData, 'modifierGroups', groupId);
    }
    appendBoolean(formData, 'clearModifierGroups', (payload.modifierGroups ?? []).length === 0);
  }

  appendBoolean(formData, 'isActive', payload.isActive);

  if ('isStoplisted' in payload) {
    appendBoolean(formData, 'isStoplisted', payload.isStoplisted);
  }

  return formData;
}

export function buildCatalogCategoryFormData(payload: CatalogCategoryPayload) {
  return buildCatalogFormData(payload);
}

export function buildCatalogItemFormData(payload: CatalogItemPayload) {
  return buildCatalogFormData(payload);
}
