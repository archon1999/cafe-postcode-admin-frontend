import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { RoutePath, getDefaultAdminPath } from 'app/routes';
import type { AdminLoginRequest, AdminLoginResponse } from 'shared/api/admin-types';
import { useSearchParams } from 'shared/hooks/router';

import { loginRequest, logoutRequest } from '../data-access';
import { adminScopeStore } from '../domain/stores/admin-scope.store';
import { useAuthStore } from '../domain/stores/authentication.store';
import { currentUserStore } from '../domain/stores/current-user.store';

import { syncCurrentUser } from './current-user';

export const useLoginMutation = (
  options?: Omit<UseMutationOptions<AdminLoginResponse, Error, AdminLoginRequest, unknown>, 'mutationFn'>,
) => {
  const navigate = useNavigate();
  const searchParams = useSearchParams();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: (params: AdminLoginRequest) => loginRequest(params),
    onSuccess: async (data) => {
      if (data.token) {
        currentUserStore.getState().clearCurrentUser();
        setAccessToken(data.token, { bootstrapping: true });

        let profile = data.user;

        try {
          profile = await syncCurrentUser({ fallbackUser: data.user });
        } catch (error) {
          console.error('Failed to fetch current user profile', error);

          // Keep login flow usable even if profile hydration fails after token is issued.
          if (!data.user.isSuperuser) {
            adminScopeStore.getState().clearScope();
          }
        } finally {
          useAuthStore.getState().setBootstrapping(false);
        }

        const returnTo = searchParams.get('returnTo');
        const redirectPath = returnTo || getDefaultAdminPath(profile) || RoutePath.main;

        void navigate(redirectPath, { replace: true });
      }
    },
    ...options,
  });
};

export const useLogoutMutation = (options?: Omit<UseMutationOptions<void, Error, void, unknown>, 'mutationFn'>) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => logoutRequest(),
    onSuccess: () => {
      void navigate(RoutePath.login, { replace: true });
    },
    ...options,
  });
};
