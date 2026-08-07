import type {
  AdminPaginatedResponse,
  AdminRestaurant,
  AdminRestaurantBranchCreatePayload,
  AdminRestaurantActivationOptions,
  AdminRestaurantActivationPayload,
  AdminRestaurantActivationResult,
  AdminRestaurantBalanceTransaction,
  AdminRestaurantBalanceTransactionsQueryParams,
  AdminRestaurantDetail,
  AdminRestaurantLookupResult,
  AdminRestaurantPayload,
  AdminRestaurantsQueryParams,
  AdminRestaurantTopUpPayload,
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

  rotateAdminRestaurantAuthCode(id: string) {
    return instance
      .post<AdminRestaurant>(`/api/v1/admin/platform/restaurants/${id}/rotate-auth-code/`)
      .then((response) => response.data);
  },

  deactivateAdminRestaurant(id: string) {
    return instance
      .post<void>(`/api/v1/admin/platform/restaurants/${id}/deactivate/`)
      .then((response) => response.data);
  },

  extendAdminRestaurant(id: string) {
    return instance
      .post<AdminRestaurant>(`/api/v1/admin/platform/restaurants/${id}/extend/`)
      .then((response) => response.data);
  },

  resetAdminRestaurantPassword(id: string) {
    return instance
      .post<AdminRestaurantActivationResult>(`/api/v1/admin/platform/restaurants/${id}/reset-password/`)
      .then((response) => response.data);
  },

  getAdminRestaurantBalanceTransactions(id: string, params?: AdminRestaurantBalanceTransactionsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminRestaurantBalanceTransaction>>(
        `/api/v1/admin/platform/restaurants/${id}/balance-transactions/`,
        {
          params: {
            page: params?.page,
            pageSize: params?.pageSize,
            search: params?.search,
            ordering: params?.ordering,
          },
        },
      )
      .then((response) => response.data);
  },

  topUpAdminRestaurantBalance(id: string, payload: AdminRestaurantTopUpPayload) {
    return instance
      .post<AdminRestaurantBalanceTransaction>(`/api/v1/admin/platform/restaurants/${id}/top-up/`, payload)
      .then((response) => response.data);
  },
};
