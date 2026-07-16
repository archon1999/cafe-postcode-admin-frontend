import type {
  AdminDiningTable,
  AdminDiningTablesQueryParams,
  AdminDiningTablePayload,
  AdminPaginatedResponse,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminDiningTableGateway = {
  getAdminDiningTables(params?: AdminDiningTablesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminDiningTable>>('/api/v1/admin/floor/tables/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          hallIdIn: params?.hallIdIn,
          shapeIn: params?.shapeIn,
          statusIn: params?.statusIn,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminDiningTableById(id: string) {
    return instance.get<AdminDiningTable>(`/api/v1/admin/floor/tables/${id}/`).then((response) => response.data);
  },

  createAdminDiningTable(payload: AdminDiningTablePayload) {
    return instance.post<AdminDiningTable>('/api/v1/admin/floor/tables/', payload).then((response) => response.data);
  },

  updateAdminDiningTable(id: string, payload: AdminDiningTablePayload) {
    return instance
      .put<AdminDiningTable>(`/api/v1/admin/floor/tables/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminDiningTable(id: string) {
    return instance.delete<void>(`/api/v1/admin/floor/tables/${id}/`).then((response) => response.data);
  },
};
