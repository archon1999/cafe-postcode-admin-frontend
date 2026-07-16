import type {
  AdminPaginatedResponse,
  AdminTableSession,
  AdminTableSessionsQueryParams,
  AdminTableSessionPayload,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminTableSessionGateway = {
  getAdminTableSessions(params?: AdminTableSessionsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminTableSession>>('/api/v1/admin/floor/table-sessions/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          hallIdIn: params?.hallIdIn,
          statusIn: params?.statusIn,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminTableSessionById(id: string) {
    return instance
      .get<AdminTableSession>(`/api/v1/admin/floor/table-sessions/${id}/`)
      .then((response) => response.data);
  },

  createAdminTableSession(payload: AdminTableSessionPayload) {
    return instance
      .post<AdminTableSession>('/api/v1/admin/floor/table-sessions/', payload)
      .then((response) => response.data);
  },

  updateAdminTableSession(id: string, payload: AdminTableSessionPayload) {
    return instance
      .put<AdminTableSession>(`/api/v1/admin/floor/table-sessions/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminTableSession(id: string) {
    return instance.delete<void>(`/api/v1/admin/floor/table-sessions/${id}/`).then((response) => response.data);
  },
};
