import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  AdminKitchenTicket,
  AdminKitchenTicketsQueryParams,
  AdminPaginatedResponse,
  AdminPrepStation,
} from 'shared/api/admin-types';

import { kitchenRepository } from '../data-access';

import { kitchenKeys } from './keys';

export function useGetKitchenTicketsQuery(
  params: AdminKitchenTicketsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<AdminKitchenTicket>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: kitchenKeys.list(params),
    queryFn: () => kitchenRepository.getList(params),
    ...options,
  });
}

export function useGetKitchenTicketByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<AdminKitchenTicket>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: kitchenKeys.detail(id),
    queryFn: () => kitchenRepository.getById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetKitchenPrepStationsQuery(
  options?: Omit<UseQueryOptions<AdminPrepStation[]>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: kitchenKeys.prepStations(),
    queryFn: () => kitchenRepository.getPrepStations(),
    ...options,
  });
}
