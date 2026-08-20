import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  AdminCashDesk,
  AdminCashDesksQueryParams,
  AdminHall,
  AdminIntegrationConfig,
  AdminIntegrationConfigsQueryParams,
  AdminPaginatedResponse,
  AdminPrepStation,
  AdminPrepStationsQueryParams,
  AdminRestaurant,
  AdminRestaurantListItem,
  AdminRestaurantsQueryParams,
} from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { organizationsRepository } from '../data-access';
import { restaurantSetupRepository } from '../data-access/repository/setup.repository';

import { organizationsKeys } from './keys';

export function useGetCashDesksQuery(options?: Omit<UseQueryOptions<AdminCashDesk[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: organizationsKeys.cashDesks(),
    queryFn: () => organizationsRepository.getCashDesks(),
    ...options,
  });
}

export function useGetCashDesksListQuery(
  params: AdminCashDesksQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminCashDesk>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.cashDesksList(params),
    queryFn: () => apiClient.getAdminCashDesks(params),
    ...options,
  });
}

export function useGetCashDeskByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminCashDesk>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.cashDeskDetail(id),
    queryFn: () => organizationsRepository.getCashDeskById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetPrepStationsQuery(options?: Omit<UseQueryOptions<AdminPrepStation[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: organizationsKeys.prepStations(),
    queryFn: () => organizationsRepository.getPrepStations(),
    ...options,
  });
}

export function useGetPrepStationsListQuery(
  params: AdminPrepStationsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminPrepStation>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.prepStationsList(params),
    queryFn: () => apiClient.getAdminPrepStations(params),
    ...options,
  });
}

export function useGetOrganizationsPrepStationByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminPrepStation>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.prepStationDetail(id),
    queryFn: () => organizationsRepository.getPrepStationById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetIntegrationConfigsQuery(
  options?: Omit<UseQueryOptions<AdminIntegrationConfig[]>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.integrationConfigs(),
    queryFn: () => organizationsRepository.getIntegrationConfigs(),
    ...options,
  });
}

export function useGetIntegrationConfigsListQuery(
  params: AdminIntegrationConfigsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminIntegrationConfig>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.integrationConfigsList(params),
    queryFn: () => apiClient.getAdminIntegrationConfigs(params),
    ...options,
  });
}

export function useGetIntegrationConfigByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminIntegrationConfig>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.integrationConfigDetail(id),
    queryFn: () => organizationsRepository.getIntegrationConfigById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetRestaurantsQuery(
  options?: Omit<UseQueryOptions<AdminRestaurantListItem[]>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.restaurants(),
    queryFn: () => organizationsRepository.getRestaurants(),
    ...options,
  });
}

export function useGetMyRestaurantQuery(options?: Omit<UseQueryOptions<AdminRestaurant>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: organizationsKeys.myRestaurant(),
    queryFn: () => organizationsRepository.getMyRestaurant(),
    ...options,
  });
}

export function useGetRestaurantsListQuery(
  params: AdminRestaurantsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminRestaurantListItem>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.restaurantsList(params),
    queryFn: () => apiClient.getAdminRestaurants(params),
    ...options,
  });
}

export function useGetRestaurantByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminRestaurant>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.restaurantDetail(id),
    queryFn: () => organizationsRepository.getRestaurantById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetOrganizationsHallsQuery(options?: Omit<UseQueryOptions<AdminHall[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: organizationsKeys.halls(),
    queryFn: () => organizationsRepository.getHalls(),
    ...options,
  });
}

export function useRestaurantSetupReadinessQuery() {
  return useQuery({
    queryKey: organizationsKeys.setupReadiness(),
    queryFn: () => restaurantSetupRepository.getReadiness(),
  });
}

export function useLocalAgentStatusQuery() {
  return useQuery({
    queryKey: organizationsKeys.localAgentStatus(),
    queryFn: () => restaurantSetupRepository.getLocalAgentStatus(),
    refetchInterval: 30_000,
  });
}

export function useLocalAgentDiagnosticsQuery(enabled: boolean) {
  return useQuery({
    queryKey: organizationsKeys.localAgentDiagnostics(),
    queryFn: () => restaurantSetupRepository.getLocalAgentDiagnostics(),
    enabled,
    retry: false,
  });
}

export function useLocalAgentLogsQuery(enabled: boolean) {
  return useQuery({
    queryKey: organizationsKeys.localAgentLogs(),
    queryFn: () => restaurantSetupRepository.getLocalAgentLogs(),
    enabled,
    retry: false,
  });
}
