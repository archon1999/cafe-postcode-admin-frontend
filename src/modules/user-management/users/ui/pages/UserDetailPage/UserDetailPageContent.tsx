import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';
import type { ReactNode } from 'react';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import { usePageTitle } from 'shared/hooks/use-page-title';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { EmptyValueChip, renderEmptyValue } from 'shared/ui/EmptyValue';
import { Iconify, type IconifyName } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { RouterLink } from 'shared/ui/RouterLink';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatMoney } from 'shared/utils/format-money';

import {
  useEmployeeUpdateAccess,
  useGetEmployeeByIdQuery,
  useGetHallsQuery,
  useGetUserByIdQuery,
} from '../../../application';
import { roleRequiresEmployeeCredentials, type UserManagementSurface } from '../../../domain';

type UserEntry = {
  label: string;
  value?: ReactNode;
  icon: IconifyName;
};

const HALL_ACCESS_PERMISSION_CODES = [
  'pos_halls.view',
  'pos_tables.manage',
  'pos_table_menu.view',
  'pos_table_reservations.manage',
] as const;

function getUserInitials(fullName: string) {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatBirthDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('uz-UZ').format(parsedDate);
}

function resolveStatusColor(status: 'active' | 'inactive' | 'archived') {
  if (status === 'active') {
    return 'success' as const;
  }

  if (status === 'inactive') {
    return 'warning' as const;
  }

  return 'default' as const;
}

function SectionCard({ title, icon, children }: { title: string; icon: IconifyName; children: ReactNode }) {
  return (
    <Card sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={(theme) => ({
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.1),
            })}>
            <Iconify icon={icon} width={18} />
          </Box>

          <Typography variant="subtitle1">{title}</Typography>
        </Stack>

        {children}
      </Stack>
    </Card>
  );
}

function DenseRow({ label, value, icon }: UserEntry) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start" justifyContent="space-between">
      <Stack direction="row" spacing={1.1} alignItems="center" sx={{ minWidth: 0 }}>
        <Box
          sx={(theme) => ({
            width: 28,
            height: 28,
            borderRadius: 1.25,
            display: 'grid',
            placeItems: 'center',
            color: 'text.secondary',
            bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
            flexShrink: 0,
          })}>
          <Iconify icon={icon} width={15} />
        </Box>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
      </Stack>

      <Box sx={{ typography: 'subtitle2', textAlign: 'right', minWidth: 0 }}>{renderEmptyValue(value)}</Box>
    </Stack>
  );
}

function HallChips({ halls }: { halls: string[] }) {
  if (!halls.length) {
    return <EmptyValueChip />;
  }

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {halls.map((hall) => (
        <Label key={hall} variant="soft" color="default">
          {hall}
        </Label>
      ))}
    </Stack>
  );
}

function SummaryChip({ title, children, icon }: { title: string; children: ReactNode; icon?: IconifyName }) {
  return (
    <Tooltip title={title} arrow>
      <Box component="span">
        <Label variant="soft" color="default" startIcon={icon ? <Iconify icon={icon} width={14} /> : undefined}>
          {children}
        </Label>
      </Box>
    </Tooltip>
  );
}

export type UserDetailPageContentProps = {
  id?: string;
  surface?: UserManagementSurface;
};

