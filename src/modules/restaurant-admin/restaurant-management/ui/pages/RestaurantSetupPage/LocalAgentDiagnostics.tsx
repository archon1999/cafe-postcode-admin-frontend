import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { toast } from 'sonner';

import { useTranslate } from 'app/providers/locales';
import { Iconify } from 'shared/ui/Iconify';

import {
  useLocalAgentDiagnosticsQuery,
  useLocalAgentStatusQuery,
  useRequestLocalAgentUpdateMutation,
} from '../../../application';
import type { LocalAgentHealthComponent, LocalAgentUpdateStatus } from '../../../domain';

type ChipColor = 'default' | 'success' | 'warning' | 'error' | 'secondary';

function StatusRow({ label, value, color = 'default' }: { label: string; value: string; color?: ChipColor }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ minHeight: 32 }}>
      <Typography variant="body2" sx={{ fontWeight: 650 }}>
        {label}
      </Typography>
      <Chip size="small" label={value} color={color} sx={{ fontWeight: 700 }} />
    </Stack>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 700, textAlign: 'right', overflowWrap: 'anywhere' }}>
        {value}
      </Typography>
    </Stack>
  );
}

function formatDate(value: string | null | undefined, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'medium' }).format(date);
}

function componentStatus(
  component: LocalAgentHealthComponent | undefined,
  labels: { online: string; offline: string; notConfigured: string; unknown: string },
) {
  if (!component) return { label: labels.unknown, color: 'default' as ChipColor };
  if (!component.configured) return { label: labels.notConfigured, color: 'default' as ChipColor };
  return component.online
    ? { label: labels.online, color: 'success' as ChipColor }
    : { label: labels.offline, color: 'warning' as ChipColor };
}

function updatePresentation(status: LocalAgentUpdateStatus | undefined, t: ReturnType<typeof useTranslate>['t']) {
  const labels: Record<LocalAgentUpdateStatus, { label: string; color: ChipColor }> = {
    up_to_date: { label: t('setup.agentMonitoring.update.upToDate'), color: 'success' },
    pending: { label: t('setup.agentMonitoring.update.pending'), color: 'warning' },
    disabled: { label: t('setup.agentMonitoring.update.disabled'), color: 'default' },
    unavailable: { label: t('setup.agentMonitoring.update.unavailable'), color: 'error' },
  };
  return status ? labels[status] : { label: t('setup.agentMonitoring.unknown'), color: 'default' as ChipColor };
}

