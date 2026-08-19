import type { AdminSessionUser } from 'shared/api/admin-types';

export type AdminAuthSession = {
  id: string;
  status: string;
  surface: string;
  expiresAt: string;
  createdAt: string;
  lockedAt: string | null;
  mfaVerifiedAt: string | null;
  refreshFamilyId: string | null;
};

export type AdminCredentialResponse = {
  status: 'authenticated';
  accessToken: string;
  accessExpiresAt: string;
  refreshExpiresAt: string;
  user: AdminSessionUser;
  session: AdminAuthSession;
  recoveryCodes?: string[];
};

export type AdminAuthChallengeResponse = {
  status: 'mfa_required' | 'mfa_enrollment_required';
  challengeToken: string;
  challengeExpiresAt: string;
};

export type AdminLoginResponse = AdminCredentialResponse | AdminAuthChallengeResponse;

export type MFAEnrollmentResponse = {
  secret: string;
  otpauthUri: string;
  expiresAt: string;
};

export type MFAProof = { code: string; recoveryCode?: never } | { recoveryCode: string; code?: never };

export type AdminAuthErrorPayload = {
  code?: string;
  detail?: string;
};
