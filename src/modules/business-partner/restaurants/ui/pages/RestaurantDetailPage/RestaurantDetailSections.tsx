import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type {
  AdminRestaurantBranchSummary,
  AdminRestaurantDetail,
  AdminRestaurantReadinessStep,
} from 'shared/api/admin-types';
import { Iconify, type IconifyName } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { formatDateTime } from 'shared/utils/format-time';

type SectionCardProps = {
  title: string;
  description?: string;
  icon: IconifyName;
  action?: ReactNode;
  children: ReactNode;
};

function SectionCard({ title, description, icon, action, children }: SectionCardProps) {
  return (
    <Card sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack spacing={2.25}>
        <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0 }}>
            <Box
              sx={(theme) => ({
                width: 38,
                height: 38,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                color: 'primary.main',
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                flexShrink: 0,
              })}>
              <Iconify icon={icon} width={19} />
            </Box>
            <Stack spacing={0.2} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1">{title}</Typography>
              {description ? (
                <Typography variant="caption" color="text.secondary">
                  {description}
                </Typography>
              ) : null}
            </Stack>
          </Stack>
          {action}
        </Stack>
        {children}
      </Stack>
    </Card>
  );
}

type MetricCardProps = {
  label: string;
  value: ReactNode;
  hint: string;
  icon: IconifyName;
  color: 'primary' | 'success' | 'warning' | 'info';
};

function MetricCard({ label, value, hint, icon, color }: MetricCardProps) {
  return (
    <Card
      sx={(theme) => ({
        p: 2,
        boxShadow: `0 1px 4px ${alpha(theme.palette.grey[500], 0.12)}`,
      })}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={(theme) => ({
            width: 42,
            height: 42,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 1.75,
            color: `${color}.main`,
            bgcolor: alpha(theme.palette[color].main, 0.1),
            flexShrink: 0,
          })}>
          <Iconify icon={icon} width={21} />
        </Box>
        <Stack spacing={0.15} sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" noWrap>
            {label}
          </Typography>
          <Typography variant="h6" sx={{ lineHeight: 1.25 }}>
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {hint}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: ReactNode; icon: IconifyName }) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent="space-between">
      <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
        <Iconify icon={icon} width={17} sx={{ color: 'text.secondary', flexShrink: 0 }} />
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Box sx={{ typography: 'subtitle2', textAlign: 'right', minWidth: 0, overflowWrap: 'anywhere' }}>{value}</Box>
    </Stack>
  );
}

const READINESS_STEP_ICONS: Record<string, IconifyName> = {
  profile: 'solar:shop-2-bold-duotone',
  staff: 'solar:users-group-rounded-bold-duotone',
  service_points: 'solar:bill-list-bold-duotone',
  menu: 'solar:menu-dots-square-bold-duotone',
  integrations: 'solar:link-circle-bold-duotone',
  coordinator: 'solar:server-square-cloud-bold-duotone',
  printing: 'solar:printer-bold-duotone',
};

function ReadinessStepCard({ step }: { step: AdminRestaurantReadinessStep }) {
  const { t } = useTranslate('organizations');
  const color = step.status === 'ready' ? 'success' : step.status === 'blocked' ? 'error' : 'warning';

  return (
    <Stack
      spacing={1.25}
      sx={(theme) => ({
        p: 1.5,
        minWidth: 0,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette.grey[500], 0.08),
      })}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Iconify
            icon={READINESS_STEP_ICONS[step.id] ?? 'solar:checklist-minimalistic-bold-duotone'}
            width={19}
            sx={{ color: `${color}.main`, flexShrink: 0 }}
          />
          <Typography variant="subtitle2" noWrap>
            {t(`restaurantDetail.readiness.steps.${step.id}`, { defaultValue: step.id })}
          </Typography>
        </Stack>
        <Chip
          size="small"
          color={color}
          variant="soft"
          label={t(`restaurantDetail.readiness.status.${step.status}`)}
          sx={{ flexShrink: 0 }}
        />
      </Stack>

      {step.issueCodes.length ? (
        <Stack spacing={0.5}>
          {step.issueCodes.slice(0, 2).map((issueCode) => (
            <Stack key={issueCode} direction="row" spacing={0.75} alignItems="flex-start">
              <Box
                sx={{ width: 4, height: 4, mt: 0.75, borderRadius: '50%', bgcolor: `${color}.main`, flexShrink: 0 }}
              />
              <Typography variant="caption" color="text.secondary">
                {t(`restaurantDetail.readiness.issues.${issueCode}`, { defaultValue: issueCode })}
              </Typography>
            </Stack>
          ))}
          {step.issueCodes.length > 2 ? (
            <Typography variant="caption" color="text.secondary">
              {t('restaurantDetail.readiness.moreIssues', { count: step.issueCodes.length - 2 })}
            </Typography>
          ) : null}
        </Stack>
      ) : (
        <Typography variant="caption" color="success.main">
          {t('restaurantDetail.readiness.stepReady')}
        </Typography>
      )}
    </Stack>
  );
}

