import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonBase from '@mui/material/ButtonBase';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import Tab from '@mui/material/Tab';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useMemo, useRef, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import { Chart, useChart } from 'shared/ui/Chart';
import { DetailPageLink } from 'shared/ui/DetailPageLink/DetailPageLink';
import { Iconify, type IconifyName } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { RouterLink } from 'shared/ui/RouterLink';
import { Scrollbar } from 'shared/ui/Scrollbar';
import { formatDateTime } from 'shared/utils/format-time';

import { useMonitoringOverviewQuery } from '../../../../application';
import {
  assessBranchHealth,
  type BranchHealthAssessment,
  type BranchHealthStatus,
  type MonitoringAgentVersion,
  type MonitoringBranch,
  type MonitoringDeviceTypeCounts,
  type MonitoringSecurityActivity,
} from '../../../../domain';

import { MonitoringDetailsDialog } from './MonitoringDetailsDialog';

type HealthStatus = BranchHealthStatus;
type MonitoringRow = MonitoringBranch & { id: string; health: BranchHealthAssessment };

const HEALTH_PRIORITY: Record<HealthStatus, number> = { healthy: 0, attention: 1, critical: 2, unknown: 3 };
const HEALTH_COLORS = { healthy: 'success', attention: 'warning', critical: 'error', unknown: 'info' } as const;
const HEALTH_ICONS: Record<HealthStatus, IconifyName> = {
  unknown: 'solar:info-circle-bold',
  healthy: 'solar:shield-check-bold',
  attention: 'solar:danger-triangle-bold',
  critical: 'solar:danger-bold',
};
const STALE_AFTER_MS = 2 * 60 * 1000;
const DEFAULT_ROWS_PER_PAGE = 10;
const BRANCH_ROW_HEIGHT = 80;

function safeDateTime(value: string | null | undefined) {
  return value ? formatDateTime(value) : '—';
}

function activityDateLabel(value: string) {
  const [year, month, day] = value.split('-');
  return year && month && day ? `${day}.${month}` : value;
}

function HealthLabel({ status, filled = false }: { status: HealthStatus; filled?: boolean }) {
  const { t } = useTranslate('security-center');

  return (
    <Label
      variant={filled ? 'filled' : 'soft'}
      color={HEALTH_COLORS[status]}
      startIcon={<Iconify icon={HEALTH_ICONS[status]} width={15} />}>
      {t(`monitoring.health.${status}`)}
    </Label>
  );
}

function AgentLabel({ row, showVersion = true }: { row: MonitoringRow; showVersion?: boolean }) {
  const { t } = useTranslate('security-center');
  const state = !row.agent ? 'missing' : row.agent.online ? 'online' : 'offline';
  const color = state === 'online' ? 'success' : 'warning';

  return (
    <Label color={color} sx={{ width: 'fit-content', maxWidth: 1, whiteSpace: 'nowrap' }}>
      {`${t(`monitoring.agent.${state}`)}${showVersion && row.agent?.version ? ` · ${row.agent.version}` : ''}`}
    </Label>
  );
}

