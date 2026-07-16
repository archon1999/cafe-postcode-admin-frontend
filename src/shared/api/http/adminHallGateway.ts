import type {
  AdminHall,
  AdminHallConstructor,
  AdminHallConstructorPayload,
  AdminHallsQueryParams,
  AdminHallPayload,
  AdminPaginatedResponse,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminHallGateway = {
  getAdminHalls(params?: AdminHallsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminHall>>('/api/v1/admin/floor/halls/', {
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

  getAdminHallById(id: string) {
    return instance.get<AdminHall>(`/api/v1/admin/floor/halls/${id}/`).then((response) => response.data);
  },

  getAdminHallConstructor(id: string) {
    return instance
      .get<AdminHallConstructor>(`/api/v1/admin/floor/halls/${id}/constructor/`)
      .then((response) => response.data);
  },

  createAdminHall(payload: AdminHallPayload) {
    return instance.post<AdminHall>('/api/v1/admin/floor/halls/', payload).then((response) => response.data);
  },

  updateAdminHall(id: string, payload: AdminHallPayload) {
    return instance.put<AdminHall>(`/api/v1/admin/floor/halls/${id}/`, payload).then((response) => response.data);
  },

  updateAdminHallConstructor(id: string, payload: AdminHallConstructorPayload) {
    return instance
      .put<AdminHallConstructor>(`/api/v1/admin/floor/halls/${id}/constructor/`, payload)
      .then((response) => response.data);
  },

  deleteAdminHall(id: string) {
    return instance.delete<void>(`/api/v1/admin/floor/halls/${id}/`).then((response) => response.data);
  },
};
