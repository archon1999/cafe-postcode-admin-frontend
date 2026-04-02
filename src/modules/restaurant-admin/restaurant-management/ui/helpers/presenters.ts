import type {
  AdminDeviceMode,
  AdminDistributionPointKind,
  AdminFeatureKitchenMode,
  AdminFeatureOrderEntryMode,
} from 'shared/api/admin-types';

export function getDeviceModeTranslationKey(mode: AdminDeviceMode) {
  return `deviceModes.${mode}` as const;
}

export function getDistributionPointKindTranslationKey(kind: AdminDistributionPointKind) {
  return `distributionPointKinds.${kind}` as const;
}

export function getFeatureOrderEntryModeTranslationKey(mode: AdminFeatureOrderEntryMode) {
  return `orderEntryModes.${mode}` as const;
}

export function getFeatureKitchenModeTranslationKey(mode: AdminFeatureKitchenMode) {
  return `kitchenModes.${mode}` as const;
}
