import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AdminRolePayload, AdminUser, AdminUserPayload } from 'shared/api/admin-types';

import { usersRepository } from '../data-access';
import { buildUserPayloadFromUser } from '../domain';

import { usersKeys } from './keys';

export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminUserPayload) => usersRepository.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useUpdateUserMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminUserPayload) => usersRepository.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.all });
      await queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
    },
  });
}

export function useToggleUserActiveMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ user, isActive }: { user: AdminUser; isActive: boolean }) =>
      usersRepository.update(user.id, buildUserPayloadFromUser(user, { isActive })),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.all });
      await queryClient.invalidateQueries({ queryKey: usersKeys.detail(variables.user.id) });
    },
  });
}

export function useArchiveUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (user: AdminUser) =>
      usersRepository.update(user.id, buildUserPayloadFromUser(user, { isActive: false, employmentStatus: 'archived' })),
    onSuccess: async (_data, user) => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.all });
      await queryClient.invalidateQueries({ queryKey: usersKeys.detail(user.id) });
    },
  });
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminRolePayload) => usersRepository.createRole(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.roles() });
      await queryClient.invalidateQueries({ queryKey: usersKeys.permissions() });
    },
  });
}

export function useUpdateRoleMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminRolePayload) => usersRepository.updateRole(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.roles() });
      await queryClient.invalidateQueries({ queryKey: usersKeys.roleDetail(id) });
    },
  });
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersRepository.deleteRole(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: usersKeys.roles() });
    },
  });
}