function SummaryCard({
  title,
  value,
  helper,
  icon,
  color,
}: {
  title: string;
  value: number | string;
  helper: React.ReactNode;
  icon: IconifyName;
  color: 'primary' | 'success' | 'info' | 'error';
}) {
  return (
    <Card
      sx={{
        p: { xs: 2, sm: 3 },
        minHeight: { xs: 136, sm: 156 },
        height: 1,
        display: 'flex',
        position: 'relative',
        alignItems: 'center',
      }}>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="h3" sx={{ mt: 1.5, mb: 0.75, fontVariantNumeric: 'tabular-nums' }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
          {helper}
        </Typography>
      </Box>

      <Avatar
        variant="rounded"
        sx={(theme) => ({
          width: { xs: 40, sm: 56 },
          height: { xs: 40, sm: 56 },
          display: 'flex',
          ml: { xs: 1, sm: 2 },
          position: { xs: 'absolute', sm: 'static' },
          right: { xs: 16, sm: 'auto' },
          bottom: { xs: 16, sm: 'auto' },
          color: `${color}.main`,
          bgcolor: alpha(theme.palette[color].main, 0.12),
        })}>
        <Iconify icon={icon} width={24} />
      </Avatar>
    </Card>
  );
}

function SecurityActivityChart({
  activity,
  onDateSelect,
}: {
  activity: MonitoringSecurityActivity[];
  onDateSelect?: (date: string) => void;
}) {
  const { t } = useTranslate('security-center');
  const theme = useTheme();
  const chartOptions = useChart({
    colors: [theme.vars.palette.info.main, theme.vars.palette.warning.main, theme.vars.palette.error.main],
    chart: {
      stacked: true,
      events: {
        dataPointSelection: (_event, _chartContext, config) => {
          const selectedDate = activity[config.dataPointIndex]?.date;
          if (selectedDate) onDateSelect?.(selectedDate);
        },
      },
    },
    legend: { show: true },
    stroke: { show: false },
    plotOptions: {
      bar: {
        columnWidth: '34%',
        borderRadius: 4,
      },
    },
    xaxis: { categories: activity.map((item) => activityDateLabel(item.date)) },
    yaxis: {
      min: 0,
      forceNiceScale: true,
      labels: { formatter: (value: number) => `${Math.round(value)}` },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (value: number) => `${value}` },
    },
  });
  const series = [
    { name: t('monitoring.security.medium'), data: activity.map((item) => item.medium) },
    { name: t('monitoring.security.high'), data: activity.map((item) => item.high) },
    { name: t('monitoring.security.critical'), data: activity.map((item) => item.critical) },
  ];
  const eventCount = activity.reduce((total, item) => total + item.medium + item.high + item.critical, 0);

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader
        title={t('monitoring.securityActivity.title')}
        action={!eventCount && activity.length ? <Label>{t('monitoring.securityActivity.noEvents')}</Label> : null}
      />
      {activity.length ? (
        <Box role="img" aria-label={t('monitoring.securityActivity.chartLabel')} sx={{ px: 1.5, pt: 1, pb: 2 }}>
          <Chart
            type="bar"
            series={series}
            options={chartOptions}
            sx={{ height: 320, ...(onDateSelect && { '& .apexcharts-bar-area': { cursor: 'pointer' } }) }}
          />
        </Box>
      ) : (
        <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: 352, px: 3 }}>
          <Iconify icon="solar:chart-square-outline" width={32} sx={{ color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary" textAlign="center">
            {t('monitoring.securityActivity.noData')}
          </Typography>
        </Stack>
      )}
    </Card>
  );
}

