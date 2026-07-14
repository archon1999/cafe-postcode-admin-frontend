import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';
import { LocalAgentDiagnosticsDialog } from 'shared/ui/LocalAgentDiagnosticsDialog';

import {
  useLocalAgentDiagnosticsQuery,
  useLocalAgentLogsQuery,
  useLocalAgentStatusQuery,
  useRequestLocalAgentUpdateMutation,
} from '../../../application';

export function LocalAgentDiagnostics() {
  const { t } = useTranslate('organizations');
  const [open, setOpen] = useState(false);
  const statusQuery = useLocalAgentStatusQuery();
  const agent = statusQuery.data?.agent;
  const logsSupported = Boolean(agent?.capabilities.includes('remote_logs'));
  const diagnosticsQuery = useLocalAgentDiagnosticsQuery(open);
  const logsQuery = useLocalAgentLogsQuery(open && logsSupported);
  const updateMutation = useRequestLocalAgentUpdateMutation();

  const requestUpdate = async () => {
    try {
      await updateMutation.mutateAsync();
      toast.success(t('setup.agentMonitoring.messages.updateRequested'));
    } catch {
      toast.error(t('setup.agentMonitoring.messages.updateFailed'));
    }
  };

  const refresh = () => {
    void statusQuery.refetch();
    void diagnosticsQuery.refetch();
    if (logsSupported) void logsQuery.refetch();
  };

  return (
    <>
      <Tooltip title={t('setup.agentMonitoring.actions.openDiagnostics')}>
        <IconButton
          size="small"
          color="primary"
          aria-label={t('setup.agentMonitoring.actions.openDiagnostics')}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setOpen(true);
          }}>
          <Iconify icon="solar:info-circle-bold-duotone" width={20} />
        </IconButton>
      </Tooltip>

      <LocalAgentDiagnosticsDialog
        open={open}
        onClose={() => setOpen(false)}
        diagnostics={diagnosticsQuery.data}
        diagnosticsLoading={diagnosticsQuery.isLoading}
        diagnosticsError={diagnosticsQuery.isError}
        update={statusQuery.data?.update}
        canUpdate={Boolean(agent?.online && agent.capabilities.includes('auto_update'))}
        updatePending={updateMutation.isPending}
        onUpdate={() => void requestUpdate()}
        logsSupported={logsSupported}
        logs={logsQuery.data}
        logsLoading={logsQuery.isLoading}
        logsError={logsQuery.isError}
        refreshing={statusQuery.isFetching || diagnosticsQuery.isFetching || logsQuery.isFetching}
        onRefresh={refresh}
      />
    </>
  );
}
