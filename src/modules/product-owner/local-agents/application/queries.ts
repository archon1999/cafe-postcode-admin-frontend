import { useQuery } from '@tanstack/react-query';

import type { AdminLocalAgentsQueryParams } from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { localAgentFleetKeys } from './keys';

export function useLocalAgentFleetQuery(params: AdminLocalAgentsQueryParams) {
  return useQuery({
    queryKey: localAgentFleetKeys.list(params),
    queryFn: () => apiClient.getAdminLocalAgents(params),
  });
}

export function useLocalAgentFleetDiagnosticsQuery(id: string | null) {
  return useQuery({
    queryKey: localAgentFleetKeys.diagnostics(id ?? ''),
    queryFn: () => apiClient.getAdminLocalAgentDiagnostics(id ?? ''),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useLocalAgentFleetLogsQuery(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: localAgentFleetKeys.logs(id ?? ''),
    queryFn: () => apiClient.getAdminLocalAgentLogs(id ?? ''),
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}
