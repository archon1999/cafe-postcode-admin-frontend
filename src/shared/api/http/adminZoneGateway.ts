import type {
  AdminPaginatedResponse,
  AdminZoneOrCabin,
  AdminZoneOrCabinPayload,
  AdminZonesQueryParams,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminZoneGateway = {
  getAdminZones(params?: AdminZonesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminZoneOrCabin>>('/api/v1/admin/floor/zones/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          is_active: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminZoneById(id: string) {
    return instance.get<AdminZoneOrCabin>(`/api/v1/admin/floor/zones/${id}/`).then((response) => response.data);
  },

  createAdminZone(payload: AdminZoneOrCabinPayload) {
    return instance.post<AdminZoneOrCabin>('/api/v1/admin/floor/zones/', payload).then((response) => response.data);
  },

  updateAdminZone(id: string, payload: AdminZoneOrCabinPayload) {
    return instance
      .put<AdminZoneOrCabin>(`/api/v1/admin/floor/zones/${id}/`, payload)
      .then((response) => response.data);
  },

  updateAdminZoneSortOrder(id: string, sortOrder: number) {
    return instance
      .patch<AdminZoneOrCabin>(`/api/v1/admin/floor/zones/${id}/`, { sortOrder })
      .then((response) => response.data);
  },

  deleteAdminZone(id: string) {
    return instance.delete<void>(`/api/v1/admin/floor/zones/${id}/`).then((response) => response.data);
  },
};
