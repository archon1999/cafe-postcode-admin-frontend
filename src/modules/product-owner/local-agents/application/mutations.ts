import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { AdminLocalAgentBulkAction } from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { localAgentFleetKeys } from './keys';

export function useUpdateLocalAgentNowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.updateAdminLocalAgentNow(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: localAgentFleetKeys.all });
    },
  });
}

export function useLocalAgentBulkActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ action, agentIds }: { action: AdminLocalAgentBulkAction; agentIds: string[] }) =>
      apiClient.runAdminLocalAgentBulkAction(action, agentIds),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: localAgentFleetKeys.all });
    },
  });
}
