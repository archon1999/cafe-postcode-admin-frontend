import { Button, Stack, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useAdminScopeStore } from 'modules/auth';
import type { AdminLocalAgent, AdminLocalAgentOutboxAction } from 'shared/api/admin-types';
import { LocalAgentDiagnosticsDialog, type LocalAgentDiagnosticsData } from 'shared/ui/LocalAgentDiagnosticsDialog';

import {
  useLocalAgentFleetDiagnosticsQuery,
  useLocalAgentFleetLogsQuery,
  useLocalAgentOutboxActionMutation,
  useUpdateLocalAgentNowMutation,
} from '../../../application';

import { AgentSupportCommands } from './AgentSupportCommands';

export function LocalAgentFleetDiagnosticsDialog({
  agent,
  onClose,
}: {
  agent: AdminLocalAgent | null;
  onClose: () => void;
}) {
  const { t } = useTranslate('platform');
  const queryClient = useQueryClient();
  const setSelectedRestaurantId = useAdminScopeStore((state) => state.setSelectedRestaurantId);
  const query = useLocalAgentFleetDiagnosticsQuery(agent?.id ?? null);
  const logsSupported = Boolean(agent?.capabilities.includes('remote_logs'));
  const logsQuery = useLocalAgentFleetLogsQuery(agent?.id ?? null, logsSupported);
  const updateMutation = useUpdateLocalAgentNowMutation();
  const outboxActionMutation = useLocalAgentOutboxActionMutation();
  const diagnostics = query.data?.status as LocalAgentDiagnosticsData | undefined;
  const openRestaurantSettings = () => {
    if (!agent) return;
    setSelectedRestaurantId(agent.restaurantId);
    void queryClient.invalidateQueries();
    onClose();
  };

  const requestUpdate = async () => {
    if (!agent) return;
    try {
      await updateMutation.mutateAsync(agent.id);
      toast.success(t('localAgents.messages.updateRequested'));
    } catch {
      toast.error(t('localAgents.messages.updateFailed'));
    }
  };

  const manageOutbox = async (operationId: string, action: AdminLocalAgentOutboxAction, reason: string) => {
    if (!agent) return;
    try {
      await outboxActionMutation.mutateAsync({ id: agent.id, operationId, action, reason });
      toast.success(
        t(action === 'retry' ? 'localAgents.messages.outboxRetryRequested' : 'localAgents.messages.outboxResolved'),
      );
    } catch {
      toast.error(t('localAgents.messages.outboxActionFailed'));
      throw new Error('outbox action failed');
    }
  };

  return (
    <LocalAgentDiagnosticsDialog
      commandsSlot={
        agent ? (
          <Stack spacing={2}>
            <Typography variant="subtitle2">{agent.restaurantName}</Typography>
            <AgentSupportCommands
              key={agent.id}
              agentId={agent.id}
              available={agent.online && agent.capabilities.includes('support_commands_v1')}
            />
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                component={Link}
                to={RoutePath.organizationMyRestaurantIntegrationConfigList}
                onClick={openRestaurantSettings}>
                {t('localAgents.commands.printerSettings')}
              </Button>
              <Button
                component={Link}
                to={RoutePath.organizationMyRestaurantPrintTemplateList}
                onClick={openRestaurantSettings}>
                {t('localAgents.commands.printTemplates')}
              </Button>
            </Stack>
          </Stack>
        ) : undefined
      }
      open={Boolean(agent)}
      onClose={onClose}
      diagnostics={diagnostics}
      diagnosticsLoading={query.isLoading}
      diagnosticsError={query.isError}
      update={query.data?.update}
      canUpdate={Boolean(agent?.online && agent.capabilities.includes('auto_update'))}
      updatePending={updateMutation.isPending}
      onUpdate={() => void requestUpdate()}
      canManageOutbox={Boolean(agent?.online && agent.capabilities.includes('outbox_management'))}
      outboxActionPending={outboxActionMutation.isPending}
      onOutboxAction={manageOutbox}
      logsSupported={logsSupported}
      logs={logsQuery.data}
      logsLoading={logsQuery.isLoading}
      logsError={logsQuery.isError}
      refreshing={query.isFetching || logsQuery.isFetching}
      onRefresh={() => {
        void query.refetch();
        if (logsSupported) void logsQuery.refetch();
      }}
    />
  );
}
