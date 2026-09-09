import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { Label } from 'shared/ui/Label';
import { formatDateTime } from 'shared/utils/format-time';

import type { BranchHealthAssessment, MonitoringBranch, MonitoringInventoryItem } from '../../../../domain';

const DEVICE_TYPES: Record<string, string> = { localAgent: 'LOCAL_AGENT', pos: 'POS_TERMINAL', tv: 'TV_MONITOR' };

export function MonitoringDetailsDialog({
  selection,
  inventory,
  onClose,
}: {
  selection: { type: string; row?: MonitoringBranch & { health: BranchHealthAssessment } } | null;
  inventory: MonitoringInventoryItem[];
  onClose: () => void;
}) {
  const { t } = useTranslate('security-center');
  const [search, setSearch] = useState('');
  const close = () => {
    setSearch('');
    onClose();
  };
  const row = selection?.row;
  const type = selection?.type ?? '';
  const entries = inventory.filter(
    (item) =>
      (row
        ? item.restaurantId === row.restaurantId && item.type !== 'pairing'
        : item.type === (DEVICE_TYPES[type] ?? type)) &&
      `${item.restaurantName} ${item.name}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const title =
    row?.restaurantName ?? t(type === 'pairing' ? 'monitoring.pendingPairingsLabel' : `monitoring.devices.${type}`);

  return (
    <Dialog open={Boolean(selection)} onClose={close} fullWidth maxWidth="sm">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {type === 'health' && row ? (
          <Stack spacing={2}>
            <Label
              sx={{ alignSelf: 'flex-start' }}
              color={
                row.health.status === 'unknown'
                  ? 'info'
                  : row.health.status === 'critical'
                    ? 'error'
                    : row.health.status === 'attention'
                      ? 'warning'
                      : 'success'
              }>
              {t(`monitoring.health.${row.health.status}`)}
            </Label>
            {row.health.reasons.map((reason) => (
              <Typography key={reason}>{t(`monitoring.technicalReasons.${reason}`)}</Typography>
            ))}
            {row.operationalHealth?.checkedAt && (
              <Typography variant="body2" color="text.secondary">
                {formatDateTime(row.operationalHealth.checkedAt)}
              </Typography>
            )}
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              size="small"
              label={t('common.search')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ mt: 1 }}
            />
            {entries.length ? (
              entries.map((item) => (
                <Stack key={item.id} spacing={0.5} sx={{ borderBottom: 1, borderColor: 'divider', pb: 1.5 }}>
                  <Typography variant="subtitle2">{item.name}</Typography>
                  <Typography variant="body2">{item.restaurantName}</Typography>
                  {item.version && <Typography variant="caption">{item.version}</Typography>}
                  {item.lastSeenAt && (
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(item.lastSeenAt)}
                    </Typography>
                  )}
                </Stack>
              ))
            ) : (
              <Typography color="text.secondary">{t('monitoring.empty.noResults')}</Typography>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>{t('common.close')}</Button>
      </DialogActions>
    </Dialog>
  );
}
