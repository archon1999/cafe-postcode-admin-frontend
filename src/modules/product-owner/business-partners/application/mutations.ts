import { useMutation, useQueryClient } from '@tanstack/react-query';

import { organizationsKeys } from 'modules/business-partner/restaurants/application/keys';
import type {
  AdminBusinessPartnerPayload,
  AdminPartnerActivationDefaults,
  AdminRestaurantActivationPayload,
  AdminTariffPayload,
} from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { platformKeys } from './keys';

function invalidate(queryClient: ReturnType<typeof useQueryClient>, queryKeys: ReadonlyArray<readonly unknown[]>) {
  return Promise.all(queryKeys.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
}

export function useCreateBusinessPartnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminBusinessPartnerPayload) => apiClient.createAdminBusinessPartner(payload),
    onSuccess: async () => {
      await invalidate(queryClient, [platformKeys.businessPartners()]);
    },
  });
}

export function useLookupBusinessPartnerMutation() {
  return useMutation({
    mutationFn: (inn: string) => apiClient.lookupAdminBusinessPartner(inn),
  });
}

export function useUpdateBusinessPartnerMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminBusinessPartnerPayload) => apiClient.updateAdminBusinessPartner(id, payload),
    onSuccess: async () => {
      await invalidate(queryClient, [platformKeys.businessPartners(), platformKeys.businessPartnerDetail(id)]);
    },
  });
}

export function useActivateBusinessPartnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: AdminPartnerActivationDefaults }) =>
      apiClient.activateAdminBusinessPartner(id, payload),
    onSuccess: async () => {
      await invalidate(queryClient, [platformKeys.businessPartners()]);
    },
  });
}

export function useDeactivateBusinessPartnerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deactivateAdminBusinessPartner(id),
    onSuccess: async () => {
      await invalidate(queryClient, [platformKeys.businessPartners()]);
    },
  });
}

export function useResetBusinessPartnerPasswordMutation() {
  return useMutation({
    mutationFn: (id: string) => apiClient.resetAdminBusinessPartnerPassword(id),
  });
}

export function useCreateTariffMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminTariffPayload) => apiClient.createAdminTariff(payload),
    onSuccess: async () => {
      await invalidate(queryClient, [platformKeys.tariffs()]);
    },
  });
}

export function useUpdateTariffMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminTariffPayload) => apiClient.updateAdminTariff(id, payload),
    onSuccess: async () => {
      await invalidate(queryClient, [platformKeys.tariffs(), platformKeys.tariffDetail(id)]);
    },
  });
}

export function useActivateRestaurantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AdminRestaurantActivationPayload }) =>
      apiClient.activateAdminRestaurant(id, payload),
    onSuccess: async (_data, variables) => {
      await invalidate(queryClient, [
        organizationsKeys.restaurants(),
        organizationsKeys.restaurantDetail(variables.id),
      ]);
    },
  });
}

export function useDeactivateRestaurantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deactivateAdminRestaurant(id),
    onSuccess: async (_data, id) => {
      await invalidate(queryClient, [organizationsKeys.restaurants(), organizationsKeys.restaurantDetail(id)]);
    },
  });
}

export function useExtendRestaurantMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.extendAdminRestaurant(id),
    onSuccess: async (_data, id) => {
      await invalidate(queryClient, [organizationsKeys.restaurants(), organizationsKeys.restaurantDetail(id)]);
    },
  });
}

export function useResetRestaurantPasswordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.resetAdminRestaurantPassword(id),
    onSuccess: async (_data, id) => {
      await invalidate(queryClient, [organizationsKeys.restaurants(), organizationsKeys.restaurantDetail(id)]);
    },
  });
}

export function useRotateRestaurantAuthCodeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.rotateAdminRestaurantAuthCode(id),
    onSuccess: async (_data, id) => {
      await invalidate(queryClient, [organizationsKeys.restaurants(), organizationsKeys.restaurantDetail(id)]);
    },
  });
}
