import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';
import { useMemo } from 'react';

import { CONFIG } from 'app/config/globalConfig';
import { useTranslate } from 'app/providers/locales';
import { Iconify, type IconifyName } from 'shared/ui/Iconify';
import { formatDateTime } from 'shared/utils/format-time';

import { useDeviceMigrationSummaryQuery, useSecurityEventsQuery } from '../../../../application';
import {
  evaluateBranchRolloutReadiness,
  type BranchRolloutStage,
  type DeviceMigrationBranch,
  type SecurityEvent,
} from '../../../../domain';
import { SecurityStatusChip } from '../../../shared';

export type ControlCenterSection = 'migration' | 'security' | 'telegram';

type ControlCenterOverviewProps = {
  onOpenSection: (section: ControlCenterSection) => void;
};

type MetricColor = 'success' | 'warning' | 'error';

type ActionItem = {
  id: string;
  title: string;
  description: string;
  count: number;
  icon: IconifyName;
  color: MetricColor | 'info';
  branchNames?: string[];
  href?: string;
  section?: ControlCenterSection;
};

const STAGE_PRIORITY: BranchRolloutStage[] = [
  'fixPrerequisites',
  'readyForPOSUpdate',
  'migrationInProgress',
  'readyForBridgeOff',
];

const STAGE_ICONS: Record<BranchRolloutStage, IconifyName> = {
  fixPrerequisites: 'solar:danger-triangle-bold-duotone',
  readyForPOSUpdate: 'solar:download-minimalistic-bold-duotone',
  migrationInProgress: 'solar:refresh-circle-bold-duotone',
  readyForBridgeOff: 'solar:shield-check-bold-duotone',
};

const STAGE_COLORS: Record<BranchRolloutStage, ActionItem['color']> = {
  fixPrerequisites: 'error',
  readyForPOSUpdate: 'info',
  migrationInProgress: 'warning',
  readyForBridgeOff: 'success',
};

function MetricCard({
  label,
  value,
  icon,
  color,
  loading,
}: {
  label: string;
  value: string | number;
  icon: IconifyName;
  color: MetricColor;
  loading: boolean;
}) {
  return (
    <Card
      sx={(theme) => ({
        p: 2.5,
        height: 1,
        border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
        boxShadow: theme.customShadows.z4,
      })}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Stack spacing={0.75} sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={88} height={46} />
          ) : (
            <Typography variant="h3" sx={{ letterSpacing: -0.8 }}>
              {value}
            </Typography>
          )}
        </Stack>
        <Avatar
          sx={(theme) => ({
            width: 48,
            height: 48,
            color: `${color}.main`,
            bgcolor: varAlpha(theme.vars.palette[color].mainChannel, 0.12),
            flexShrink: 0,
          })}>
          <Iconify icon={icon} width={24} />
        </Avatar>
      </Stack>
    </Card>
  );
}

function ActionRow({
  item,
  onOpenSection,
}: {
  item: ActionItem;
  onOpenSection: (section: ControlCenterSection) => void;
}) {
  const { t } = useTranslate('security-center');
  const visibleBranches = item.branchNames?.slice(0, 2) ?? [];
  const remainingBranches = Math.max((item.branchNames?.length ?? 0) - visibleBranches.length, 0);

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ sm: 'center' }}
      spacing={2}
      sx={{ px: { xs: 2, sm: 2.5 }, py: 2 }}>
      <Avatar
        sx={(theme) => ({
          width: 42,
          height: 42,
          color: `${item.color}.main`,
          bgcolor: varAlpha(theme.vars.palette[item.color].mainChannel, 0.1),
          flexShrink: 0,
        })}>
        <Iconify icon={item.icon} width={22} />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Typography variant="subtitle2">{item.title}</Typography>
          <Chip
            size="small"
            variant="soft"
            color={item.color}
            label={t('controlCenter.actions.count', { count: item.count })}
          />
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {item.description}
        </Typography>
        {!!visibleBranches.length && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {visibleBranches.join(' · ')}
            {remainingBranches > 0 ? t('controlCenter.actions.moreBranches', { count: remainingBranches }) : ''}
          </Typography>
        )}
      </Box>

      <Button
        component={item.href ? 'a' : 'button'}
        href={item.href}
        variant="outlined"
        color={item.color}
        size="small"
        endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
        onClick={item.section ? () => onOpenSection(item.section!) : undefined}
        sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, flexShrink: 0 }}>
        {t('controlCenter.actions.open')}
      </Button>
    </Stack>
  );
}