function AgentVersionsList({
  versions,
  missingAgents,
  selectedVersion,
  onSelect,
}: {
  versions: MonitoringAgentVersion[];
  missingAgents: number;
  selectedVersion: string | null;
  onSelect: (version: string) => void;
}) {
  const { t } = useTranslate('security-center');
  const theme = useTheme();
  const sortedVersions = useMemo(
    () =>
      [...versions].sort((left, right) => {
        if (left.version === right.version) return 0;
        if (left.version === 'unknown') return 1;
        if (right.version === 'unknown') return -1;
        return right.version.localeCompare(left.version, undefined, { numeric: true, sensitivity: 'base' });
      }),
    [versions],
  );

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={t('monitoring.agentVersions.title')} />

      {versions.length ? (
        <Scrollbar sx={{ maxHeight: 320 }}>
          <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />} sx={{ px: 0, pt: 0.5 }}>
            {sortedVersions.map((item) => {
              const selected = selectedVersion === item.version;

              return (
                <ButtonBase
                  key={item.version}
                  aria-pressed={selected}
                  onClick={() => onSelect(item.version)}
                  sx={{
                    width: 1,
                    px: 3,
                    py: 2,
                    borderRadius: 0,
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    bgcolor: 'transparent',
                    '&:hover': { bgcolor: 'transparent' },
                    '&.Mui-focusVisible': {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: -2,
                    },
                  }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ width: 1, minWidth: 0 }}>
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 40,
                        height: 40,
                        color: selected ? 'primary.main' : 'text.secondary',
                        bgcolor: selected ? alpha(theme.palette.primary.main, 0.12) : 'background.neutral',
                      }}>
                      <Iconify icon="solar:monitor-bold" width={20} />
                    </Avatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography variant="subtitle2" noWrap>
                        {item.version === 'unknown' ? t('monitoring.agentVersions.unknown') : item.version}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {t('monitoring.agentVersions.total', { count: item.total })}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                      <Label color="success" aria-label={`${t('monitoring.agent.online')}: ${item.online}`}>
                        {t('monitoring.agent.online')} {item.online}
                      </Label>
                      <Label color="error" aria-label={`${t('monitoring.agent.offline')}: ${item.offline}`}>
                        {t('monitoring.agent.offline')} {item.offline}
                      </Label>
                    </Stack>
                  </Stack>
                </ButtonBase>
              );
            })}
          </Stack>
        </Scrollbar>
      ) : (
        <Stack alignItems="center" spacing={1} sx={{ px: 3, py: 7, textAlign: 'center' }}>
          <Iconify icon="solar:monitor-bold" width={32} sx={{ color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary">
            {t('monitoring.agentVersions.empty')}
          </Typography>
        </Stack>
      )}

      <Divider sx={{ borderStyle: 'dashed' }} />
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ px: 3, py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <Avatar
            variant="rounded"
            sx={{ width: 40, height: 40, color: 'text.secondary', bgcolor: 'background.neutral' }}>
            <Iconify icon="solar:danger-triangle-bold" width={20} />
          </Avatar>
          <Typography variant="subtitle2" noWrap>
            {t('monitoring.agentVersions.missing')}
          </Typography>
        </Stack>
        <Label color={missingAgents ? 'warning' : 'default'}>{missingAgents}</Label>
      </Stack>
    </Card>
  );
}

function OperationalHealth({
  rows,
  counts,
  selectedStatus,
  onSelect,
}: {
  rows: MonitoringRow[];
  counts: Record<HealthStatus, number>;
  selectedStatus: HealthStatus | 'all';
  onSelect: (status: HealthStatus) => void;
}) {
  const { t } = useTranslate('security-center');
  const theme = useTheme();
  const total = rows.length;

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={t('monitoring.operationalHealth.title')} />

      <Stack spacing={1} sx={{ px: 3, pt: 2.5, pb: 3 }}>
        {(['healthy', 'attention', 'critical', 'unknown'] as const).map((status) => {
          const count = counts[status];
          const value = total ? (count / total) * 100 : 0;
          const selected = selectedStatus === status;

          return (
            <ButtonBase
              key={status}
              aria-pressed={selected}
              onClick={() => onSelect(status)}
              sx={{
                width: 1,
                p: 1,
                borderRadius: 1.5,
                textAlign: 'left',
                display: 'block',
                bgcolor: selected ? alpha(theme.palette[HEALTH_COLORS[status]].main, 0.08) : 'transparent',
                '&:hover': { bgcolor: alpha(theme.palette[HEALTH_COLORS[status]].main, selected ? 0.12 : 0.04) },
              }}>
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                  <HealthLabel status={status} />
                  <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {count} / {total}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={value}
                  color={HEALTH_COLORS[status]}
                  sx={{ height: 6, borderRadius: 1 }}
                />
              </Stack>
            </ButtonBase>
          );
        })}
      </Stack>
    </Card>
  );
}

