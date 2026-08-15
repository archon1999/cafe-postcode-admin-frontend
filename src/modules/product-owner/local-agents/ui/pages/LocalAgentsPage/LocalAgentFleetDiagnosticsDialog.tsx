import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import type { AdminLocalAgent, AdminLocalAgentOutboxAction } from 'shared/api/admin-types';
import { LocalAgentDiagnosticsDialog, type LocalAgentDiagnosticsData } from 'shared/ui/LocalAgentDiagnosticsDialog';

import {
  useLocalAgentFleetDiagnosticsQuery,
  useLocalAgentFleetLogsQuery,
  useLocalAgentOutboxActionMutation,
  useUpdateLocalAgentNowMutation,
} from '../../../application';

export function LocalAgentFleetDiagnosticsDialog({
  agent,
  onClose,
}: {
  agent: AdminLocalAgent | null;
  onClose: () => void;
}) {
  const { t } = useTranslate('platform');
  const query = useLocalAgentFleetDiagnosticsQuery(agent?.id ?? null);
  const logsSupported = Boolean(agent?.capabilities.includes('remote_logs'));
  const logsQuery = useLocalAgentFleetLogsQuery(agent?.id ?? null, logsSupported);
  const updateMutation = useUpdateLocalAgentNowMutation();
  const outboxActionMutation = useLocalAgentOutboxActionMutation();
  const diagnostics = query.data?.status as LocalAgentDiagnosticsData | undefined;

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
