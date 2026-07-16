import type {
  AdminLocalAgent,
  AdminLocalAgentBulkAction,
  AdminLocalAgentBulkActionResult,
  AdminLocalAgentDiagnostics,
  AdminLocalAgentLogs,
  AdminLocalAgentsQueryParams,
  AdminLocalAgentUpdateResult,
  AdminPaginatedResponse,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminLocalAgentGateway = {
  getAdminLocalAgents(params: AdminLocalAgentsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<AdminLocalAgent>>('/api/v1/admin/local-agents/', {
        params: {
          page: params.page,
          pageSize: params.pageSize,
          search: params.search,
          status: params.status,
          ordering: params.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminLocalAgentDiagnostics(id: string) {
    return instance
      .get<AdminLocalAgentDiagnostics>(`/api/v1/admin/local-agents/${id}/diagnostics/`)
      .then((response) => response.data);
  },

  updateAdminLocalAgentNow(id: string) {
    return instance
      .post<AdminLocalAgentUpdateResult>(`/api/v1/admin/local-agents/${id}/update-now/`)
      .then((response) => response.data);
  },

  getAdminLocalAgentLogs(id: string) {
    return instance
      .get<AdminLocalAgentLogs>(`/api/v1/admin/local-agents/${id}/logs/`)
      .then((response) => response.data);
  },

  runAdminLocalAgentBulkAction(action: AdminLocalAgentBulkAction, agentIds: string[]) {
    return instance
      .post<AdminLocalAgentBulkActionResult>('/api/v1/admin/local-agents/bulk-action/', { action, agentIds })
      .then((response) => response.data);
  },
};
