import type { TFunction } from 'i18next';

/**
 * Event types emitted by the backend and Local Agent audit pipeline.
 *
 * The API accepts an exact event_type filter but does not expose a separate
 * dictionary endpoint, so the UI keeps the public audit vocabulary here. An
 * unknown type is still rendered verbatim by getSecurityEventLabel.
 */
export const SECURITY_EVENT_TYPES = [
  'ADMIN_AUTH_ORIGIN_REJECTED',
  'ADMIN_LOGIN_FAILED',
  'ADMIN_LOGIN_LOCKED_OUT',
  'ADMIN_LOGIN_SUCCEEDED',
  'ADMIN_LOGOUT',
  'ADMIN_MFA_CHALLENGE_FAILED',
  'ADMIN_MFA_CHALLENGE_ISSUED',
  'ADMIN_MFA_CHALLENGE_SUCCEEDED',
  'ADMIN_MFA_ENROLLED',
  'ADMIN_MFA_ENROLLMENT_FAILED',
  'ADMIN_MFA_LOCKED_OUT',
  'ADMIN_MFA_RECOVERY_CODE_USED',
  'ADMIN_MFA_STEP_UP_FAILED',
  'ADMIN_MFA_STEP_UP_LOCKED_OUT',
  'ADMIN_MFA_STEP_UP_SUCCEEDED',
  'ADMIN_REFRESH_REUSE_DETECTED',
  'ADMIN_SESSION_LOCKED',
  'ADMIN_SESSION_UNLOCKED',
  'ADMIN_UNLOCK_FAILED',
  'ADMIN_UNLOCK_LOCKED_OUT',
  'CONTROL_PAIRING_ATTEMPTS_EXCEEDED',
  'CONTROL_PAIRING_VERIFICATION_FAILED',
  'DEVICE_LEASE_RECOVERED',
  'DEVICE_LEASE_RENEWED',
  'DEVICE_PAIRING_APPROVED',
  'DEVICE_PAIRING_REJECTED',
  'DEVICE_PAIRING_REPLAY_DETECTED',
  'DEVICE_PAIRING_REQUESTED',
  'DEVICE_PROOF_FAILED',
  'DEVICE_PROOF_REPLAY_DETECTED',
  'DEVICE_REVOKED',
  'LEGACY_LOCAL_AGENT_MIGRATED',
  'LEGACY_POS_DEVICE_MIGRATED',
  'LEGACY_POS_SESSION_REJECTED',
  'LEGACY_POS_TERMINAL_BIND_FAILED',
  'LEGACY_POS_TERMINAL_CONFLICT',
  'LEGACY_TV_DEVICE_MIGRATED',
  'LOCAL_AGENT_AUTH_DENIED',
  'LOCAL_AGENT_TARGET_DENIED',
  'LOCAL_AUTH_THROTTLED',
  'LOCAL_DEVICE_PROOF_DENIED',
  'LOCAL_LEGACY_POS_BRIDGE_DENIED',
  'LOCAL_NETWORK_DENIED',
  'LOCAL_ORIGIN_DENIED',
  'LOCAL_PIN_FAILED',
  'LOCAL_RBAC_DENIED',
  'LOCAL_SCOPE_DENIED',
  'LOCAL_SECURE_CHANNEL_DENIED',
  'LOCAL_SESSION_DENIED',
  'PAIRING_REPLAY_DETECTED',
  'PIN_FAILED',
  'POS_LOGIN_SUCCEEDED',
  'POS_SESSION_LOCKED',
  'POS_SESSION_UNLOCKED',
  'TELEGRAM_LINK_TOKEN_ISSUED',
  'TELEGRAM_LINK_TOKEN_REJECTED',
  'TELEGRAM_SUBSCRIPTION_LINKED',
  'TELEGRAM_SUBSCRIPTION_REVOKED',
  'TENANT_PLATFORM_SCOPE_DENIED',
  'TENANT_SYSTEM_SCOPE_DENIED',
] as const;

export function getSecurityEventLabel(t: TFunction, eventType: string) {
  const normalizedType = eventType.trim().toLocaleLowerCase();

  if (!normalizedType) return eventType;

  return t(`eventTypes.${normalizedType}`, { defaultValue: eventType });
}

export function getSecurityEventResultLabel(t: TFunction, result: string) {
  const normalizedResult = result.trim().toLocaleLowerCase();

  if (!normalizedResult) return result;

  return t(`eventResults.${normalizedResult}`, { defaultValue: result });
}
