import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  AdminHall,
  AdminPaginatedResponse,
  AdminPermission,
  AdminPermissionsQueryParams,
  AdminRole,
  AdminRolesQueryParams,
  AdminUser,
  AdminUsersQueryParams,
} from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { usersRepository } from '../data-access';

import { usersKeys } from './keys';

export function useGetUsersQuery(
  params: AdminUsersQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminUser>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersRepository.getList(params),
    ...options,
  });
}

export function useGetUserByIdQuery(id: string, options?: Omit<UseQueryOptions<AdminUser>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersRepository.getById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetRolesQuery(options?: Omit<UseQueryOptions<AdminRole[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: usersKeys.roles(),
    queryFn: () => usersRepository.getRoles(),
    ...options,
  });
}

export function useGetRolesListQuery(
  params: AdminRolesQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminRole>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: usersKeys.rolesList(params),
    queryFn: () => apiClient.getAdminRolesPage(params),
    ...options,
  });
}

export function useGetRoleByIdQuery(id: string, options?: Omit<UseQueryOptions<AdminRole>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: usersKeys.roleDetail(id),
    queryFn: () => usersRepository.getRoleById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetPermissionsQuery(options?: Omit<UseQueryOptions<AdminPermission[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: usersKeys.permissions(),
    queryFn: () => usersRepository.getPermissions(),
    ...options,
  });
}

export function useGetPermissionsListQuery(
  params: AdminPermissionsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminPermission>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: usersKeys.permissionsList(params),
    queryFn: () => apiClient.getAdminPermissionsPage(params),
    ...options,
  });
}

export function useGetHallsQuery(options?: Omit<UseQueryOptions<AdminHall[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: usersKeys.halls(),
    queryFn: () => usersRepository.getHalls(),
    ...options,
  });
}
