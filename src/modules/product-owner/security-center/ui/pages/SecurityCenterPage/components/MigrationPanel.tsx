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
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { formatDateTime } from 'shared/utils/format-time';

import { useDeviceMigrationSummaryQuery } from '../../../../application';
import {
  evaluateBranchRolloutReadiness,
  type BranchRolloutReadiness,
  type BranchRolloutStage,
  type DeviceMigrationBranch,
  type RolloutReadinessGate,
} from '../../../../domain';

type MigrationRow = {
  branch: DeviceMigrationBranch;
  readiness: BranchRolloutReadiness;
};

const stageColor: Record<BranchRolloutStage, 'error' | 'info' | 'warning' | 'success'> = {
  fixPrerequisites: 'error',
  readyForPOSUpdate: 'info',
  migrationInProgress: 'warning',
  readyForBridgeOff: 'success',
};

function GateDetails({ title, gate }: { title: string; gate: RolloutReadinessGate }) {
  const { t } = useTranslate('security-center');

  return (
    <Stack spacing={1}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography variant="subtitle2">{title}</Typography>
        <Chip
          size="small"
          variant="soft"
          color={gate.ready ? 'success' : 'warning'}
          label={t(gate.ready ? 'readiness.statuses.ready' : 'readiness.statuses.notReady')}
        />
      </Stack>
      {gate.reasons.length ? (
        <Stack component="ul" spacing={0.75} sx={{ pl: 2.5, my: 0 }}>
          {gate.reasons.map((reason) => (
            <Typography component="li" variant="body2" color="text.secondary" key={reason.code}>
              {t(`readiness.reasons.${reason.code}`, {
                count: reason.count,
                failure: reason.detail,
              })}
            </Typography>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('migration.noBlockers')}
        </Typography>
      )}
    </Stack>
  );
}

export function MigrationPanel() {
  const { t } = useTranslate('security-center');
  const query = useDeviceMigrationSummaryQuery();
  const [selected, setSelected] = useState<MigrationRow | null>(null);
  const [page, setPage] = useState(0);
  const snapshotAt = query.dataUpdatedAt || Date.now();
  const rows = useMemo<MigrationRow[]>(
    () =>
      (query.data?.branches ?? [])
        .map((branch) => ({ branch, readiness: evaluateBranchRolloutReadiness(branch, snapshotAt) }))
        .sort((a, b) => {
          if (a.readiness.fullyMigrated !== b.readiness.fullyMigrated) return a.readiness.fullyMigrated ? 1 : -1;
          return a.branch.restaurantName.localeCompare(b.branch.restaurantName);
        }),
    [query.data?.branches, snapshotAt],
  );
  const fullyMigrated = rows.filter((row) => row.readiness.fullyMigrated).length;
  const readyForUpdate = rows.filter((row) => !row.readiness.fullyMigrated && row.readiness.posUpdate.ready).length;
  const visibleRows = rows.slice(page * 10, page * 10 + 10);

  if (query.isLoading) {
    return (
      <Stack role="status" aria-label={t('readiness.loading')} alignItems="center" spacing={1.5} sx={{ py: 8 }}>
        <CircularProgress size={32} />
        <Typography color="text.secondary">{t('readiness.loading')}</Typography>
      </Stack>
    );
  }

  if (query.isError || !query.data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => void query.refetch()}>
            {t('readiness.retry')}
          </Button>
        }>
        {t('readiness.loadErrorDescription')}
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography variant="h6">{t('readiness.title')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {t('readiness.description')}
          </Typography>
        </Box>
        <Button variant="outlined" size="small" onClick={() => void query.refetch()} disabled={query.isFetching}>
          {t('migration.refresh')}
        </Button>
      </Stack>

      {query.isError && <Alert severity="warning">{t('readiness.refreshError')}</Alert>}

      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        <Chip
          variant="soft"
          color="success"
          label={t('readiness.fullyMigratedCount', { count: fullyMigrated, total: rows.length })}
        />
        <Chip variant="soft" color="info" label={t('migration.readyForUpdate', { count: readyForUpdate })} />
        <Chip
          variant="soft"
          color="warning"
          label={t('migration.requiresAction', { count: rows.length - fullyMigrated })}
        />
      </Stack>

      {!rows.length ? (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
          {t('readiness.empty')}
        </Typography>
      ) : (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5, overflow: 'hidden' }}>
          <TableContainer>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>{t('migration.table.branch')}</TableCell>
                  <TableCell>{t('migration.table.agent')}</TableCell>
                  <TableCell align="center">{t('migration.table.pos')}</TableCell>
                  <TableCell align="center">{t('migration.table.unbound')}</TableCell>
                  <TableCell>{t('migration.table.stage')}</TableCell>
                  <TableCell align="right">{t('migration.table.action')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.map((row) => {
                  const { branch, readiness } = row;
                  const agentState = !branch.agent
                    ? 'missing'
                    : branch.agent.online
                      ? branch.agent.deviceMigrated
                        ? 'online'
                        : 'migrationRequired'
                      : 'offline';
                  return (
                    <TableRow key={branch.restaurantId} hover>
                      <TableCell>
                        <Typography variant="subtitle2">{branch.restaurantName}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{t(`readiness.agentStates.${agentState}`)}</Typography>
                        {branch.agent?.lastSeenAt && (
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(branch.agent.lastSeenAt)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">{branch.activePOSDevices}</TableCell>
                      <TableCell align="center">{branch.unboundPOSSessions}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="soft"
                          color={stageColor[readiness.stage]}
                          label={t(`readiness.stages.${readiness.stage}`)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" onClick={() => setSelected(row)}>
                          {t('migration.details')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={rows.length}
            page={page}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
            onPageChange={(_event, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={() => undefined}
            labelRowsPerPage=""
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} / ${count}`}
            sx={{ borderTop: 1, borderColor: 'divider' }}
          />
        </Box>
      )}

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} fullWidth maxWidth="sm">
        <DialogTitle>{t('migration.detailsTitle', { branch: selected?.branch.restaurantName })}</DialogTitle>
        <DialogContent>
          {selected && (
            <Stack spacing={2.5} sx={{ pt: 0.5 }}>
              <Alert severity={selected.readiness.fullyMigrated ? 'success' : 'info'}>
                {t(`readiness.nextActions.${selected.readiness.stage}`)}
              </Alert>
              <GateDetails title={t('readiness.gates.posUpdate')} gate={selected.readiness.posUpdate} />
              <Divider />
              <GateDetails title={t('readiness.gates.finalization')} gate={selected.readiness.finalization} />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelected(null)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