function OperationsOverview({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const summary = restaurant.operationalSummary;
  const servicePointCount = summary.cashDesks + summary.prepStations + summary.distributionPoints;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' },
        gap: 1.5,
      }}>
      <MetricCard
        label={t('restaurantDetail.metrics.staff')}
        value={summary.activeUsers}
        hint={t('restaurantDetail.metrics.staffHint')}
        icon="solar:users-group-rounded-bold-duotone"
        color="primary"
      />
      <MetricCard
        label={t('restaurantDetail.metrics.servicePoints')}
        value={servicePointCount}
        hint={t('restaurantDetail.metrics.servicePointsHint', {
          cashDesks: summary.cashDesks,
          prepStations: summary.prepStations,
        })}
        icon="solar:bill-list-bold-duotone"
        color="info"
      />
      <MetricCard
        label={t('restaurantDetail.metrics.menu')}
        value={summary.menuItems}
        hint={t('restaurantDetail.metrics.menuHint')}
        icon="solar:menu-dots-square-bold-duotone"
        color="success"
      />
      <MetricCard
        label={t('restaurantDetail.metrics.devices')}
        value={`${summary.onlineDevices}/${summary.activeDevices}`}
        hint={
          summary.lastSeenAt
            ? t('restaurantDetail.metrics.lastSeen', { date: formatDateTime(summary.lastSeenAt) })
            : t('portfolio.noActivity')
        }
        icon="solar:devices-bold-duotone"
        color="warning"
      />
    </Box>
  );
}

function ReadinessSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const readiness = restaurant.setupReadiness;

  return (
    <SectionCard
      title={t('restaurantDetail.readiness.title')}
      icon="solar:checklist-minimalistic-bold-duotone"
      action={
        <Chip
          size="small"
          color={readiness.ready ? 'success' : 'warning'}
          variant="soft"
          label={t('restaurantDetail.readiness.progress', { value: readiness.progressPercent })}
        />
      }>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1.25,
        }}>
        {readiness.steps.map((step) => (
          <ReadinessStepCard key={step.id} step={step} />
        ))}
      </Box>
    </SectionCard>
  );
}

function BranchStatus({ branch }: { branch: AdminRestaurantBranchSummary }) {
  const { t } = useTranslate('organizations');
  const isActive = Boolean(branch.isActive && branch.restaurantAccessActive);

  return (
    <Chip
      size="small"
      variant="soft"
      color={isActive ? 'success' : 'default'}
      label={t(`portfolio.lifecycle.${isActive ? 'active' : 'inactive'}`)}
    />
  );
}

function BranchNetworkSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');

  return (
    <SectionCard
      title={t('restaurantDetail.sections.branches')}
      icon="solar:buildings-2-bold-duotone"
      action={
        <Chip
          size="small"
          variant="soft"
          label={t('restaurantDetail.branchCount', { count: restaurant.branches.length })}
        />
      }>
      {restaurant.branches.length ? (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('fields.name')}</TableCell>
                <TableCell>{t('fields.status')}</TableCell>
                <TableCell align="right">{t('portfolio.columns.staff')}</TableCell>
                <TableCell align="right">{t('portfolio.columns.devices')}</TableCell>
                <TableCell>{t('portfolio.columns.lastSeen')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {restaurant.branches.map((branch) => (
                <TableRow key={branch.id} hover>
                  <TableCell>
                    <Stack spacing={0.25} sx={{ minWidth: 180 }}>
                      <Typography
                        component={RouterLink}
                        href={RouterPathHelper.organizationRestaurantDetail(branch.id)}
                        variant="subtitle2"
                        color="text.primary"
                        sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        {branch.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {branch.address || t('labels.notSelected')}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <BranchStatus branch={branch} />
                  </TableCell>
                  <TableCell align="right">{branch.activeUsersCount}</TableCell>
                  <TableCell align="right">
                    {branch.onlineDeviceCount}/{branch.activeDeviceCount}
                  </TableCell>
                  <TableCell>
                    {branch.lastSeenAt ? formatDateTime(branch.lastSeenAt) : t('portfolio.noActivity')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Stack alignItems="center" spacing={1} sx={{ py: 3, textAlign: 'center' }}>
          <Iconify icon="solar:buildings-2-linear" width={32} sx={{ color: 'text.disabled' }} />
          <Typography variant="body2" color="text.secondary">
            {t('restaurantDetail.emptyBranches')}
          </Typography>
        </Stack>
      )}
    </SectionCard>
  );
}

function ActiveUsersSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const visibleUsers = restaurant.activeUsers.slice(0, 8);

  return (
    <SectionCard
      title={t('sections.activeUsers.title')}
      icon="solar:users-group-rounded-bold-duotone"
      action={<Chip size="small" variant="soft" label={restaurant.operationalSummary.activeUsers} />}>
      {visibleUsers.length ? (
        <>
          <TableContainer sx={{ mx: { xs: -2, md: -2.5 }, mb: { xs: -2, md: -2.5 }, width: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('fields.name')}</TableCell>
                  <TableCell>{tPlatform('fields.username')}</TableCell>
                  <TableCell>{t('fields.role')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.role?.name ?? t('labels.notSelected')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {restaurant.activeUsers.length > visibleUsers.length ? (
            <Typography variant="caption" color="text.secondary">
              {t('restaurantDetail.moreUsers', { count: restaurant.activeUsers.length - visibleUsers.length })}
            </Typography>
          ) : null}
        </>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('empty.activeUsers')}
        </Typography>
      )}
    </SectionCard>
  );
}

function CustomerOverviewSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const tariffName =
    restaurant.tariff?.name ??
    (restaurant.activationType === 'custom' ? tPlatform('labels.customActivation') : t('labels.notSelected'));
  const emptyValue = t('labels.notSelected');
  const rows = [
    { label: t('fields.legalName'), value: restaurant.legalName || emptyValue, icon: 'solar:case-bold-duotone' },
    {
      label: t('fields.taxNumber'),
      value: restaurant.taxNumber || emptyValue,
      icon: 'solar:document-text-bold-duotone',
    },
    { label: t('fields.phone'), value: restaurant.phone || emptyValue, icon: 'solar:phone-bold-duotone' },
    { label: t('fields.social'), value: restaurant.social || emptyValue, icon: 'solar:chat-round-dots-bold-duotone' },
    { label: t('fields.address'), value: restaurant.address || emptyValue, icon: 'solar:map-point-bold-duotone' },
    { label: t('fields.tariff'), value: tariffName, icon: 'solar:tag-price-bold-duotone' },
    { label: t('fields.currency'), value: restaurant.currency, icon: 'solar:wallet-money-bold-duotone' },
    {
      label: tPlatform('fields.activatedAt'),
      value: restaurant.activatedAt ? formatDateTime(restaurant.activatedAt) : emptyValue,
      icon: 'solar:calendar-bold-duotone',
    },
  ] as const;

  return (
    <SectionCard title={t('sections.customerOverview.title')} icon="solar:shop-2-bold-duotone">
      <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
        {rows.map((row) => (
          <InfoRow key={row.label} {...row} />
        ))}
      </Stack>
    </SectionCard>
  );
}

function ServiceSettingsSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const enabled = tCommon('labels.yes');
  const disabled = tCommon('labels.no');
  const rows = [
    {
      label: t('fields.serviceFeeEnabled'),
      value: restaurant.serviceFeeEnabled ? `${enabled} · ${restaurant.serviceFeePercent}%` : disabled,
      icon: 'solar:bill-list-bold-duotone',
    },
    {
      label: t('fields.vatEnabled'),
      value: restaurant.vatEnabled ? `${enabled} · ${restaurant.vatPercent}%` : disabled,
      icon: 'solar:calculator-minimalistic-bold-duotone',
    },
    {
      label: t('fields.markingCheckEnabled'),
      value: restaurant.markingCheckEnabled ? enabled : disabled,
      icon: 'solar:qr-code-bold-duotone',
    },
    {
      label: t('fields.posMonitorVariant'),
      value: t(
        `fields.posMonitorVariant${restaurant.posMonitorVariant === 'light_compact' ? 'LightCompact' : 'Default'}`,
      ),
      icon: 'solar:monitor-bold-duotone',
    },
    {
      label: t('fields.paymentTotalMode'),
      value: t(
        `fields.paymentTotalMode${restaurant.paymentTotalMode === 'cashier_editable' ? 'CashierEditable' : 'Fixed'}`,
      ),
      icon: 'solar:card-bold-duotone',
    },
  ] as const;

  return (
    <SectionCard title={t('restaurantDetail.sections.settings')} icon="solar:tuning-square-2-bold-duotone">
      <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
        {rows.map((row) => (
          <InfoRow key={row.label} {...row} />
        ))}
      </Stack>
    </SectionCard>
  );
}

function SoliqIntegrationSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const integration = restaurant.soliqIntegration;

  return (
    <SectionCard
      title={t('sections.soliqIntegration.title')}
      description={t('sections.soliqIntegration.description')}
      icon="solar:server-square-cloud-bold-duotone">
      {integration ? (
        <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
          <InfoRow label={t('fields.provider')} value={integration.provider} icon="solar:server-bold-duotone" />
          <InfoRow
            label={t('fields.status')}
            value={
              <Chip
                size="small"
                color={integration.isEnabled ? 'success' : 'default'}
                variant="soft"
                label={integration.isEnabled ? tCommon('status.active') : tCommon('status.inactive')}
              />
            }
            icon="solar:shield-check-bold-duotone"
          />
          <InfoRow
            label={t('fields.terminalId')}
            value={integration.terminalId || t('labels.notSelected')}
            icon="solar:hashtag-bold-duotone"
          />
          <InfoRow
            label={t('integrations.fields.cashboxId')}
            value={integration.cashboxId || t('labels.notSelected')}
            icon="solar:bill-list-bold-duotone"
          />
          <InfoRow
            label={t('fields.taxNumber')}
            value={integration.taxNumber || t('labels.notSelected')}
            icon="solar:document-text-bold-duotone"
          />
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary">
          {t('empty.soliqIntegration')}
        </Typography>
      )}
    </SectionCard>
  );
}

type RestaurantDetailSectionsProps = {
  restaurant: AdminRestaurantDetail;
};

export function RestaurantDetailSections({ restaurant }: RestaurantDetailSectionsProps) {
  return (
    <Stack spacing={2.5}>
      <OperationsOverview restaurant={restaurant} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.7fr) minmax(300px, 0.8fr)' },
          gap: 2.5,
          alignItems: 'start',
        }}>
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <ReadinessSection restaurant={restaurant} />
          {!restaurant.parentId ? <BranchNetworkSection restaurant={restaurant} /> : null}
          <ActiveUsersSection restaurant={restaurant} />
        </Stack>
        <Stack spacing={2.5} sx={{ minWidth: 0 }}>
          <CustomerOverviewSection restaurant={restaurant} />
          <ServiceSettingsSection restaurant={restaurant} />
          <SoliqIntegrationSection restaurant={restaurant} />
        </Stack>
      </Box>
    </Stack>
  );
}
