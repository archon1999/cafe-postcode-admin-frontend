import { useQuery } from '@tanstack/react-query';

import type { AdminLocalAgentsQueryParams } from 'shared/api/admin-types';

import { agentSupportRepository, localAgentFleetRepository } from '../data-access';
import { isSupportCommandPending } from '../domain';

import { localAgentFleetKeys } from './keys';

export function useAgentSupportCatalog() {
  return useQuery({
    queryKey: localAgentFleetKeys.supportCatalog,
    queryFn: () => agentSupportRepository.catalog(),
    staleTime: 60_000,
  });
}

export function useAgentSupportHistory(agentId: string) {
  return useQuery({
    queryKey: localAgentFleetKeys.supportHistory(agentId),
    queryFn: () => agentSupportRepository.history(agentId),
    refetchInterval: 5_000,
  });
}

export function useAgentSupportStatus(agentId: string, requestId: string | null) {
  return useQuery({
    queryKey: localAgentFleetKeys.supportStatus(agentId, requestId ?? ''),
    queryFn: () => agentSupportRepository.status(agentId, requestId ?? ''),
    enabled: Boolean(requestId),
    retry: false,
    refetchInterval: (query) => (!query.state.data || isSupportCommandPending(query.state.data.status) ? 2_000 : false),
  });
}

export function useLocalAgentFleetQuery(params: AdminLocalAgentsQueryParams) {
  return useQuery({
    queryKey: localAgentFleetKeys.list(params),
    queryFn: () => localAgentFleetRepository.list(params),
  });
}

export function useLocalAgentFleetDiagnosticsQuery(id: string | null) {
  return useQuery({
    queryKey: localAgentFleetKeys.diagnostics(id ?? ''),
    queryFn: () => localAgentFleetRepository.diagnostics(id ?? ''),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useLocalAgentFleetLogsQuery(id: string | null, enabled: boolean) {
  return useQuery({
    queryKey: localAgentFleetKeys.logs(id ?? ''),
    queryFn: () => localAgentFleetRepository.logs(id ?? ''),
    enabled: Boolean(id) && enabled,
    retry: false,
  });
}
