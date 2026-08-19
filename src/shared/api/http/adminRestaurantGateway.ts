import type {
  AdminPaginatedResponse,
  AdminRestaurant,
  AdminRestaurantBranchCreatePayload,
  AdminRestaurantActivationOptions,
  AdminRestaurantActivationPayload,
  AdminRestaurantActivationResult,
  AdminRestaurantDetail,
  AdminRestaurantLookupResult,
  AdminRestaurantPayload,
  AdminRestaurantsQueryParams,
  AdminRestaurantTariffChangePayload,
  AdminRestaurantTariffChangePreview,
  AdminRestaurantTariffChangeResult,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

const RESTAURANT_BRANCH_CREATE_TIMEOUT_MS = 120_000;

export const adminRestaurantGateway = {
  getAdminRestaurants(params?: AdminRestaurantsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminRestaurant>>('/api/v1/admin/restaurants/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminRestaurantById(id: string) {
    return instance.get<AdminRestaurant>(`/api/v1/admin/restaurants/${id}/`).then((response) => response.data);
  },

  getAdminRestaurantDetail(id: string) {
    return instance
      .get<AdminRestaurantDetail>(`/api/v1/admin/restaurants/${id}/detail/`)
      .then((response) => response.data);
  },

  lookupAdminRestaurant(taxNumber: string) {
    return instance
      .get<AdminRestaurantLookupResult>('/api/v1/admin/restaurants/lookup/', { params: { taxNumber } })
      .then((response) => response.data);
  },

  createAdminRestaurant(payload: AdminRestaurantPayload | FormData) {
    return instance.post<AdminRestaurant>('/api/v1/admin/restaurants/', payload).then((response) => response.data);
  },

  createAdminRestaurantBranch(parentId: string, payload: AdminRestaurantBranchCreatePayload | FormData) {
    return instance
      .post<AdminRestaurant>(`/api/v1/admin/restaurants/${parentId}/branches/`, payload, {
        timeout: RESTAURANT_BRANCH_CREATE_TIMEOUT_MS,
      })
      .then((response) => response.data);
  },

  updateAdminRestaurant(id: string, payload: AdminRestaurantPayload | FormData) {
    return instance.put<AdminRestaurant>(`/api/v1/admin/restaurants/${id}/`, payload).then((response) => response.data);
  },

  updateAdminRestaurantSettings(payload: Partial<AdminRestaurantPayload> | FormData) {
    return instance
      .put<AdminRestaurant>('/api/v1/admin/restaurants/settings/', payload)
      .then((response) => response.data);
  },

  deleteAdminRestaurant(id: string) {
    return instance.delete<void>(`/api/v1/admin/restaurants/${id}/`).then((response) => response.data);
  },

  activateAdminRestaurant(id: string, payload: AdminRestaurantActivationPayload) {
    return instance
      .post<AdminRestaurantActivationResult>(`/api/v1/admin/platform/restaurants/${id}/activate/`, payload)
      .then((response) => response.data);
  },

  getAdminRestaurantActivationOptions() {
    return instance
      .get<AdminRestaurantActivationOptions>('/api/v1/admin/platform/restaurants/activation-options/')
      .then((response) => response.data);
  },

  deactivateAdminRestaurant(id: string) {
    return instance
      .post<void>(`/api/v1/admin/platform/restaurants/${id}/deactivate/`)
      .then((response) => response.data);
  },

  getAdminRestaurantTariffChangePreview(id: string, tariffId: string) {
    return instance
      .get<AdminRestaurantTariffChangePreview>(`/api/v1/admin/platform/restaurants/${id}/tariff-change/`, {
        params: { tariffId },
      })
      .then((response) => response.data);
  },

  changeAdminRestaurantTariff(id: string, payload: AdminRestaurantTariffChangePayload) {
    return instance
      .post<AdminRestaurantTariffChangeResult>(`/api/v1/admin/platform/restaurants/${id}/tariff-change/`, payload)
      .then((response) => response.data);
  },

  resetAdminRestaurantPassword(id: string) {
    return instance
      .post<AdminRestaurantActivationResult>(`/api/v1/admin/platform/restaurants/${id}/reset-password/`)
      .then((response) => response.data);
  },
};