function RecentRiskEvents({
  events,
  loading,
  error,
  onOpen,
}: {
  events: SecurityEvent[];
  loading: boolean;
  error: boolean;
  onOpen: () => void;
}) {
  const { t } = useTranslate('security-center');

  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <Stack spacing={0.5} sx={{ p: 2.5, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Avatar
            sx={(theme) => ({
              width: 36,
              height: 36,
              color: 'error.main',
              bgcolor: varAlpha(theme.vars.palette.error.mainChannel, 0.1),
            })}>
            <Iconify icon="solar:shield-warning-bold-duotone" width={20} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1">{t('controlCenter.risk.title')}</Typography>
            <Typography variant="caption" color="text.secondary">
              {t('controlCenter.risk.description')}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Divider />
      {error && (
        <Alert severity="warning" sx={{ m: 2 }}>
          {t('controlCenter.risk.loadError')}
        </Alert>
      )}
      {loading && (
        <Stack spacing={1.25} sx={{ p: 2.5 }}>
          {[0, 1, 2].map((item) => (
            <Skeleton key={item} variant="rounded" height={48} />
          ))}
        </Stack>
      )}
      {!loading && !events.length && !error && (
        <Stack alignItems="center" spacing={1} sx={{ px: 2.5, py: 3.5, textAlign: 'center' }}>
          <Iconify icon="solar:shield-check-bold-duotone" width={30} sx={{ color: 'success.main' }} />
          <Typography variant="body2" color="text.secondary">
            {t('controlCenter.risk.empty')}
          </Typography>
        </Stack>
      )}
      {!loading && events.length > 0 && (
        <Stack divider={<Divider flexItem />}>
          {events.slice(0, 3).map((event) => (
            <Stack key={event.id} direction="row" spacing={1.25} alignItems="center" sx={{ px: 2.5, py: 1.5 }}>
              <SecurityStatusChip status={event.severity} label={t(`severities.${event.severity}`)} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {t(`eventTypes.${event.eventType.toLocaleLowerCase()}`, { defaultValue: event.eventType })}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                  {event.restaurantName || t('devices.platform')} · {formatDateTime(event.createdAt)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      )}
      <Box sx={{ p: 2, pt: events.length ? 1.5 : 0 }}>
        <Button fullWidth variant="text" endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />} onClick={onOpen}>
          {t('controlCenter.risk.openAll')}
        </Button>
      </Box>
    </Card>
  );
}

export function ControlCenterOverview({ onOpenSection }: ControlCenterOverviewProps) {
  const { t } = useTranslate('security-center');
  const migrationQuery = useDeviceMigrationSummaryQuery();
  const highRiskQuery = useSecurityEventsQuery({ page: 1, pageSize: 3, severity: 'HIGH', acknowledged: false });
  const criticalRiskQuery = useSecurityEventsQuery({ page: 1, pageSize: 3, severity: 'CRITICAL', acknowledged: false });

  const snapshotAt = migrationQuery.dataUpdatedAt || Date.now();
  const branches = useMemo(
    () =>
      (migrationQuery.data?.branches ?? []).map((branch) => ({
        branch,
        readiness: evaluateBranchRolloutReadiness(branch, snapshotAt),
      })),
    [migrationQuery.data?.branches, snapshotAt],
  );
  const stageGroups = useMemo(
    () =>
      STAGE_PRIORITY.reduce<Record<BranchRolloutStage, DeviceMigrationBranch[]>>(
        (groups, stage) => ({
          ...groups,
          [stage]: branches.filter((item) => item.readiness.stage === stage).map((item) => item.branch),
        }),
        { fixPrerequisites: [], readyForPOSUpdate: [], migrationInProgress: [], readyForBridgeOff: [] },
      ),
    [branches],
  );

  const highRiskCount = (highRiskQuery.data?.total ?? 0) + (criticalRiskQuery.data?.total ?? 0);
  const criticalRiskCount = criticalRiskQuery.data?.total ?? 0;
  const pendingPairings = migrationQuery.data?.pairings.pending ?? 0;
  const fullyMigrated = branches.filter((item) => item.readiness.fullyMigrated).length;
  const blockedBranches = stageGroups.fixPrerequisites.length;
  const riskEvents = useMemo(
    () =>
      [...(highRiskQuery.data?.items ?? []), ...(criticalRiskQuery.data?.items ?? [])].sort(
        (left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt),
      ),
    [criticalRiskQuery.data?.items, highRiskQuery.data?.items],
  );

  const hasPartialData = migrationQuery.isError || highRiskQuery.isError || criticalRiskQuery.isError;
  const status =
    criticalRiskCount > 0
      ? 'critical'
      : hasPartialData || highRiskCount > 0 || blockedBranches > 0 || pendingPairings > 0
        ? 'attention'
        : 'stable';
  const statusColor: MetricColor = status === 'critical' ? 'error' : status === 'attention' ? 'warning' : 'success';
  const lastUpdatedAt = Math.max(
    migrationQuery.dataUpdatedAt || 0,
    highRiskQuery.dataUpdatedAt || 0,
    criticalRiskQuery.dataUpdatedAt || 0,
  );
  const refreshing = migrationQuery.isFetching || highRiskQuery.isFetching || criticalRiskQuery.isFetching;

  const actions = useMemo<ActionItem[]>(() => {
    const items: ActionItem[] = [];
    if (highRiskCount > 0) {
      items.push({
        id: 'security-events',
        title: t('controlCenter.actions.securityEvents.title'),
        description: t('controlCenter.actions.securityEvents.description', {
          count: highRiskCount,
          critical: criticalRiskCount,
        }),
        count: highRiskCount,
        icon: 'solar:shield-warning-bold-duotone',
        color: 'error',
        section: 'security',
      });
    }
    if (pendingPairings > 0) {
      items.push({
        id: 'pending-pairings',
        title: t('controlCenter.actions.pendingPairings.title'),
        description: t('controlCenter.actions.pendingPairings.description', { count: pendingPairings }),
        count: pendingPairings,
        icon: 'solar:qr-code-bold-duotone',
        color: 'info',
        href: CONFIG.controlAppUrl,
      });
    }
    STAGE_PRIORITY.forEach((stage) => {
      const stageBranches = stageGroups[stage];
      if (!stageBranches.length) return;
      items.push({
        id: stage,
        title: t(`controlCenter.actions.${stage}.title`),
        description: t(`controlCenter.actions.${stage}.description`, { count: stageBranches.length }),
        count: stageBranches.length,
        icon: STAGE_ICONS[stage],
        color: STAGE_COLORS[stage],
        branchNames: stageBranches.map((branch) => branch.restaurantName),
        section: 'migration',
      });
    });
    return items;
  }, [criticalRiskCount, highRiskCount, pendingPairings, stageGroups, t]);

  const refresh = () => {
    void Promise.all([migrationQuery.refetch(), highRiskQuery.refetch(), criticalRiskQuery.refetch()]);
  };

  return (
    <Stack spacing={3}>
      <Card
        sx={(theme) => ({
          position: 'relative',
          overflow: 'hidden',
          p: { xs: 2.5, md: 3 },
          border: `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.16)}`,
          background: `linear-gradient(135deg, ${varAlpha(theme.vars.palette.primary.mainChannel, 0.12)} 0%, ${theme.vars.palette.background.paper} 58%, ${varAlpha(theme.vars.palette.info.mainChannel, 0.08)} 100%)`,
          boxShadow: theme.customShadows.z8,
        })}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2.5}>
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <Avatar
              sx={(theme) => ({
                width: 52,
                height: 52,
                color: 'primary.main',
                bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.14),
                flexShrink: 0,
              })}>
              <Iconify icon="solar:shield-keyhole-bold-duotone" width={28} />
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Typography variant="h5">{t('controlCenter.title')}</Typography>
                <Chip
                  size="small"
                  variant="soft"
                  color={statusColor}
                  label={t(`controlCenter.status.${status}`)}
                  icon={
                    <Iconify
                      icon={status === 'stable' ? 'solar:check-circle-bold' : 'solar:danger-circle-bold'}
                      width={16}
                    />
                  }
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 760 }}>
                {t('controlCenter.description')}
              </Typography>
              {lastUpdatedAt > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>
                  {t('controlCenter.snapshot.lastUpdated')}: {formatDateTime(lastUpdatedAt)}
                </Typography>
              )}
            </Box>
          </Stack>
          <Button
            variant="outlined"
            color="inherit"
            loading={refreshing}
            startIcon={<Iconify icon="solar:refresh-bold" />}
            onClick={refresh}
            sx={{ alignSelf: { xs: 'flex-start', md: 'center' }, flexShrink: 0 }}>
            {t('controlCenter.refresh')}
          </Button>
        </Stack>
      </Card>

      <Grid container spacing={2.5} aria-label={t('controlCenter.metrics.label')}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            label={t('controlCenter.metrics.migratedBranches')}
            value={`${fullyMigrated}/${branches.length}`}
            icon="solar:buildings-3-bold-duotone"
            color="success"
            loading={migrationQuery.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            label={t('controlCenter.metrics.blockedBranches')}
            value={blockedBranches}
            icon="solar:danger-triangle-bold-duotone"
            color="warning"
            loading={migrationQuery.isLoading}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            label={t('controlCenter.metrics.highRiskEvents')}
            value={highRiskCount}
            icon="solar:shield-warning-bold-duotone"
            color="error"
            loading={highRiskQuery.isLoading || criticalRiskQuery.isLoading}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 7 }}>
          <Card variant="outlined" sx={{ overflow: 'hidden' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ p: 2.5 }}>
              <Box>
                <Typography variant="h6">{t('controlCenter.nextActions.title')}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {t('controlCenter.nextActions.description')}
                </Typography>
              </Box>
              <Avatar
                sx={(theme) => ({
                  width: 40,
                  height: 40,
                  color: 'primary.main',
                  bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
                  flexShrink: 0,
                })}>
                <Iconify icon="solar:checklist-minimalistic-bold-duotone" width={22} />
              </Avatar>
            </Stack>
            <Divider />
            {hasPartialData && (
              <Alert severity="warning" sx={{ m: 2 }}>
                {t('controlCenter.nextActions.partialData')}
              </Alert>
            )}
            {(migrationQuery.isLoading || highRiskQuery.isLoading || criticalRiskQuery.isLoading) && (
              <Stack spacing={1.5} sx={{ p: 2.5 }}>
                {[0, 1, 2].map((item) => (
                  <Skeleton key={item} variant="rounded" height={78} />
                ))}
              </Stack>
            )}
            {!migrationQuery.isLoading &&
              !highRiskQuery.isLoading &&
              !criticalRiskQuery.isLoading &&
              actions.length > 0 && (
                <Stack divider={<Divider flexItem />}>
                  {actions.map((item) => (
                    <ActionRow key={item.id} item={item} onOpenSection={onOpenSection} />
                  ))}
                </Stack>
              )}
            {!migrationQuery.isLoading &&
              !highRiskQuery.isLoading &&
              !criticalRiskQuery.isLoading &&
              !actions.length && (
                <Stack alignItems="center" spacing={1} sx={{ px: 3, py: 5, textAlign: 'center' }}>
                  <Avatar
                    sx={(theme) => ({
                      width: 52,
                      height: 52,
                      color: 'success.main',
                      bgcolor: varAlpha(theme.vars.palette.success.mainChannel, 0.1),
                    })}>
                    <Iconify icon="solar:check-circle-bold-duotone" width={28} />
                  </Avatar>
                  <Typography variant="subtitle1">{t('controlCenter.nextActions.emptyTitle')}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                    {t('controlCenter.nextActions.emptyDescription')}
                  </Typography>
                </Stack>
              )}
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Stack spacing={2.5}>
            <Card
              variant="outlined"
              sx={(theme) => ({
                p: 2.5,
                borderColor: varAlpha(theme.vars.palette.info.mainChannel, 0.2),
              })}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  sx={(theme) => ({
                    width: 48,
                    height: 48,
                    color: 'info.main',
                    bgcolor: varAlpha(theme.vars.palette.info.mainChannel, 0.12),
                    flexShrink: 0,
                  })}>
                  <Iconify icon="solar:qr-code-bold-duotone" width={25} />
                </Avatar>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="subtitle1">{t('controlCenter.pending.title')}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('controlCenter.pending.description')}
                  </Typography>
                </Box>
                {migrationQuery.isLoading ? (
                  <Skeleton variant="rounded" width={48} height={36} />
                ) : (
                  <Typography variant="h4" color="info.main">
                    {pendingPairings}
                  </Typography>
                )}
              </Stack>
              {migrationQuery.isError && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {t('controlCenter.pending.loadError')}
                </Alert>
              )}
              <Button
                component="a"
                href={CONFIG.controlAppUrl}
                fullWidth
                variant="outlined"
                color="info"
                endIcon={<Iconify icon="eva:arrow-ios-forward-fill" />}
                sx={{ mt: 2 }}>
                {t('controlCenter.pending.openAll')}
              </Button>
            </Card>

            <RecentRiskEvents
              events={riskEvents}
              loading={highRiskQuery.isLoading || criticalRiskQuery.isLoading}
              error={highRiskQuery.isError || criticalRiskQuery.isError}
              onOpen={() => onOpenSection('security')}
            />
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
}
