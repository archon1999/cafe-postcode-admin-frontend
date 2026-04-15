import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  AdminCashDesk,
  AdminCashDesksQueryParams,
  AdminDistributionPoint,
  AdminDistributionPointsQueryParams,
  AdminHall,
  AdminPaginatedResponse,
  AdminPrepStation,
  AdminPrepStationsQueryParams,
  AdminRestaurant,
  AdminRestaurantsQueryParams,
} from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { organizationsRepository } from '../data-access';

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

export function useGetDistributionPointsQuery(
  options?: Omit<UseQueryOptions<AdminDistributionPoint[]>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.distributionPoints(),
    queryFn: () => organizationsRepository.getDistributionPoints(),
    ...options,
  });
}

export function useGetDistributionPointsListQuery(
  params: AdminDistributionPointsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminDistributionPoint>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.distributionPointsList(params),
    queryFn: () => apiClient.getAdminDistributionPoints(params),
    ...options,
  });
}

export function useGetDistributionPointByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminDistributionPoint>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: organizationsKeys.distributionPointDetail(id),
    queryFn: () => organizationsRepository.getDistributionPointById(id),
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

export function useGetRestaurantsQuery(options?: Omit<UseQueryOptions<AdminRestaurant[]>, 'queryFn' | 'queryKey'>) {
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
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminRestaurant>>, 'queryFn' | 'queryKey'>,
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