function DeviceInventory({
  counts,
  pendingPairings,
  onSelect,
}: {
  counts: MonitoringDeviceTypeCounts;
  pendingPairings: number;
  onSelect: (type: string) => void;
}) {
  const { t } = useTranslate('security-center');
  const items: Array<{ key: keyof MonitoringDeviceTypeCounts; label: string; icon: IconifyName }> = [
    { key: 'localAgent', label: t('monitoring.devices.localAgent'), icon: 'solar:monitor-bold' },
    { key: 'pos', label: t('monitoring.devices.pos'), icon: 'solar:monitor-bold' },
    { key: 'tv', label: t('monitoring.devices.tv'), icon: 'solar:tv-bold' },
    { key: 'telegram', label: t('monitoring.devices.telegram'), icon: 'solar:chat-round-dots-bold' },
  ];

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title={t('monitoring.deviceInventory.title')} />

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5, px: 3, pt: 2, pb: 3 }}>
        {items.map((item) => (
          <Stack
            key={item.key}
            component={ButtonBase}
            aria-label={item.label}
            justifyContent="flex-start"
            onClick={() => onSelect(item.key)}
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              minWidth: 0,
              textAlign: 'left',
              p: 1.5,
              border: 1,
              borderRadius: 1.5,
              borderColor: 'divider',
            }}>
            <Avatar
              variant="rounded"
              sx={{ width: 40, height: 40, color: 'text.secondary', bgcolor: 'background.neutral' }}>
              <Iconify icon={item.icon} width={20} />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ lineHeight: 1.2, fontVariantNumeric: 'tabular-nums' }}>
                {counts[item.key]}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {item.label}
              </Typography>
            </Box>
          </Stack>
        ))}
      </Box>

      <Divider sx={{ borderStyle: 'dashed' }} />
      <Stack
        component={ButtonBase}
        onClick={() => onSelect('pairing')}
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
        sx={{ width: 1, px: 3, py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minWidth: 0 }}>
          <Avatar
            variant="rounded"
            sx={{ width: 40, height: 40, color: 'text.secondary', bgcolor: 'background.neutral' }}>
            <Iconify icon="solar:camera-add-bold" width={20} />
          </Avatar>
          <Typography variant="subtitle2">{t('monitoring.pendingPairingsLabel')}</Typography>
        </Stack>
        <Label color={pendingPairings ? 'warning' : 'default'}>{pendingPairings}</Label>
      </Stack>
    </Card>
  );
}

function SecurityCounts({ row }: { row: MonitoringRow }) {
  const { t } = useTranslate('security-center');
  const high = row.security.unacknowledgedHigh;
  const critical = row.security.unacknowledgedCritical;

  if (!high && !critical) {
    return <HealthLabel status="healthy" />;
  }

  return (
    <Stack direction="row" spacing={0.75}>
      {high ? (
        <Label color="warning">
          {t('monitoring.security.high')} {high}
        </Label>
      ) : null}
      {critical ? (
        <Label color="error">
          {t('monitoring.security.critical')} {critical}
        </Label>
      ) : null}
    </Stack>
  );
}

function DeviceCounts({ row }: { row: MonitoringRow }) {
  const { t } = useTranslate('security-center');
  const hasDevices = row.devices.active > 0;
  const online = Math.min(row.devices.online, row.devices.active);
  const allOnline = hasDevices && online === row.devices.active;
  const deviceTypes: Array<{ key: string; label: string; count: number; icon: IconifyName }> = [
    {
      key: 'local-agent',
      label: t('monitoring.devices.localAgent'),
      count: row.devices.activeLocalAgent,
      icon: 'solar:ssd-round-bold',
    },
    {
      key: 'pos',
      label: t('monitoring.devices.pos'),
      count: row.devices.activePOS,
      icon: 'solar:monitor-bold',
    },
    {
      key: 'tv',
      label: t('monitoring.devices.tv'),
      count: row.devices.activeTV,
      icon: 'solar:tv-bold',
    },
    {
      key: 'telegram',
      label: t('monitoring.devices.telegram'),
      count: row.devices.telegramSubscriptions,
      icon: 'solar:chat-round-dots-bold',
    },
  ];
  const visibleDeviceTypes = deviceTypes.filter((device) => device.count > 0);

  return (
    <Stack spacing={0.75} sx={{ minWidth: 156 }}>
      <Stack direction="row" spacing={0.65} alignItems="center">
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: !hasDevices ? 'text.disabled' : allOnline ? 'success.main' : 'warning.main',
          }}
        />
        <Typography variant="body2" fontWeight={600}>
          {hasDevices ? `${online}/${row.devices.active}` : '0'}
        </Typography>
      </Stack>

      {visibleDeviceTypes.length ? (
        <Stack direction="row" spacing={0.5} alignItems="center">
          {visibleDeviceTypes.map((device) => (
            <Tooltip key={device.key} title={device.label}>
              <Chip
                size="small"
                icon={<Iconify icon={device.icon} width={13} />}
                label={device.count}
                aria-label={`${device.label}: ${device.count}`}
                sx={{
                  height: 22,
                  minWidth: 34,
                  color: 'text.secondary',
                  bgcolor: 'action.hover',
                  '& .MuiChip-icon': { ml: 0.65, mr: -0.35, color: 'inherit' },
                  '& .MuiChip-label': { px: 0.65, fontSize: 12, fontWeight: 600 },
                }}
              />
            </Tooltip>
          ))}
        </Stack>
      ) : null}
    </Stack>
  );
}

