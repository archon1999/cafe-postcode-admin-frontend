import { isAxiosError } from 'axios';

import { apiClient } from 'shared/api/http/apiClient';
import { instance } from 'shared/api/http/axiosInstance';

import type { AgentSupportRepository, SupportCommand, SupportRecord } from '../domain';
import { SupportCommandRejected } from '../domain';

export const agentSupportRepository: AgentSupportRepository = {
  catalog: () =>
    instance
      .get<{ commands: SupportCommand[] }>('/api/v1/admin/local-agents/commands/catalog/')
      .then((response) => response.data),
  history: (agentId) =>
    instance
      .get<{ commands: SupportRecord[] }>(`/api/v1/admin/local-agents/${agentId}/commands/`)
      .then((response) => response.data),
  status: (agentId, requestId) =>
    instance
      .get<SupportRecord>(`/api/v1/admin/local-agents/${agentId}/commands/${requestId}/`)
      .then((response) => response.data),
  execute: (agentId, request) =>
    instance
      .post<SupportRecord>(`/api/v1/admin/local-agents/${agentId}/commands/`, request)
      .then((response) => response.data)
      .catch((error: unknown) => {
        if (
          isAxiosError(error) &&
          ([400, 401, 403, 404].includes(error.response?.status ?? 0) ||
            (error.response?.status === 409 && error.response.data?.code === 'AGENT_COMMANDS_UNAVAILABLE'))
        )
          throw new SupportCommandRejected('Command was rejected before delivery.');
        throw error;
      }),
};

export const localAgentFleetRepository = {
  list: apiClient.getAdminLocalAgents,
  diagnostics: apiClient.getAdminLocalAgentDiagnostics,
  logs: apiClient.getAdminLocalAgentLogs,
  update: apiClient.updateAdminLocalAgentNow,
  bulkAction: apiClient.runAdminLocalAgentBulkAction,
  outboxAction: apiClient.manageAdminLocalAgentOutbox,
};
