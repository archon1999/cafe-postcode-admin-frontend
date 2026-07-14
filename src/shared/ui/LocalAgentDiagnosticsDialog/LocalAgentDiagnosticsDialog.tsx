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
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';

type ChipColor = 'default' | 'success' | 'warning' | 'error' | 'secondary';

export type LocalAgentDiagnosticsHealth = {
  configured?: boolean;
  online?: boolean;
  detail?: string;
};

export type LocalAgentDiagnosticsData = {
  agent: { online: boolean; version?: string };
  backend: { online: boolean; offlineMode?: boolean; detail?: string };
  sync: {
    lastSuccessAt?: string;
    lastAttemptAt?: string;
    pendingOutbox?: number;
    failedOutbox?: number;
    failedOperations?: Array<{
      operationId: string;
      path: string;
      lastError: string;
      responseStatus?: number;
    }>;
  };
  fiscal: LocalAgentDiagnosticsHealth;
  marta: LocalAgentDiagnosticsHealth;
  printer: LocalAgentDiagnosticsHealth;
  alerts?: Array<{ code: string; severity: string; message: string }>;
};

export type LocalAgentDiagnosticsUpdate = {
  status: 'up_to_date' | 'pending' | 'disabled' | 'unavailable';
  latestVersion?: string;
};

export type LocalAgentDiagnosticsLogs = {
  lines: string[];
};

type LocalAgentDiagnosticsDialogProps = {
  open: boolean;
  onClose: () => void;
  diagnostics?: LocalAgentDiagnosticsData;
  diagnosticsLoading?: boolean;
  diagnosticsError?: boolean;
  update?: LocalAgentDiagnosticsUpdate | null;
  canUpdate?: boolean;
  updatePending?: boolean;
  onUpdate?: () => void;
  logsSupported?: boolean;
  logs?: LocalAgentDiagnosticsLogs;
  logsLoading?: boolean;
  logsError?: boolean;
  refreshing?: boolean;
  onRefresh: () => void;
};

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

function formatDate(value: string | undefined, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'medium' }).format(date);
}

function componentStatus(
  component: LocalAgentDiagnosticsHealth | undefined,
  labels: { online: string; offline: string; notConfigured: string; unknown: string },
) {
  if (!component) return { label: labels.unknown, color: 'default' as ChipColor };
  if (component.configured === false) return { label: labels.notConfigured, color: 'default' as ChipColor };
  return component.online
    ? { label: labels.online, color: 'success' as ChipColor }
    : { label: labels.offline, color: 'warning' as ChipColor };
}

export function LocalAgentDiagnosticsDialog({
  open,
  onClose,
  diagnostics,
  diagnosticsLoading = false,
  diagnosticsError = false,
  update,
  canUpdate = false,
  updatePending = false,
  onUpdate,
  logsSupported = false,
  logs,
  logsLoading = false,
  logsError = false,
  refreshing = false,
  onRefresh,
}: LocalAgentDiagnosticsDialogProps) {
  const { t } = useTranslate('organizations');
  const labels = {
    online: t('setup.agentMonitoring.online'),
    offline: t('setup.agentMonitoring.offline'),
    notConfigured: t('setup.agentMonitoring.notConfigured'),
    unknown: t('setup.agentMonitoring.unknown'),
  };
  const updateStates: Record<NonNullable<LocalAgentDiagnosticsUpdate>['status'], { label: string; color: ChipColor }> =
    {
      up_to_date: { label: t('setup.agentMonitoring.update.upToDate'), color: 'success' },
      pending: { label: t('setup.agentMonitoring.update.pending'), color: 'warning' },
      disabled: { label: t('setup.agentMonitoring.update.disabled'), color: 'default' },
      unavailable: { label: t('setup.agentMonitoring.update.unavailable'), color: 'error' },
    };
  const updateState = update
    ? updateStates[update.status]
    : { label: t('setup.agentMonitoring.unknown'), color: 'default' as ChipColor };
  const fiscal = componentStatus(diagnostics?.fiscal, labels);
  const marta = componentStatus(diagnostics?.marta, labels);
  const printer = componentStatus(diagnostics?.printer, labels);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{t('setup.agentMonitoring.title')}</DialogTitle>
      <DialogContent dividers>
        {diagnosticsLoading ? (
          <Stack alignItems="center" sx={{ py: 5 }}>
            <CircularProgress />
          </Stack>
        ) : diagnosticsError || !diagnostics ? (
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
              {diagnostics.marta.configured === false ? null : (
                <StatusRow label={t('setup.agentMonitoring.marta')} value={marta.label} color={marta.color} />
              )}
              {diagnostics.printer.configured === false ? null : (
                <StatusRow label={t('setup.agentMonitoring.printer')} value={printer.label} color={printer.color} />
              )}
              <StatusRow
                label={t('setup.agentMonitoring.update.label')}
                value={updateState.label}
                color={updateState.color}
              />
            </Stack>

            <Divider />

            <Stack spacing={0.8}>
              <Detail label={t('setup.agentMonitoring.version')} value={diagnostics.agent.version || labels.unknown} />
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
              <Detail label={t('setup.agentMonitoring.pending')} value={String(diagnostics.sync.pendingOutbox ?? 0)} />
              <Detail label={t('setup.agentMonitoring.failed')} value={String(diagnostics.sync.failedOutbox ?? 0)} />
            </Stack>

            {[
              diagnostics.backend.detail,
              diagnostics.fiscal.detail,
              diagnostics.marta.detail,
              diagnostics.printer.detail,
            ]
              .filter((detail): detail is string => Boolean(detail))
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

            <Divider />

            <Stack spacing={1}>
              <Typography variant="subtitle2">{t('setup.agentMonitoring.logs.title')}</Typography>
              {!logsSupported ? (
                <Alert severity="info">{t('setup.agentMonitoring.logs.unsupported')}</Alert>
              ) : logsLoading ? (
                <Stack alignItems="center" sx={{ py: 2 }}>
                  <CircularProgress size={24} />
                </Stack>
              ) : logsError ? (
                <Alert severity="warning">{t('setup.agentMonitoring.logs.failed')}</Alert>
              ) : logs?.lines.length ? (
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 1.5,
                    maxHeight: 280,
                    overflow: 'auto',
                    borderRadius: 1.5,
                    bgcolor: 'grey.900',
                    color: 'common.white',
                    fontSize: 12,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere',
                  }}>
                  {logs.lines.join('\n')}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('setup.agentMonitoring.logs.empty')}
                </Typography>
              )}
            </Stack>
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        {update?.status === 'pending' && onUpdate ? (
          <Button color="success" disabled={!canUpdate || updatePending} onClick={onUpdate}>
            {t('setup.agentMonitoring.actions.updateNow')}
          </Button>
        ) : null}
        <Box sx={{ flex: 1 }} />
        <Button onClick={onRefresh} disabled={refreshing}>
          {t('setup.agentMonitoring.actions.refresh')}
        </Button>
        <Button variant="contained" onClick={onClose}>
          {t('setup.agentMonitoring.actions.close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