function BranchTable({
  rows,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onDetails,
}: {
  rows: MonitoringRow[];
  page: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDetails: (row: MonitoringRow, type: 'health' | 'devices') => void;
}) {
  const { t } = useTranslate('security-center');
  const currentPage = Math.min(page, Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1));
  const visibleRows = rows.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  return (
    <>
      <Scrollbar>
        <Table size="small" sx={{ minWidth: 1000 }} aria-label={t('monitoring.registry.title')}>
          <TableHead>
            <TableRow>
              <TableCell>{t('monitoring.table.branch')}</TableCell>
              <TableCell>{t('monitoring.table.health')}</TableCell>
              <TableCell>{t('monitoring.table.agent')}</TableCell>
              <TableCell>{t('monitoring.table.devices')}</TableCell>
              <TableCell>{t('monitoring.table.security')}</TableCell>
              <TableCell>{t('monitoring.table.activity')}</TableCell>
              <TableCell align="right" sx={{ width: 64 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.map((row) => (
              <TableRow
                hover
                key={row.id}
                sx={{
                  height: BRANCH_ROW_HEIGHT,
                  '& > .MuiTableCell-root': { height: BRANCH_ROW_HEIGHT, py: 1 },
                }}>
                <TableCell>
                  <DetailPageLink
                    href={RouterPathHelper.organizationRestaurantDetail(row.restaurantId)}
                    sx={{
                      display: 'block',
                      maxWidth: 220,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                    {row.restaurantName}
                  </DetailPageLink>
                </TableCell>
                <TableCell>
                  <Tooltip describeChild title={safeDateTime(row.operationalHealth?.checkedAt)}>
                    <ButtonBase onClick={() => onDetails(row, 'health')} sx={{ borderRadius: 1, width: 'fit-content' }}>
                      <HealthLabel status={row.health.status} />
                    </ButtonBase>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <AgentLabel row={row} />
                </TableCell>
                <TableCell>
                  <ButtonBase onClick={() => onDetails(row, 'devices')} sx={{ textAlign: 'left', borderRadius: 1 }}>
                    <DeviceCounts row={row} />
                  </ButtonBase>
                </TableCell>
                <TableCell>
                  <SecurityCounts row={row} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap>
                    {safeDateTime(row.devices.lastSeenAt || row.agent?.lastSeenAt)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ pr: 1 }}>
                  <Tooltip title={t('monitoring.actions.details')}>
                    <IconButton
                      component={RouterLink}
                      href={RouterPathHelper.organizationRestaurantDetail(row.restaurantId)}
                      size="small"
                      aria-label={`${t('monitoring.actions.details')}: ${row.restaurantName}`}>
                      <Iconify icon="eva:arrow-ios-forward-fill" width={18} />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Scrollbar>

      {rows.length > DEFAULT_ROWS_PER_PAGE ? (
        <TablePagination
          component="div"
          count={rows.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(_event, nextPage) => onPageChange(nextPage)}
          onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
          labelRowsPerPage={t('monitoring.pagination.rowsPerPage')}
          labelDisplayedRows={({ from, to, count }) => t('monitoring.pagination.displayed', { from, to, count })}
          sx={{ borderTop: 1, borderColor: 'divider' }}
        />
      ) : null}
    </>
  );
}

export type MonitoringPanelProps = {
  businessPartnerId?: string | null;
  onSecurityDateSelect?: (date: string) => void;
};

export function MonitoringPanel({ businessPartnerId, onSecurityDateSelect }: MonitoringPanelProps = {}) {
  const { t } = useTranslate('security-center');
  const query = useMonitoringOverviewQuery(businessPartnerId);
  const [search, setSearch] = useState('');
  const [details, setDetails] = useState<{ type: string; row?: MonitoringRow } | null>(null);
  const [healthFilter, setHealthFilter] = useState<HealthStatus | 'all'>('all');
  const [agentVersionFilter, setAgentVersionFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const registryRef = useRef<HTMLDivElement>(null);

  const rows = useMemo<MonitoringRow[]>(
    () =>
      (query.data?.branches ?? [])
        .map((branch) => ({
          ...branch,
          id: branch.restaurantId,
          health: assessBranchHealth(branch, { referenceTime: query.data?.generatedAt }),
        }))
        .sort(
          (left, right) =>
            HEALTH_PRIORITY[left.health.status] - HEALTH_PRIORITY[right.health.status] ||
            left.restaurantName.localeCompare(right.restaurantName),
        ),
    [query.data?.branches, query.data?.generatedAt],
  );
  const healthCounts = useMemo(
    () =>
      rows.reduce((counts, row) => ({ ...counts, [row.health.status]: counts[row.health.status] + 1 }), {
        unknown: 0,
        healthy: 0,
        attention: 0,
        critical: 0,
      }),
    [rows],
  );
  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase();

    return rows.filter(
      (row) =>
        (healthFilter === 'all' || row.health.status === healthFilter) &&
        (!agentVersionFilter || (row.agent?.version ?? 'unknown') === agentVersionFilter) &&
        (!normalizedSearch || row.restaurantName.toLocaleLowerCase().includes(normalizedSearch)),
    );
  }, [agentVersionFilter, healthFilter, rows, search]);
  const riskCount = (query.data?.summary.unacknowledgedHigh ?? 0) + (query.data?.summary.unacknowledgedCritical ?? 0);
  const riskWindowHours = query.data?.summary.riskWindowHours ?? 24;
  const generatedAt = query.data?.generatedAt;
  const generatedAtTimestamp = generatedAt ? Date.parse(generatedAt) : Number.NaN;
  const stale = Number.isFinite(generatedAtTimestamp) && Date.now() - generatedAtTimestamp > STALE_AFTER_MS;
  const revealRegistry = () => {
    requestAnimationFrame(() => registryRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' }));
  };
  const selectHealthFilter = (status: HealthStatus) => {
    setHealthFilter((current) => (current === status ? 'all' : status));
    setPage(0);
    revealRegistry();
  };
  const selectAgentVersion = (version: string) => {
    setAgentVersionFilter((current) => (current === version ? null : version));
    setPage(0);
    revealRegistry();
  };

  if (query.isLoading && !query.data) {
    return (
      <Stack spacing={3} aria-label={t('monitoring.loading')}>
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid key={index} size={{ xs: 6, lg: 3 }}>
              <Skeleton variant="rounded" height={156} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <Skeleton variant="rounded" height={430} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Skeleton variant="rounded" height={430} />
          </Grid>
        </Grid>
        <Skeleton variant="rounded" height={480} />
      </Stack>
    );
  }

  if (query.isError && !query.data) {
    return (
      <Card sx={{ p: { xs: 3, md: 5 }, textAlign: 'center' }}>
        <Stack alignItems="center" spacing={2}>
          <Avatar variant="rounded" sx={{ color: 'text.secondary', bgcolor: 'background.neutral' }}>
            <Iconify icon="solar:danger-bold" />
          </Avatar>
          <Box>
            <Typography variant="h6">{t('monitoring.loadError')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {t('monitoring.loadErrorDescription')}
            </Typography>
          </Box>
          <Button variant="contained" onClick={() => query.refetch()}>
            {t('monitoring.retry')}
          </Button>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack spacing={3}>
      {stale || (query.isError && Boolean(query.data)) ? (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => query.refetch()}>
              {t('monitoring.retry')}
            </Button>
          }>
          {t('monitoring.refreshError')}
        </Alert>
      ) : null}

      <Grid container spacing={3} sx={{ order: 1 }}>
        <Grid size={{ xs: 6, lg: 3 }}>
          <SummaryCard
            title={t('monitoring.metrics.totalBranches')}
            value={query.data?.summary.totalBranches ?? rows.length}
            icon="solar:home-angle-bold-duotone"
            color="primary"
            helper={`${healthCounts.unknown} ${t('monitoring.health.unknown')}`}
          />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <SummaryCard
            title={t('monitoring.health.healthy')}
            value={healthCounts.healthy}
            icon="solar:shield-check-bold"
            color="success"
            helper={`${healthCounts.attention} ${t('monitoring.health.attention')} · ${healthCounts.critical} ${t('monitoring.health.critical')}`}
          />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <SummaryCard
            title={t('monitoring.metrics.onlineAgents')}
            value={query.data?.summary.agentOnline ?? 0}
            icon="solar:monitor-bold"
            color="info"
            helper={`${query.data?.summary.agentOffline ?? 0} ${t('monitoring.agent.offline')} / ${query.data?.summary.agentMissing ?? 0} ${t('monitoring.agent.missing')}`}
          />
        </Grid>
        <Grid size={{ xs: 6, lg: 3 }}>
          <SummaryCard
            title={t('monitoring.metrics.risks')}
            value={riskCount}
            icon="solar:danger-bold"
            color="error"
            helper={`${query.data?.summary.unacknowledgedHigh ?? 0} ${t('monitoring.security.high')} · ${query.data?.summary.unacknowledgedCritical ?? 0} ${t('monitoring.security.critical')} · ${t('monitoring.security.riskWindow', { count: riskWindowHours })}`}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} alignItems="stretch" sx={{ order: { xs: 3, lg: 2 } }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <SecurityActivityChart
            activity={query.data?.insights?.securityActivity ?? []}
            onDateSelect={onSecurityDateSelect}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <AgentVersionsList
            versions={query.data?.insights?.agentVersions ?? []}
            missingAgents={query.data?.summary.agentMissing ?? 0}
            selectedVersion={agentVersionFilter}
            onSelect={selectAgentVersion}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} alignItems="stretch" sx={{ order: { xs: 4, lg: 3 } }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <OperationalHealth
            rows={rows}
            counts={healthCounts}
            selectedStatus={healthFilter}
            onSelect={selectHealthFilter}
          />
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <DeviceInventory
            counts={query.data?.insights?.deviceTypes ?? { localAgent: 0, pos: 0, tv: 0, telegram: 0 }}
            pendingPairings={query.data?.summary.pendingPairings ?? 0}
            onSelect={(type) => setDetails({ type })}
          />
        </Grid>
      </Grid>

      <Card ref={registryRef} sx={{ order: { xs: 2, lg: 4 }, overflow: 'hidden', scrollMarginTop: 88 }}>
        <Tabs
          value={healthFilter}
          onChange={(_event, value: HealthStatus | 'all') => {
            setHealthFilter(value);
            setPage(0);
          }}
          variant="scrollable"
          scrollButtons={false}
          sx={{
            mt: 0,
            px: { xs: 1.5, md: 2.5 },
            boxShadow: (theme) => `inset 0 -1px 0 ${theme.vars.palette.divider}`,
          }}>
          {(
            [
              { value: 'all', label: t('monitoring.filters.all'), count: rows.length, color: 'default' },
              {
                value: 'healthy',
                label: t('monitoring.health.healthy'),
                count: healthCounts.healthy,
                color: 'success',
              },
              {
                value: 'attention',
                label: t('monitoring.health.attention'),
                count: healthCounts.attention,
                color: 'warning',
              },
              { value: 'unknown', label: t('monitoring.health.unknown'), count: healthCounts.unknown, color: 'info' },
              {
                value: 'critical',
                label: t('monitoring.health.critical'),
                count: healthCounts.critical,
                color: 'error',
              },
            ] as const
          ).map((item) => (
            <Tab
              key={item.value}
              value={item.value}
              iconPosition="end"
              label={item.label}
              icon={
                <Label
                  variant={healthFilter === item.value || item.value === 'all' ? 'filled' : 'soft'}
                  color={item.color}>
                  {item.count}
                </Label>
              }
            />
          ))}
        </Tabs>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
          sx={{ p: 2.5 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1}>
            <TextField
              size="small"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              placeholder={t('monitoring.filters.searchPlaceholder')}
              sx={{ width: { xs: 1, sm: 320 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                    </InputAdornment>
                  ),
                  endAdornment: search ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label={t('monitoring.filters.clearSearch')}
                        onClick={() => {
                          setSearch('');
                          setPage(0);
                        }}>
                        <Iconify icon="mingcute:close-line" width={18} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            {agentVersionFilter ? (
              <Tooltip title={t('monitoring.filters.clearAgentVersion')}>
                <Chip
                  color="primary"
                  variant="soft"
                  label={`${t('monitoring.filters.agentVersion')}: ${
                    agentVersionFilter === 'unknown' ? t('monitoring.agentVersions.unknown') : agentVersionFilter
                  }`}
                  onDelete={() => {
                    setAgentVersionFilter(null);
                    setPage(0);
                  }}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
                />
              </Tooltip>
            ) : null}
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
            spacing={1}>
            <Tooltip title={`${t('monitoring.generatedAt')}: ${safeDateTime(generatedAt)}`}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.75}
                aria-label={`${t('monitoring.generatedAt')}: ${safeDateTime(generatedAt)}`}>
                <Iconify icon="solar:clock-circle-bold" width={16} sx={{ color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary" noWrap>
                  {safeDateTime(generatedAt)}
                </Typography>
              </Stack>
            </Tooltip>
            <Tooltip title={t('monitoring.refresh')}>
              <span>
                <IconButton
                  disabled={query.isFetching}
                  onClick={() => query.refetch()}
                  aria-label={t('monitoring.refresh')}>
                  <Iconify icon="solar:restart-bold" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {rows.length === 0 ? (
          <Stack alignItems="center" spacing={1.25} sx={{ px: 3, py: 7, textAlign: 'center' }}>
            <Iconify icon="solar:home-angle-bold-duotone" width={40} sx={{ color: 'text.disabled' }} />
            <Typography variant="h6">{t('monitoring.empty.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('monitoring.empty.description')}
            </Typography>
          </Stack>
        ) : filteredRows.length === 0 ? (
          <Stack alignItems="center" spacing={1.25} sx={{ px: 3, py: 7, textAlign: 'center' }}>
            <Iconify icon="eva:search-fill" width={40} sx={{ color: 'text.disabled' }} />
            <Typography variant="h6">{t('monitoring.empty.noResults')}</Typography>
            <Button
              size="small"
              onClick={() => {
                setSearch('');
                setHealthFilter('all');
                setAgentVersionFilter(null);
                setPage(0);
              }}>
              {t('monitoring.filters.all')}
            </Button>
          </Stack>
        ) : (
          <BranchTable
            rows={filteredRows}
            onDetails={(row, type) => setDetails({ row, type })}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={(nextRowsPerPage) => {
              setRowsPerPage(nextRowsPerPage);
              setPage(0);
            }}
          />
        )}
      </Card>
      <MonitoringDetailsDialog
        selection={details}
        inventory={query.data?.inventory ?? []}
        onClose={() => setDetails(null)}
      />
    </Stack>
  );
}
