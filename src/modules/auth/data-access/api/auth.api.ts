import axios, { type AxiosError } from 'axios';

import type { AdminLoginRequest, AdminSessionUser } from 'shared/api/admin-types';
import { sessionService } from 'shared/lib/auth/session.service';

import type {
  AdminAuthErrorPayload,
  AdminCredentialResponse,
  AdminLoginResponse,
  MFAEnrollmentResponse,
  MFAProof,
} from '../../domain/entities/admin-auth.types';

const authHttp = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
});

export const loginRequest = async (params: AdminLoginRequest): Promise<AdminLoginResponse> => {
  const response = await authHttp.post<AdminLoginResponse>('/api/v1/admin/auth/login/', params);
  return response.data;
};

export const refreshRequest = async (): Promise<AdminCredentialResponse> => {
  const response = await authHttp.post<AdminCredentialResponse>('/api/v1/admin/auth/refresh/');
  return response.data;
};

export const logoutRequest = async (): Promise<void> => {
  await authHttp.post('/api/v1/admin/auth/logout/');
};

export const unlockRequest = async (password: string): Promise<AdminCredentialResponse> => {
  const response = await authHttp.post<AdminCredentialResponse>('/api/v1/admin/auth/unlock/', { password });
  return response.data;
};

export const lockRequest = async (accessToken: string): Promise<{ status: 'locked'; lockedAt: string }> => {
  const response = await authHttp.post<{ status: 'locked'; lockedAt: string }>(
    '/api/v1/admin/auth/lock/',
    {},
    { headers: { Authorization: `Token ${accessToken}` } },
  );
  return response.data;
};

export const startMFAEnrollmentRequest = async (challengeToken: string): Promise<MFAEnrollmentResponse> => {
  const response = await authHttp.post<MFAEnrollmentResponse>('/api/v1/admin/auth/mfa/enrollment/start/', {
    challengeToken,
  });
  return response.data;
};

export const confirmMFAEnrollmentRequest = async (
  challengeToken: string,
  code: string,
): Promise<AdminCredentialResponse> => {
  const response = await authHttp.post<AdminCredentialResponse>('/api/v1/admin/auth/mfa/enrollment/confirm/', {
    challengeToken,
    code,
  });
  return response.data;
};

export const completeMFAChallengeRequest = async (
  challengeToken: string,
  proof: MFAProof,
): Promise<AdminCredentialResponse> => {
  const response = await authHttp.post<AdminCredentialResponse>('/api/v1/admin/auth/mfa/challenge/', {
    challengeToken,
    ...proof,
  });
  return response.data;
};

export const stepUpMFARequest = async (accessToken: string, proof: MFAProof): Promise<void> => {
  await authHttp.post('/api/v1/admin/auth/mfa/step-up/', proof, {
    headers: { Authorization: `Token ${accessToken}` },
  });
};

export const getCurrentUserRequest = async (): Promise<AdminSessionUser> => {
  const accessToken = sessionService.getAccessToken();
  const response = await authHttp.get<AdminSessionUser>('/api/v1/admin/auth/me/', {
    headers: accessToken ? { Authorization: `Token ${accessToken}` } : undefined,
  });
  return response.data;
};

export function getAdminAuthErrorCode(error: unknown): string | undefined {
  return (error as AxiosError<AdminAuthErrorPayload>)?.response?.data?.code;
}

export function getAdminAuthErrorStatus(error: unknown): number | undefined {
  return (error as AxiosError<AdminAuthErrorPayload>)?.response?.status;
}
