import type {
  AdminCollectionResponse,
  AdminPaginatedResponse,
  AdminTariff,
  AdminTariffOption,
  AdminTariffPayload,
  AdminTariffsQueryParams,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

function extractOptions(payload: AdminCollectionResponse<AdminTariffOption> | AdminTariffOption[]) {
  return Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
}

export const adminTariffGateway = {
  getAdminTariffs(params?: AdminTariffsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminTariff>>('/api/v1/admin/platform/tariffs/', {
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

  getAdminTariffById(id: string) {
    return instance.get<AdminTariff>(`/api/v1/admin/platform/tariffs/${id}/`).then((response) => response.data);
  },

  getAdminTariffOptions() {
    return instance
      .get<AdminCollectionResponse<AdminTariffOption> | AdminTariffOption[]>('/api/v1/admin/platform/tariff-options/')
      .then((response) => extractOptions(response.data));
  },

  createAdminTariff(payload: AdminTariffPayload) {
    return instance.post<AdminTariff>('/api/v1/admin/platform/tariffs/', payload).then((response) => response.data);
  },

  updateAdminTariff(id: string, payload: AdminTariffPayload) {
    return instance
      .put<AdminTariff>(`/api/v1/admin/platform/tariffs/${id}/`, payload)
      .then((response) => response.data);
  },
};
