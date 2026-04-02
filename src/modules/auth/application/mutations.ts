import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { useNavigate } from 'react-router';

import { RoutePath } from 'app/routes';
import type { AdminLoginRequest, AdminLoginResponse } from 'shared/api/admin-types';
import { useSearchParams } from 'shared/hooks/router';

import { getCurrentUserRequest, loginRequest, logoutRequest } from '../data-access';
import { adminScopeStore } from '../domain/stores/admin-scope.store';
import { useAuthStore } from '../domain/stores/authentication.store';
import { currentUserStore } from '../domain/stores/current-user.store';

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
        setAccessToken(data.token);

        const { clearCurrentUser, setCurrentUser } = currentUserStore.getState();
        clearCurrentUser();

        try {
          const profile = await getCurrentUserRequest();
          setCurrentUser(profile);
          if (!profile.isSuperuser) {
            adminScopeStore.getState().clearScope();
          }
        } catch (error) {
          console.error('Failed to fetch current user profile', error);
          setCurrentUser(data.user);
          if (!data.user.isSuperuser) {
            adminScopeStore.getState().clearScope();
          }
        }

        const returnTo = searchParams.get('returnTo');
        const redirectPath = returnTo || RoutePath.main;

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
