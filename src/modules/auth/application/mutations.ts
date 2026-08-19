import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { RoutePath, getDefaultAdminPath } from 'app/routes';
import type { AdminLoginRequest, AdminSessionUser } from 'shared/api/admin-types';
import { useSearchParams } from 'shared/hooks/router';

import {
  completeMFAChallengeRequest,
  confirmMFAEnrollmentRequest,
  lockRequest,
  loginRequest,
  logoutRequest,
  startMFAEnrollmentRequest,
  unlockRequest,
} from '../data-access';
import type {
  AdminCredentialResponse,
  AdminLoginResponse,
  MFAEnrollmentResponse,
  MFAProof,
} from '../domain/entities/admin-auth.types';
import { authStore } from '../domain/stores/authentication.store';
import { currentUserStore } from '../domain/stores/current-user.store';

import { getSafeAdminReturnTarget } from './safe-return-to';
import { applyAdminCredentials, clearAdminAuthentication, markAdminSessionLocked } from './session-coordinator';

function useAdminAuthNavigation() {
  const navigate = useNavigate();
  const searchParams = useSearchParams();

  return useCallback(
    (user: AdminSessionUser) => {
      const returnTo = getSafeAdminReturnTarget(searchParams.get('returnTo'));
      const redirectPath = returnTo || getDefaultAdminPath(user) || RoutePath.main;
      void navigate(redirectPath, { replace: true });
    },
    [navigate, searchParams],
  );
}

export const useLoginMutation = (
  options?: Omit<UseMutationOptions<AdminLoginResponse, Error, AdminLoginRequest, unknown>, 'mutationFn'>,
) => {
  const navigateAfterAuthentication = useAdminAuthNavigation();
  return useMutation({
    ...options,
    mutationFn: loginRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      if (data.status === 'authenticated') {
        applyAdminCredentials(data);
        navigateAfterAuthentication(data.user);
      }
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useMFAEnrollmentStartMutation = (
  options?: Omit<UseMutationOptions<MFAEnrollmentResponse, Error, string, unknown>, 'mutationFn'>,
) => useMutation({ mutationFn: startMFAEnrollmentRequest, ...options });

export const useMFAEnrollmentConfirmMutation = (
  options?: Omit<
    UseMutationOptions<AdminCredentialResponse, Error, { challengeToken: string; code: string }, unknown>,
    'mutationFn'
  >,
) =>
  useMutation({
    ...options,
    mutationFn: ({ challengeToken, code }) => confirmMFAEnrollmentRequest(challengeToken, code),
    onSuccess: (data, variables, onMutateResult, context) => {
      applyAdminCredentials(data);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });

export const useMFAChallengeMutation = (
  options?: Omit<
    UseMutationOptions<AdminCredentialResponse, Error, { challengeToken: string; proof: MFAProof }, unknown>,
    'mutationFn'
  >,
) => {
  const navigateAfterAuthentication = useAdminAuthNavigation();
  return useMutation({
    ...options,
    mutationFn: ({ challengeToken, proof }) => completeMFAChallengeRequest(challengeToken, proof),
    onSuccess: (data, variables, onMutateResult, context) => {
      applyAdminCredentials(data);
      navigateAfterAuthentication(data.user);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};

export const useContinueAfterEnrollment = () => {
  const navigateAfterAuthentication = useAdminAuthNavigation();
  return useCallback(() => {
    const current = currentUserStore.getState().currentUser;
    if (current) {
      navigateAfterAuthentication(current);
    }
  }, [navigateAfterAuthentication]);
};

export const useUnlockMutation = (
  options?: Omit<UseMutationOptions<AdminCredentialResponse, Error, string, unknown>, 'mutationFn'>,
) =>
  useMutation({
    ...options,
    mutationFn: unlockRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      applyAdminCredentials(data);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });

export const useLockMutation = (options?: Omit<UseMutationOptions<void, Error, void, unknown>, 'mutationFn'>) =>
  useMutation({
    mutationFn: async () => {
      const token = authStore.getState().getAccessToken();
      if (token) {
        const response = await lockRequest(token);
        markAdminSessionLocked(response.lockedAt);
      } else {
        markAdminSessionLocked();
      }
    },
    ...options,
  });

export const useLogoutMutation = (options?: Omit<UseMutationOptions<void, Error, void, unknown>, 'mutationFn'>) => {
  const navigate = useNavigate();
  return useMutation({
    ...options,
    mutationFn: logoutRequest,
    onSuccess: (data, variables, onMutateResult, context) => {
      clearAdminAuthentication();
      void navigate(RoutePath.login, { replace: true });
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
};