export function LocalAgentDiagnostics() {
  const { t } = useTranslate('organizations');
  const [open, setOpen] = useState(false);
  const statusQuery = useLocalAgentStatusQuery();
  const diagnosticsQuery = useLocalAgentDiagnosticsQuery(open);
  const updateMutation = useRequestLocalAgentUpdateMutation();
  const monitoring = statusQuery.data;
  const agent = monitoring?.agent;
  const update = monitoring?.update;
  const diagnostics = diagnosticsQuery.data;
  const updateState = updatePresentation(update?.status, t);
  const labels = {
    online: t('setup.agentMonitoring.online'),
    offline: t('setup.agentMonitoring.offline'),
    notConfigured: t('setup.agentMonitoring.notConfigured'),
    unknown: t('setup.agentMonitoring.unknown'),
  };
  const fiscal = componentStatus(diagnostics?.fiscal, labels);
  const marta = componentStatus(diagnostics?.marta, labels);
  const printer = componentStatus(diagnostics?.printer, labels);

  const requestUpdate = async () => {
    try {
      await updateMutation.mutateAsync();
      toast.success(t('setup.agentMonitoring.messages.updateRequested'));
    } catch {
      toast.error(t('setup.agentMonitoring.messages.updateFailed'));
    }
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('setup.agentMonitoring.title')}</DialogTitle>
        <DialogContent dividers>
          {diagnosticsQuery.isLoading ? (
            <Stack alignItems="center" sx={{ py: 5 }}>
              <CircularProgress />
            </Stack>
          ) : diagnosticsQuery.isError || !diagnostics ? (
            <Alert severity="error">{t('setup.agentMonitoring.messages.diagnosticsFailed')}</Alert>
          ) : (
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <StatusRow
                  label={t('setup.agentMonitoring.agent')}
                  value={diagnostics.agent.online ? labels.online : labels.offline}
                  color={diagnostics.agent.online ? 'success' : 'error'}
                />
                <StatusRow
                  label={t('setup.agentMonitoring.server')}
                  value={diagnostics.backend.online ? labels.online : t('setup.agentMonitoring.offlineMode')}
                  color={diagnostics.backend.online ? 'success' : 'secondary'}
                />
                <StatusRow label={t('setup.agentMonitoring.fiscal')} value={fiscal.label} color={fiscal.color} />
                {diagnostics.marta.configured ? (
                  <StatusRow label={t('setup.agentMonitoring.marta')} value={marta.label} color={marta.color} />
                ) : null}
                {diagnostics.printer.configured ? (
                  <StatusRow label={t('setup.agentMonitoring.printer')} value={printer.label} color={printer.color} />
                ) : null}
                <StatusRow
                  label={t('setup.agentMonitoring.update.label')}
                  value={updateState.label}
                  color={updateState.color}
                />
              </Stack>

              <Divider />

              <Stack spacing={0.8}>
                <Detail
                  label={t('setup.agentMonitoring.version')}
                  value={diagnostics.agent.version || labels.unknown}
                />
                <Detail
                  label={t('setup.agentMonitoring.latestVersion')}
                  value={update?.latestVersion || t('setup.agentMonitoring.noData')}
                />
                <Detail
                  label={t('setup.agentMonitoring.lastSuccess')}
                  value={formatDate(diagnostics.sync.lastSuccessAt, t('setup.agentMonitoring.noData'))}
                />
                <Detail
                  label={t('setup.agentMonitoring.lastAttempt')}
                  value={formatDate(diagnostics.sync.lastAttemptAt, t('setup.agentMonitoring.noData'))}
                />
                <Detail
                  label={t('setup.agentMonitoring.pending')}
                  value={String(diagnostics.sync.pendingOutbox ?? 0)}
                />
                <Detail label={t('setup.agentMonitoring.failed')} value={String(diagnostics.sync.failedOutbox ?? 0)} />
              </Stack>

              {[
                diagnostics.backend.detail,
                diagnostics.fiscal.detail,
                diagnostics.marta.detail,
                diagnostics.printer.detail,
              ]
                .filter(Boolean)
                .map((detail) => (
                  <Alert key={detail} severity="warning" sx={{ overflowWrap: 'anywhere' }}>
                    {detail}
                  </Alert>
                ))}

              {diagnostics.alerts?.map((alert) => (
                <Alert key={alert.code} severity={alert.severity === 'error' ? 'error' : 'warning'}>
                  {alert.message}
                </Alert>
              ))}

              {diagnostics.sync.failedOperations?.map((failure) => (
                <Box key={failure.operationId} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: 'error.lighter' }}>
                  <Typography variant="caption" sx={{ fontWeight: 800 }}>
                    {failure.path} {failure.responseStatus ? `· HTTP ${failure.responseStatus}` : ''}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.4, overflowWrap: 'anywhere' }}>
                    {failure.lastError}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {update?.status === 'pending' ? (
            <Button
              color="success"
              disabled={!agent?.online || updateMutation.isPending || !agent.capabilities.includes('auto_update')}
              onClick={() => void requestUpdate()}>
              {t('setup.agentMonitoring.actions.updateNow')}
            </Button>
          ) : null}
          <Box sx={{ flex: 1 }} />
          <Button onClick={() => void diagnosticsQuery.refetch()} disabled={diagnosticsQuery.isFetching}>
            {t('setup.agentMonitoring.actions.refresh')}
          </Button>
          <Button variant="contained" onClick={() => setOpen(false)}>
            {t('setup.agentMonitoring.actions.close')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
