import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AdminLocalAgentBulkAction, AdminLocalAgentOutboxAction } from 'shared/api/admin-types';

import { agentSupportRepository, localAgentFleetRepository } from '../data-access';
import type { SupportRequest } from '../domain';

import { localAgentFleetKeys } from './keys';

export function useExecuteAgentSupportCommand(agentId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: SupportRequest) => agentSupportRepository.execute(agentId, request),
    onSuccess: async (result) => {
      queryClient.setQueryData(localAgentFleetKeys.supportStatus(agentId, result.requestId), result);
      await queryClient.invalidateQueries({ queryKey: localAgentFleetKeys.supportHistory(agentId) });
    },
  });
}

export function useUpdateLocalAgentNowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => localAgentFleetRepository.update(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: localAgentFleetKeys.all });
    },
  });
}

export function useLocalAgentBulkActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, agentIds }: { action: AdminLocalAgentBulkAction; agentIds: string[] }) =>
      localAgentFleetRepository.bulkAction(action, agentIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: localAgentFleetKeys.all });
    },
  });
}

export function useLocalAgentOutboxActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      operationId,
      action,
      reason,
    }: {
      id: string;
      operationId: string;
      action: AdminLocalAgentOutboxAction;
      reason: string;
    }) => localAgentFleetRepository.outboxAction(id, operationId, action, reason),
    onSuccess: async (_result, variables) => {
      await queryClient.invalidateQueries({ queryKey: localAgentFleetKeys.diagnostics(variables.id) });
    },
  });
}
