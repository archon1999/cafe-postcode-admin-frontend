import type {
  AdminPaginatedResponse,
  AdminPrepStation,
  AdminPrepStationsQueryParams,
  AdminPrepStationPayload,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminPrepStationGateway = {
  getAdminPrepStations(params?: AdminPrepStationsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminPrepStation>>('/api/v1/admin/restaurants/prep-stations/', {
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

  getAdminPrepStationById(id: string) {
    return instance
      .get<AdminPrepStation>(`/api/v1/admin/restaurants/prep-stations/${id}/`)
      .then((response) => response.data);
  },

  createAdminPrepStation(payload: AdminPrepStationPayload) {
    return instance
      .post<AdminPrepStation>('/api/v1/admin/restaurants/prep-stations/', payload)
      .then((response) => response.data);
  },

  updateAdminPrepStation(id: string, payload: AdminPrepStationPayload) {
    return instance
      .put<AdminPrepStation>(`/api/v1/admin/restaurants/prep-stations/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminPrepStation(id: string) {
    return instance.delete<void>(`/api/v1/admin/restaurants/prep-stations/${id}/`).then((response) => response.data);
  },
};
