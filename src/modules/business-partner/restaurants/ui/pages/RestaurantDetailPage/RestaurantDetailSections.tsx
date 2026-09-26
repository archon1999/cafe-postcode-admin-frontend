import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { GridColDef } from '@mui/x-data-grid';
import type { ReactNode } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type {
  AdminRestaurantActiveUser,
  AdminRestaurantBranchSummary,
  AdminRestaurantDetail,
  AdminRestaurantReadinessStep,
} from 'shared/api/admin-types';
import { DataGrid } from 'shared/ui/CustomDataGrid';
import { Iconify, type IconifyName } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { formatDateTime } from 'shared/utils/format-time';

type SectionCardProps = {
  title: string;
  description?: string;
  icon: IconifyName;
  action?: ReactNode;
  children: ReactNode;
  flush?: boolean;
};

function SectionCard({ title, description, icon, action, children, flush = false }: SectionCardProps) {
  return (
    <Card sx={{ height: '100%', minWidth: 0 }}>
      <CardHeader
        title={title}
        subheader={description}
        action={action}
        avatar={<Iconify icon={icon} width={22} sx={{ color: 'text.secondary' }} />}
        slotProps={{ title: { variant: 'h6' }, subheader: { variant: 'body2' } }}
        sx={{ px: 3, pt: 3, pb: flush ? 2.5 : 0, '& .MuiCardHeader-action': { alignSelf: 'center', mt: 0 } }}
      />
      <Box sx={flush ? { minWidth: 0 } : { px: 3, pt: 3, pb: 3 }}>{children}</Box>
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

function ReadinessIssueRow({ step }: { step: AdminRestaurantReadinessStep }) {
  const { t } = useTranslate('organizations');
  const color = step.status === 'blocked' ? 'error' : 'warning';

  return (
    <Stack
      spacing={1}
      sx={(theme) => ({
        p: 2,
        minWidth: 0,
        borderRadius: 1.5,
        bgcolor: alpha(theme.palette[color].main, 0.06),
        borderLeft: `3px solid ${theme.palette[color].main}`,
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
      ) : null}
    </Stack>
  );
}

function OperationsOverview({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const summary = restaurant.operationalSummary;
  const servicePointCount = summary.cashDesks + summary.prepStations + summary.distributionPoints;
  const rows = [
    {
      label: t('restaurantDetail.metrics.staff'),
      value: summary.activeUsers,
      icon: 'solar:users-group-rounded-bold-duotone',
    },
    {
      label: t('restaurantDetail.metrics.servicePoints'),
      value: servicePointCount,
      icon: 'solar:bill-list-bold-duotone',
    },
    {
      label: t('restaurantDetail.metrics.menu'),
      value: summary.menuItems,
      icon: 'solar:menu-dots-square-bold-duotone',
    },
    {
      label: t('restaurantDetail.metrics.devices'),
      value: `${summary.onlineDevices}/${summary.activeDevices}`,
      icon: 'solar:devices-bold-duotone',
    },
  ] as const;

  return (
    <SectionCard title={t('restaurantDetail.glance')} icon="solar:chart-square-bold-duotone">
      <Stack spacing={2} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
        {rows.map((row) => (
          <Stack key={row.label} direction="row" alignItems="center" spacing={1.5}>
            <Iconify icon={row.icon} width={22} sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
              {row.label}
            </Typography>
            <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {row.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </SectionCard>
  );
}

function ReadinessSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const readiness = restaurant.setupReadiness;
  const pendingSteps = readiness.steps.filter((step) => step.status !== 'ready');
  const readySteps = readiness.steps.filter((step) => step.status === 'ready');

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
      <Stack spacing={1.25}>
        <Typography variant="body2" color="text.secondary">
          {t('restaurantDetail.readiness.completedCount', {
            ready: readySteps.length,
            total: readiness.steps.length,
          })}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={readiness.progressPercent}
          color={readiness.ready ? 'success' : 'warning'}
          sx={{ height: 8, borderRadius: 1 }}
        />
        <Typography variant="body2" color={readiness.ready ? 'success.main' : 'text.secondary'}>
          {readiness.ready
            ? t('restaurantDetail.readiness.readyHint')
            : t('restaurantDetail.readiness.blockingHint', { count: readiness.blockingIssueCount })}
        </Typography>
      </Stack>

      {pendingSteps.length ? (
        <Stack spacing={1.25} sx={{ mt: 3 }}>
          {pendingSteps.map((step) => (
            <ReadinessIssueRow key={step.id} step={step} />
          ))}
        </Stack>
      ) : null}

      {readySteps.length ? (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1.25 }}>
            {t('restaurantDetail.readiness.completedLabel')}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {readySteps.map((step) => (
              <Chip
                key={step.id}
                size="small"
                variant="soft"
                color="success"
                icon={<Iconify icon="solar:check-circle-bold" width={16} />}
                label={t(`restaurantDetail.readiness.steps.${step.id}`, { defaultValue: step.id })}
              />
            ))}
          </Stack>
        </Box>
      ) : null}
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

const DETAIL_GRID_PAGE_SIZE = 5;
const DETAIL_GRID_ROW_HEIGHT = 68;
const DETAIL_GRID_HEADER_HEIGHT = 52;
const DETAIL_GRID_FOOTER_HEIGHT = 52;

function getNameInitials(name: string) {
  const parts = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  return (
    parts.length > 1 ? `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}` : parts[0]?.slice(0, 2) || '?'
  ).toLocaleUpperCase();
}

function detailGridHeight(rowCount: number) {
  if (rowCount === 0) return 200;
  return (
    DETAIL_GRID_HEADER_HEIGHT +
    Math.min(rowCount, DETAIL_GRID_PAGE_SIZE) * DETAIL_GRID_ROW_HEIGHT +
    (rowCount > DETAIL_GRID_PAGE_SIZE ? DETAIL_GRID_FOOTER_HEIGHT : 0)
  );
}

const detailGridSx = {
  border: 0,
  borderTop: '1px solid',
  borderColor: 'divider',
  '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
  '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 600, color: 'text.secondary' },
  '& .MuiDataGrid-cell': { display: 'flex', alignItems: 'center' },
  '& .MuiDataGrid-row:hover': { bgcolor: 'action.hover' },
  '& .MuiDataGrid-footerContainer': { borderTop: '1px solid', borderColor: 'divider' },
};

function DetailGridEmptyState({ icon, text }: { icon: IconifyName; text: string }) {
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={1}
      sx={{ height: 1, minHeight: 150, px: 3, textAlign: 'center' }}>
      <Iconify icon={icon} width={32} sx={{ color: 'text.disabled' }} />
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Stack>
  );
}

function BranchNetworkSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t, currentLang } = useTranslate('organizations');
  const isWide = useMediaQuery('(min-width:600px)');
  const columns: GridColDef<AdminRestaurantBranchSummary>[] = [
    {
      field: 'name',
      headerName: t('fields.name'),
      flex: 1.6,
      minWidth: 260,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar
            variant="rounded"
            sx={{ width: 36, height: 36, bgcolor: 'primary.lighter', color: 'primary.dark', fontSize: 12 }}>
            {getNameInitials(row.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              component={RouterLink}
              href={RouterPathHelper.organizationRestaurantDetail(row.id)}
              variant="subtitle2"
              color="text.primary"
              noWrap
              sx={{ display: 'block', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {row.address || t('labels.notSelected')}
            </Typography>
          </Box>
        </Stack>
      ),
    },
    {
      field: 'isActive',
      headerName: t('fields.status'),
      minWidth: 120,
      flex: 0.7,
      renderCell: ({ row }) => <BranchStatus branch={row} />,
    },
    {
      field: 'activeUsersCount',
      headerName: t('portfolio.columns.staff'),
      type: 'number',
      minWidth: 115,
      flex: 0.7,
      align: 'center',
      headerAlign: 'center',
    },
    {
      field: 'onlineDeviceCount',
      headerName: t('portfolio.columns.devices'),
      type: 'number',
      minWidth: 135,
      flex: 0.75,
      align: 'center',
      headerAlign: 'center',
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {row.onlineDeviceCount}/{row.activeDeviceCount}
        </Typography>
      ),
    },
    {
      field: 'lastSeenAt',
      headerName: t('portfolio.columns.lastSeen'),
      minWidth: 180,
      flex: 0.9,
      renderCell: ({ row }) => (
        <Typography variant="body2" color={row.lastSeenAt ? 'text.primary' : 'text.secondary'} noWrap>
          {row.lastSeenAt ? formatDateTime(row.lastSeenAt) : t('portfolio.noActivity')}
        </Typography>
      ),
    },
  ];

  return (
    <SectionCard
      title={t('restaurantDetail.sections.branches')}
      icon="solar:buildings-2-bold-duotone"
      flush
      action={
        <Chip
          size="small"
          variant="soft"
          label={t('restaurantDetail.branchCount', { count: restaurant.branches.length })}
        />
      }>
      {!isWide && (
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          {restaurant.branches.length ? (
            <Stack divider={<Divider flexItem />}>
              {restaurant.branches.map((branch) => (
                <Stack key={branch.id} spacing={1.25} sx={{ p: 2.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1.25}>
                    <Avatar
                      variant="rounded"
                      sx={{ width: 38, height: 38, bgcolor: 'primary.lighter', color: 'primary.dark', fontSize: 12 }}>
                      {getNameInitials(branch.name)}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        component={RouterLink}
                        href={RouterPathHelper.organizationRestaurantDetail(branch.id)}
                        variant="subtitle2"
                        color="text.primary"
                        sx={{ display: 'block', textDecoration: 'none', overflowWrap: 'anywhere' }}>
                        {branch.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {branch.address || t('labels.notSelected')}
                      </Typography>
                    </Box>
                    <BranchStatus branch={branch} />
                  </Stack>
                  <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" sx={{ pl: 6.25 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('portfolio.columns.staff')}: {branch.activeUsersCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('portfolio.columns.devices')}: {branch.onlineDeviceCount}/{branch.activeDeviceCount}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ pl: 6.25 }}>
                    {t('portfolio.columns.lastSeen')}:{' '}
                    {branch.lastSeenAt ? formatDateTime(branch.lastSeenAt) : t('portfolio.noActivity')}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          ) : (
            <DetailGridEmptyState icon="solar:buildings-2-linear" text={t('restaurantDetail.emptyBranches')} />
          )}
        </Box>
      )}
      {isWide && (
        <Box sx={{ height: detailGridHeight(restaurant.branches.length), width: 1 }}>
          <DataGrid
            rows={restaurant.branches}
            columns={columns}
            localeText={getDataGridLocaleText(currentLang.value)}
            columnHeaderHeight={DETAIL_GRID_HEADER_HEIGHT}
            rowHeight={DETAIL_GRID_ROW_HEIGHT}
            hideFooter={restaurant.branches.length <= DETAIL_GRID_PAGE_SIZE}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: DETAIL_GRID_PAGE_SIZE } } }}
            pageSizeOptions={[5, 10, 25]}
            showToolbar={false}
            disableColumnMenu
            slots={{
              noRowsOverlay: () => (
                <DetailGridEmptyState icon="solar:buildings-2-linear" text={t('restaurantDetail.emptyBranches')} />
              ),
            }}
            sx={detailGridSx}
          />
        </Box>
      )}
    </SectionCard>
  );
}

function ActiveUsersSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t, currentLang } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  const isWide = useMediaQuery('(min-width:600px)');
  const columns: GridColDef<AdminRestaurantActiveUser>[] = [
    {
      field: 'fullName',
      headerName: t('fields.name'),
      minWidth: 260,
      flex: 1.4,
      renderCell: ({ row }) => (
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.lighter', color: 'primary.dark', fontSize: 13 }}>
            {getNameInitials(row.fullName)}
          </Avatar>
          <Typography variant="subtitle2" noWrap>
            {row.fullName}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'username',
      headerName: tPlatform('fields.username'),
      minWidth: 180,
      flex: 1,
      renderCell: ({ row }) => (
        <Typography variant="body2" color="text.secondary" noWrap>
          {row.username}
        </Typography>
      ),
    },
    {
      field: 'role',
      headerName: t('fields.role'),
      minWidth: 150,
      flex: 0.8,
      valueGetter: (_value, row) => row.role?.name ?? '',
      renderCell: ({ row }) => <Chip size="small" variant="soft" label={row.role?.name ?? t('labels.notSelected')} />,
    },
  ];

  return (
    <SectionCard
      title={t('restaurantDetail.sections.staff')}
      icon="solar:users-group-rounded-bold-duotone"
      flush
      action={<Chip size="small" variant="soft" label={restaurant.activeUsers.length} />}>
      {!isWide && (
        <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          {restaurant.activeUsers.length ? (
            <Stack divider={<Divider flexItem />}>
              {restaurant.activeUsers.map((user) => (
                <Stack key={user.id} direction="row" alignItems="center" spacing={1.5} sx={{ p: 2.5 }}>
                  <Avatar
                    sx={{ width: 38, height: 38, bgcolor: 'primary.lighter', color: 'primary.dark', fontSize: 13 }}>
                    {getNameInitials(user.fullName)}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                      {user.fullName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.username}
                    </Typography>
                  </Box>
                  <Chip size="small" variant="soft" label={user.role?.name ?? t('labels.notSelected')} />
                </Stack>
              ))}
            </Stack>
          ) : (
            <DetailGridEmptyState icon="solar:users-group-rounded-linear" text={t('empty.activeUsers')} />
          )}
        </Box>
      )}
      {isWide && (
        <Box sx={{ height: detailGridHeight(restaurant.activeUsers.length), width: 1 }}>
          <DataGrid
            rows={restaurant.activeUsers}
            columns={columns}
            localeText={getDataGridLocaleText(currentLang.value)}
            columnHeaderHeight={DETAIL_GRID_HEADER_HEIGHT}
            rowHeight={DETAIL_GRID_ROW_HEIGHT}
            hideFooter={restaurant.activeUsers.length <= DETAIL_GRID_PAGE_SIZE}
            initialState={{ pagination: { paginationModel: { page: 0, pageSize: DETAIL_GRID_PAGE_SIZE } } }}
            pageSizeOptions={[5, 10, 25]}
            showToolbar={false}
            disableColumnMenu
            slots={{
              noRowsOverlay: () => (
                <DetailGridEmptyState icon="solar:users-group-rounded-linear" text={t('empty.activeUsers')} />
              ),
            }}
            sx={detailGridSx}
          />
        </Box>
      )}
    </SectionCard>
  );
}

function ContactInformationSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const emptyValue = t('labels.notSelected');
  const rows = [
    { label: t('fields.phone'), value: restaurant.phone || emptyValue, icon: 'solar:phone-bold-duotone' },
    { label: t('fields.social'), value: restaurant.social || emptyValue, icon: 'solar:chat-round-dots-bold-duotone' },
    { label: t('fields.address'), value: restaurant.address || emptyValue, icon: 'solar:map-point-bold-duotone' },
  ] as const;

  return (
    <SectionCard title={t('restaurantDetail.contact')} icon="solar:letter-bold-duotone">
      <Stack spacing={2} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
        {rows.map((row) => (
          <InfoRow key={row.label} {...row} />
        ))}
      </Stack>
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
      <Stack spacing={2} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
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
      value: restaurant.serviceFeeEnabled
        ? restaurant.serviceFeeMode === 'formula'
          ? t('fields.serviceFeeModeFormula')
          : restaurant.serviceFeeMode === 'hourly'
            ? `${enabled} · ${Number(restaurant.serviceFeeHourlyRate ?? 0).toLocaleString()} UZS/soat`
            : `${enabled} · ${restaurant.serviceFeePercent}%`
        : disabled,
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
  selectedTab: 'overview' | 'people' | 'branches' | 'settings';
};

export function RestaurantDetailSections({ restaurant, selectedTab }: RestaurantDetailSectionsProps) {
  if (selectedTab === 'people') return <ActiveUsersSection restaurant={restaurant} />;
  if (selectedTab === 'branches') return <BranchNetworkSection restaurant={restaurant} />;
  if (selectedTab === 'settings') {
    return (
      <Grid container spacing={3} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 6 }}>
          <ServiceSettingsSection restaurant={restaurant} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SoliqIntegrationSection restaurant={restaurant} />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} alignItems="flex-start">
      <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'grid', gap: 3 }}>
        <OperationsOverview restaurant={restaurant} />
        <ContactInformationSection restaurant={restaurant} />
      </Grid>
      <Grid size={{ xs: 12, md: 8 }} sx={{ display: 'grid', gap: 3 }}>
        <CustomerOverviewSection restaurant={restaurant} />
        <ReadinessSection restaurant={restaurant} />
      </Grid>
    </Grid>
  );
}
