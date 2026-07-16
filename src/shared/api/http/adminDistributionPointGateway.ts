import type {
  AdminDistributionPoint,
  AdminDistributionPointsQueryParams,
  AdminDistributionPointPayload,
  AdminPaginatedResponse,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminDistributionPointGateway = {
  getAdminDistributionPoints(params?: AdminDistributionPointsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminDistributionPoint>>('/api/v1/admin/restaurants/distribution-points/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          kindIn: params?.kindIn,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminDistributionPointById(id: string) {
    return instance
      .get<AdminDistributionPoint>(`/api/v1/admin/restaurants/distribution-points/${id}/`)
      .then((response) => response.data);
  },

  createAdminDistributionPoint(payload: AdminDistributionPointPayload) {
    return instance
      .post<AdminDistributionPoint>('/api/v1/admin/restaurants/distribution-points/', payload)
      .then((response) => response.data);
  },

  updateAdminDistributionPoint(id: string, payload: AdminDistributionPointPayload) {
    return instance
      .put<AdminDistributionPoint>(`/api/v1/admin/restaurants/distribution-points/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminDistributionPoint(id: string) {
    return instance
      .delete<void>(`/api/v1/admin/restaurants/distribution-points/${id}/`)
      .then((response) => response.data);
  },
};