export const UserDetailPageContent = ({ id, surface = 'user' }: UserDetailPageContentProps) => {
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');

  const isEmployeeSurface = surface === 'employee';
  const canEditEmployee = useEmployeeUpdateAccess();
  const systemUserQuery = useGetUserByIdQuery(id ?? '', { enabled: Boolean(id) && !isEmployeeSurface });
  const employeeUserQuery = useGetEmployeeByIdQuery(id ?? '', { enabled: Boolean(id) && isEmployeeSurface });
  const userQuery = isEmployeeSurface ? employeeUserQuery : systemUserQuery;
  const user = userQuery.data;
  const listTitle = isEmployeeSurface ? t('pages.employeeList.title') : t('pages.list.title');
  const detailTitle = isEmployeeSurface
    ? t('pages.employeeView.title')
    : t('pages.view.title');
  const hasHallAccessPermission = Boolean(
    user?.permissionCodes?.some((permissionCode) => HALL_ACCESS_PERMISSION_CODES.includes(permissionCode as never)),
  );
  const hallsQuery = useGetHallsQuery({ enabled: Boolean(user) && hasHallAccessPermission });

  usePageTitle(user?.fullName ? [listTitle, user.fullName] : [listTitle, detailTitle]);

  if (userQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return (
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {tCommon('labels.notFound')}
      </Typography>
    );
  }

  const yesLabel = tCommon('labels.yes');
  const noLabel = tCommon('labels.no');
  const currentStatus = user.employmentStatus ?? (user.isActive ? 'active' : 'inactive');
  const roleLabel = user.role?.name ?? t('labels.withoutRole');
  const showEmployeeUsername = isEmployeeSurface && roleRequiresEmployeeCredentials(user.role?.code);
  const primaryHall = (hallsQuery.data ?? []).find((hall) => hall.id === user.primaryHallId);
  const primaryHallName = primaryHall
    ? formatHallDisplayName(primaryHall.name, undefined, tCommon)
    : t('labels.notSelected');
  const allowedHalls = (hallsQuery.data ?? [])
    .filter((hall) => user.allowedHallIds?.includes(hall.id))
    .map((hall) => formatHallDisplayName(hall.name, undefined, tCommon));
  const birthDate = formatBirthDate(user.birthDate);
  const initials = getUserInitials(user.fullName);
  const permissionsCount = `${user.permissionCodes.length} ta`;
  const salaryTypeLabel = user.salaryType ? t(`salaryType.${user.salaryType}`) : null;
  const baseAmountLabel =
    user.baseAmount !== null && user.baseAmount !== undefined ? formatMoney(user.baseAmount) : null;
  const kpiLabel = user.kpiPercent !== null && user.kpiPercent !== undefined ? `${user.kpiPercent}%` : null;
  const restaurantAccessLabel =
    user.restaurantAccessActive === undefined ? null : user.restaurantAccessActive ? yesLabel : noLabel;

  const accountEntries: UserEntry[] = [
    { label: t('fields.fullName'), value: user.fullName, icon: 'solar:card-bold-duotone' },
    { label: t('fields.phone'), value: user.phone, icon: 'solar:phone-bold-duotone' },
    { label: t('fields.role'), value: roleLabel, icon: 'solar:shield-user-bold-duotone' },
    { label: t('fields.employmentStatus'), value: t(`status.${currentStatus}`), icon: 'solar:user-check-bold-duotone' },
  ];
  if (!isEmployeeSurface || showEmployeeUsername) {
    accountEntries.unshift({ label: t('fields.username'), value: user.username, icon: 'solar:user-bold-duotone' });
  }

  const hallEntries: UserEntry[] = [
    { label: t('fields.primaryHall'), value: primaryHallName, icon: 'solar:home-2-bold-duotone' },
    { label: t('fields.allowedHalls'), value: <HallChips halls={allowedHalls} />, icon: 'solar:layers-bold-duotone' },
    {
      label: t('fields.hallSwitchPermission'),
      value: user.hallSwitchPermission ? yesLabel : noLabel,
      icon: 'solar:transfer-horizontal-bold-duotone',
    },
  ];

  const payrollEntries: UserEntry[] = [
    { label: t('fields.passportSeries'), value: user.passportSeries, icon: 'solar:passport-bold-duotone' },
    { label: t('fields.pnfl'), value: user.pnfl, icon: 'solar:clipboard-text-bold-duotone' },
    { label: t('fields.birthDate'), value: birthDate, icon: 'solar:calendar-bold-duotone' },
    { label: t('fields.salaryType'), value: salaryTypeLabel, icon: 'solar:wallet-money-bold-duotone' },
    { label: t('fields.baseAmount'), value: baseAmountLabel, icon: 'solar:bill-list-bold-duotone' },
    { label: t('fields.kpiPercent'), value: kpiLabel, icon: 'solar:chart-square-bold-duotone' },
  ];

  const overviewEntries: UserEntry[] = [
    {
      label: t('fields.status'),
      value: (
        <Label color={resolveStatusColor(currentStatus)} variant="soft">
          {t(`status.${currentStatus}`)}
        </Label>
      ),
      icon: 'solar:verified-check-bold-duotone',
    },
    { label: t('fields.permissionsCount'), value: permissionsCount, icon: 'solar:shield-keyhole-bold-duotone' },
    { label: t('labels.system'), value: user.isSuperuser ? yesLabel : noLabel, icon: 'solar:shield-star-bold-duotone' },
    { label: 'Restoran accessi', value: restaurantAccessLabel, icon: 'solar:shop-2-bold-duotone' },
  ];

  return (
    <Content>
      <CustomBreadcrumbs
        heading={detailTitle}
        links={[
          {
            name: listTitle,
            href: isEmployeeSurface ? RoutePath.employeeList : RoutePath.userList,
          },
          { name: user.fullName },
        ]}
        action={
          !isEmployeeSurface || canEditEmployee ? (
            <Button
              component={RouterLink}
              href={isEmployeeSurface ? RouterPathHelper.employeeEdit(user.id) : RouterPathHelper.userEdit(user.id)}
              variant="contained"
              color="black"
              startIcon={<Iconify icon="solar:pen-bold" />}
              data-testid="user-view-edit">
              {t('actions.edit')}
            </Button>
          ) : undefined
        }
        sx={{ mb: 2.5 }}
      />

      <Stack spacing={2.5}>
        <Card sx={{ p: { xs: 2, md: 2.5 } }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Avatar
                sx={(theme) => ({
                  width: 60,
                  height: 60,
                  fontWeight: 700,
                  fontSize: 22,
                  color: 'primary.main',
                  bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
                })}>
                {initials}
              </Avatar>

              <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                  <Typography variant="h5">{user.fullName}</Typography>
                  <Label color={resolveStatusColor(currentStatus)} variant="soft">
                    {t(`status.${currentStatus}`)}
                  </Label>
                </Stack>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {!isEmployeeSurface || showEmployeeUsername ? (
                    <SummaryChip title={t('fields.username')}>@{user.username}</SummaryChip>
                  ) : null}
                  <SummaryChip title={t('fields.role')}>{roleLabel}</SummaryChip>
                  {hasHallAccessPermission ? (
                    <SummaryChip title={t('fields.allowedHalls')} icon="solar:layers-bold-duotone">
                      {allowedHalls.length ? `${allowedHalls.length} ta zal` : t('labels.notSelected')}
                    </SummaryChip>
                  ) : null}
                  {user.isSuperuser ? <SummaryChip title={t('labels.system')}>{t('labels.system')}</SummaryChip> : null}
                </Stack>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <SummaryChip title={t('fields.phone')} icon="solar:phone-bold-duotone">
                {renderEmptyValue(user.phone)}
              </SummaryChip>
              <SummaryChip title={t('fields.salaryType')} icon="solar:wallet-money-bold-duotone">
                {renderEmptyValue(salaryTypeLabel)}
              </SummaryChip>
            </Stack>
          </Stack>
        </Card>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <Card sx={{ p: 0 }}>
              <Grid container>
                <Grid size={{ xs: 12, md: hasHallAccessPermission ? 6 : 12 }}>
                  <Box sx={{ p: 2.5 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      {t('sections.account')}
                    </Typography>
                    <Stack spacing={1.5} divider={<Divider flexItem />}>
                      {accountEntries.map((item) => (
                        <DenseRow key={item.label} {...item} />
                      ))}
                    </Stack>
                  </Box>
                </Grid>

                {hasHallAccessPermission ? (
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Box sx={{ p: 2.5 }}>
                      <Typography variant="subtitle1" sx={{ mb: 2 }}>
                        {t('sections.assignment')}
                      </Typography>
                      <Stack spacing={1.5} divider={<Divider flexItem />}>
                        {hallEntries.map((item) => (
                          <DenseRow key={item.label} {...item} />
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                ) : null}

                <Grid size={{ xs: 12 }}>
                  <Box sx={{ p: 2.5, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle1" sx={{ mb: 2 }}>
                      {t('sections.payroll')}
                    </Typography>
                    <Grid container spacing={1.5}>
                      {payrollEntries.map((item) => (
                        <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                          <DenseRow {...item} />
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Grid>
              </Grid>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Stack spacing={2}>
              <SectionCard title={t('fields.status')} icon="solar:verified-check-bold-duotone">
                <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                  {overviewEntries.map((item) => (
                    <DenseRow key={item.label} {...item} />
                  ))}
                </Stack>
              </SectionCard>

              {hasHallAccessPermission ? (
                <SectionCard title={t('fields.allowedHalls')} icon="solar:layers-bold-duotone">
                  <HallChips halls={allowedHalls} />
                </SectionCard>
              ) : null}
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Content>
  );
};
