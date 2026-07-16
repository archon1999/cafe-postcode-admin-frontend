import type {
  AdminCashDesk,
  AdminCashDesksQueryParams,
  AdminCashDeskPayload,
  AdminPaginatedResponse,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminCashDeskGateway = {
  getAdminCashDesks(params?: AdminCashDesksQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminCashDesk>>('/api/v1/admin/restaurants/cash-desks/', {
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

  getAdminCashDeskById(id: string) {
    return instance.get<AdminCashDesk>(`/api/v1/admin/restaurants/cash-desks/${id}/`).then((response) => response.data);
  },

  createAdminCashDesk(payload: AdminCashDeskPayload) {
    return instance
      .post<AdminCashDesk>('/api/v1/admin/restaurants/cash-desks/', payload)
      .then((response) => response.data);
  },

  updateAdminCashDesk(id: string, payload: AdminCashDeskPayload) {
    return instance
      .put<AdminCashDesk>(`/api/v1/admin/restaurants/cash-desks/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminCashDesk(id: string) {
    return instance.delete<void>(`/api/v1/admin/restaurants/cash-desks/${id}/`).then((response) => response.data);
  },
};
