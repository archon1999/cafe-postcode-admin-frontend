import type {
  AdminFiscalDevice,
  AdminIntegrationConfig,
  AdminIntegrationConfigPayload,
  AdminIntegrationConfigsQueryParams,
  AdminPaginatedResponse,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminIntegrationGateway = {
  getAdminIntegrationConfigs(params?: AdminIntegrationConfigsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminIntegrationConfig>>('/api/v1/admin/integrations/configs/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          kindIn: params?.kindIn,
          isEnabled: params?.isEnabled,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminIntegrationConfigById(id: string) {
    return instance
      .get<AdminIntegrationConfig>(`/api/v1/admin/integrations/configs/${id}/`)
      .then((response) => response.data);
  },

  checkLocalAgentPrinter(payload: { connectionType?: string; printerName?: string; host?: string; port?: number }) {
    return instance
      .post<Record<string, unknown>>('/api/v1/local-agent/printer/check/', payload)
      .then((response) => response.data);
  },

  checkAdminMartaConnection(endpointUrl?: string) {
    return instance
      .post<{ ok: boolean; endpointUrl?: string }>('/api/v1/admin/integrations/marta/check/', {
        endpointUrl: endpointUrl || '',
      })
      .then((response) => response.data);
  },

  getAdminFiscalDevices(endpointUrl?: string) {
    return instance
      .get<AdminFiscalDevice[]>('/api/v1/admin/integrations/fiscal-devices/', {
        params: { endpointUrl: endpointUrl || undefined },
      })
      .then((response) => response.data);
  },

  createAdminIntegrationConfig(payload: AdminIntegrationConfigPayload) {
    return instance
      .post<AdminIntegrationConfig>('/api/v1/admin/integrations/configs/', payload)
      .then((response) => response.data);
  },

  updateAdminIntegrationConfig(id: string, payload: AdminIntegrationConfigPayload) {
    return instance
      .put<AdminIntegrationConfig>(`/api/v1/admin/integrations/configs/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminIntegrationConfig(id: string) {
    return instance.delete<void>(`/api/v1/admin/integrations/configs/${id}/`).then((response) => response.data);
  },
};
