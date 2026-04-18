import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  AdminCashDeskPayload,
  AdminDistributionPointPayload,
  AdminPrepStationPayload,
  AdminRestaurantPayload,
  AdminRestaurantTopUpPayload,
} from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { organizationsRepository } from '../data-access';

import { organizationsKeys } from './keys';

function invalidateQueryKeys(queryClient: ReturnType<typeof useQueryClient>, keys: ReadonlyArray<readonly unknown[]>) {
  return Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useCreateCashDeskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCashDeskPayload) => organizationsRepository.createCashDesk(payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.cashDesks()]);
    },
  });
}

export function useUpdateCashDeskMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminCashDeskPayload) => organizationsRepository.updateCashDesk(id, payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.cashDesks(), organizationsKeys.cashDeskDetail(id)]);
    },
  });
}

export function useDeleteCashDeskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsRepository.deleteCashDesk(id),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.cashDesks()]);
    },
  });
}

export function useCreateDistributionPointMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminDistributionPointPayload) => organizationsRepository.createDistributionPoint(payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.distributionPoints()]);
    },
  });
}

export function useUpdateDistributionPointMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminDistributionPointPayload) =>
      organizationsRepository.updateDistributionPoint(id, payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [
        organizationsKeys.distributionPoints(),
        organizationsKeys.distributionPointDetail(id),
      ]);
    },
  });
}

export function useDeleteDistributionPointMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsRepository.deleteDistributionPoint(id),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.distributionPoints()]);
    },
  });
}

export function useCreatePrepStationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminPrepStationPayload) => organizationsRepository.createPrepStation(payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.prepStations()]);
    },
  });
}

export function useUpdatePrepStationMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminPrepStationPayload) => organizationsRepository.updatePrepStation(id, payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [
        organizationsKeys.prepStations(),
        organizationsKeys.prepStationDetail(id),
      ]);
    },
  });
}

export function useDeletePrepStationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsRepository.deletePrepStation(id),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.prepStations()]);
    },
  });
}

export function useCreateRestaurantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminRestaurantPayload) => organizationsRepository.createRestaurant(payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.restaurants()]);
    },
  });
}

export function useLookupRestaurantMutation() {
  return useMutation({
    mutationFn: (taxNumber: string) => apiClient.lookupAdminRestaurant(taxNumber),
  });
}

export function useUpdateRestaurantMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminRestaurantPayload) => organizationsRepository.updateRestaurant(id, payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.restaurants(), organizationsKeys.restaurantDetail(id)]);
    },
  });
}

export function useDeleteRestaurantMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsRepository.deleteRestaurant(id),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.restaurants()]);
    },
  });
}

export function useTopUpRestaurantBalanceMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminRestaurantTopUpPayload) => apiClient.topUpAdminRestaurantBalance(id, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: organizationsKeys.restaurantOverview(id) }),
        queryClient.invalidateQueries({ queryKey: organizationsKeys.restaurantBalanceTransactions(id) }),
      ]);
    },
  });
}
