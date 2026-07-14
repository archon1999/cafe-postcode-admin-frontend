import type { AdminFeatureKitchenMode, AdminFeatureOrderEntryMode } from 'shared/api/admin-types';

export function getFeatureOrderEntryModeTranslationKey(mode: AdminFeatureOrderEntryMode) {
  return `orderEntryModes.${mode}` as const;
}

export function getFeatureKitchenModeTranslationKey(mode: AdminFeatureKitchenMode) {
  return `kitchenModes.${mode}` as const;
}
