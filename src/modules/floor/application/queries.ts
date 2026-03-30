import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  AdminDiningTable,
  AdminDiningTablesQueryParams,
  AdminHallConstructor,
  AdminHall,
  AdminHallsQueryParams,
  AdminPaginatedResponse,
  AdminTableSession,
  AdminTableSessionsQueryParams,
  AdminUser,
} from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { floorRepository } from '../data-access';

import { floorKeys } from './keys';

export function useGetUsersForFloorQuery(options?: Omit<UseQueryOptions<AdminUser[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: floorKeys.users(),
    queryFn: () => floorRepository.getUsers(),
    ...options,
  });
}

export function useGetFloorHallsQuery(options?: Omit<UseQueryOptions<AdminHall[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: floorKeys.halls(),
    queryFn: () => floorRepository.getHalls(),
    ...options,
  });
}

export function useGetFloorHallsListQuery(
  params: AdminHallsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminHall>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: floorKeys.hallsList(params),
    queryFn: () => apiClient.getAdminHalls(params),
    ...options,
  });
}

export function useGetHallByIdQuery(id: string, options?: Omit<UseQueryOptions<AdminHall>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: floorKeys.hallDetail(id),
    queryFn: () => floorRepository.getHallById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetHallConstructorQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminHallConstructor>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: floorKeys.hallConstructor(id),
    queryFn: () => floorRepository.getHallConstructor(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetDiningTablesQuery(options?: Omit<UseQueryOptions<AdminDiningTable[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: floorKeys.diningTables(),
    queryFn: () => floorRepository.getDiningTables(),
    ...options,
  });
}

export function useGetDiningTablesListQuery(
  params: AdminDiningTablesQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminDiningTable>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: floorKeys.diningTablesList(params),
    queryFn: () => apiClient.getAdminDiningTables(params),
    ...options,
  });
}

export function useGetDiningTableByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminDiningTable>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: floorKeys.diningTableDetail(id),
    queryFn: () => floorRepository.getDiningTableById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetTableSessionsQuery(options?: Omit<UseQueryOptions<AdminTableSession[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: floorKeys.tableSessions(),
    queryFn: () => floorRepository.getTableSessions(),
    ...options,
  });
}

export function useGetTableSessionsListQuery(
  params: AdminTableSessionsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminTableSession>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: floorKeys.tableSessionsList(params),
    queryFn: () => apiClient.getAdminTableSessions(params),
    ...options,
  });
}

export function useGetTableSessionByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminTableSession>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: floorKeys.tableSessionDetail(id),
    queryFn: () => floorRepository.getTableSessionById(id),
    enabled: Boolean(id),
    ...options,
  });
}
