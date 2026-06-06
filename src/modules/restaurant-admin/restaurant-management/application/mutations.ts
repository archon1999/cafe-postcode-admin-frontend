import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  AdminCashDeskPayload,
  AdminDistributionPointPayload,
  AdminIntegrationConfigPayload,
  AdminPrepStationPayload,
  AdminRestaurantPayload,
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

export function useCreateIntegrationConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminIntegrationConfigPayload) => organizationsRepository.createIntegrationConfig(payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.integrationConfigs()]);
    },
  });
}

export function useDetectFiscalDevicesMutation() {
  return useMutation({
    mutationFn: (endpointUrl?: string) => apiClient.getAdminFiscalDevices(endpointUrl),
  });
}

export function useUpdateIntegrationConfigMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminIntegrationConfigPayload) =>
      organizationsRepository.updateIntegrationConfig(id, payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [
        organizationsKeys.integrationConfigs(),
        organizationsKeys.integrationConfigDetail(id),
      ]);
    },
  });
}

export function useDeleteIntegrationConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsRepository.deleteIntegrationConfig(id),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.integrationConfigs()]);
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

export function useUpdateRestaurantMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminRestaurantPayload) => organizationsRepository.updateRestaurant(id, payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [
        organizationsKeys.restaurants(),
        organizationsKeys.restaurantDetail(id),
        organizationsKeys.myRestaurant(),
      ]);
    },
  });
}

export function useUpdateMyRestaurantSettingsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminRestaurantPayload) => organizationsRepository.updateMyRestaurantSettings(payload),
    onSuccess: async (restaurant) => {
      await invalidateQueryKeys(queryClient, [
        organizationsKeys.restaurants(),
        organizationsKeys.restaurantDetail(restaurant.id),
        organizationsKeys.myRestaurant(),
      ]);
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
