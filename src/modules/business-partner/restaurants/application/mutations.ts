import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  AdminCashDeskPayload,
  AdminDevicePayload,
  AdminDistributionPointPayload,
  AdminFeatureConfigPayload,
  AdminPrepStationPayload,
  AdminRestaurantPayload,
} from 'shared/api/admin-types';

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

export function useCreateDeviceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminDevicePayload) => organizationsRepository.createDevice(payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.devices()]);
    },
  });
}

export function useUpdateDeviceMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminDevicePayload) => organizationsRepository.updateDevice(id, payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.devices(), organizationsKeys.deviceDetail(id)]);
    },
  });
}

export function useDeleteDeviceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsRepository.deleteDevice(id),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.devices()]);
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

export function useCreateFeatureConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminFeatureConfigPayload) => organizationsRepository.createFeatureConfig(payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.featureConfigs()]);
    },
  });
}

export function useUpdateFeatureConfigMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminFeatureConfigPayload) => organizationsRepository.updateFeatureConfig(id, payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [
        organizationsKeys.featureConfigs(),
        organizationsKeys.featureConfigDetail(id),
      ]);
    },
  });
}

export function useDeleteFeatureConfigMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => organizationsRepository.deleteFeatureConfig(id),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [organizationsKeys.featureConfigs()]);
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

export function useUpsertRestaurantFeatureConfigMutation(restaurantId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AdminFeatureConfigPayload) =>
      organizationsRepository.upsertRestaurantFeatureConfig(restaurantId, payload),
    onSuccess: async () => {
      await invalidateQueryKeys(queryClient, [
        organizationsKeys.restaurantFeatureConfig(restaurantId),
        organizationsKeys.restaurantDetail(restaurantId),
        organizationsKeys.restaurants(),
      ]);
    },
  });
}
