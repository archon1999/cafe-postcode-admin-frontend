import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  AdminBusinessPartner,
  AdminBusinessPartnersQueryParams,
  AdminPartnerActivationDefaults,
  AdminPaginatedResponse,
  AdminRestaurantActivationOptions,
  AdminTariff,
  AdminTariffsQueryParams,
} from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { platformKeys } from './keys';

export function useGetBusinessPartnersListQuery(
  params: AdminBusinessPartnersQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminBusinessPartner>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: platformKeys.businessPartnersList(params),
    queryFn: () => apiClient.getAdminBusinessPartners(params),
    ...options,
  });
}

export function useGetBusinessPartnerByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminBusinessPartner>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: platformKeys.businessPartnerDetail(id),
    queryFn: () => apiClient.getAdminBusinessPartnerById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetBusinessPartnerActivationDefaultsQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminPartnerActivationDefaults>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: platformKeys.businessPartnerActivationDefaults(id),
    queryFn: () => apiClient.getAdminBusinessPartnerActivationDefaults(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetTariffsListQuery(
  params: AdminTariffsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminTariff>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: platformKeys.tariffsList(params),
    queryFn: () => apiClient.getAdminTariffs(params),
    ...options,
  });
}

export function useGetTariffByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminTariff>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: platformKeys.tariffDetail(id),
    queryFn: () => apiClient.getAdminTariffById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetRestaurantActivationOptionsQuery(
  options?: Omit<UseQueryOptions<AdminRestaurantActivationOptions>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: platformKeys.restaurantActivationOptions(),
    queryFn: () => apiClient.getAdminRestaurantActivationOptions(),
    ...options,
  });
}
