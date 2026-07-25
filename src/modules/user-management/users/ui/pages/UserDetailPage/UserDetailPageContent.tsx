import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import { usePageTitle } from 'shared/hooks/use-page-title';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
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

import {
  DenseRow,
  DetailField,
  formatBirthDate,
  getUserInitials,
  HallChips,
  ProfileMetric,
  resolveStatusColor,
  SectionCard,
  SummaryChip,
  type UserEntry,
} from './UserDetailPrimitives';

const HALL_ACCESS_PERMISSION_CODES = [
  'pos_halls.view',
  'pos_tables.manage',
  'pos_table_menu.view',
  'pos_table_reservations.manage',
] as const;

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
  const detailTitle = isEmployeeSurface ? t('pages.employeeView.title') : t('pages.view.title');
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
    { label: t('fields.phone'), value: user.phone, icon: 'solar:phone-bold-duotone' },
    { label: t('fields.role'), value: roleLabel, icon: 'solar:shield-user-bold-duotone' },
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
  const filledPayrollEntries = payrollEntries.filter(
    (entry) => entry.value !== null && entry.value !== undefined && entry.value !== '',
  );

  const overviewEntries: UserEntry[] = [
    { label: t('fields.permissionsCount'), value: permissionsCount, icon: 'solar:shield-keyhole-bold-duotone' },
    { label: t('labels.system'), value: user.isSuperuser ? yesLabel : noLabel, icon: 'solar:shield-star-bold-duotone' },
    {
      label: t('fields.restaurantAccess'),
      value: restaurantAccessLabel,
      icon: 'solar:shop-2-bold-duotone',
    },
  ];

  return (
    <Content>
      <Box sx={{ width: 1, maxWidth: 1440, mx: 'auto' }}>
        <CustomBreadcrumbs
          heading={detailTitle}
          action={
            <Stack direction="row" spacing={1}>
              <BackToListButton href={isEmployeeSurface ? RoutePath.employeeList : RoutePath.userList} />
              {!isEmployeeSurface || canEditEmployee ? (
                <Button
                  component={RouterLink}
                  href={isEmployeeSurface ? RouterPathHelper.employeeEdit(user.id) : RouterPathHelper.userEdit(user.id)}
                  variant="contained"
                  color="black"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  data-testid="user-view-edit">
                  {t('actions.edit')}
                </Button>
              ) : null}
            </Stack>
          }
          sx={{ mb: 2.5 }}
        />

        <Stack spacing={2.5}>
          <Card sx={{ p: { xs: 2, md: 3 } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  lg: 'minmax(320px, 1.5fr) repeat(3, minmax(150px, 0.55fr))',
                },
                gap: 2,
                alignItems: 'stretch',
              }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, py: { lg: 0.5 } }}>
                <Avatar
                  sx={(theme) => ({
                    width: { xs: 64, md: 76 },
                    height: { xs: 64, md: 76 },
                    fontWeight: 700,
                    fontSize: { xs: 22, md: 26 },
                    color: 'primary.main',
                    bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
                    flexShrink: 0,
                  })}>
                  {initials}
                </Avatar>

                <Stack spacing={1} sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                    <Typography variant="h4" sx={{ overflowWrap: 'anywhere' }}>
                      {user.fullName}
                    </Typography>
                    <Label color={resolveStatusColor(currentStatus)} variant="soft">
                      {t(`status.${currentStatus}`)}
                    </Label>
                  </Stack>
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                    {!isEmployeeSurface || showEmployeeUsername ? (
                      <SummaryChip title={t('fields.username')}>@{user.username}</SummaryChip>
                    ) : null}
                    {hasHallAccessPermission ? (
                      <SummaryChip title={t('fields.primaryHall')} icon="solar:home-2-bold-duotone">
                        {primaryHallName}
                      </SummaryChip>
                    ) : null}
                    {salaryTypeLabel ? (
                      <SummaryChip title={t('fields.salaryType')} icon="solar:wallet-money-bold-duotone">
                        {salaryTypeLabel}
                      </SummaryChip>
                    ) : null}
                  </Stack>
                </Stack>
              </Stack>

              <ProfileMetric label={t('fields.phone')} value={user.phone} icon="solar:phone-bold-duotone" />
              <ProfileMetric label={t('fields.role')} value={roleLabel} icon="solar:shield-user-bold-duotone" />
              <ProfileMetric
                label={t('fields.permissionsCount')}
                value={permissionsCount}
                icon="solar:shield-keyhole-bold-duotone"
              />
            </Box>
          </Card>

          <Grid container spacing={2.5} alignItems="flex-start">
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={2.5}>
                <SectionCard title={t('sections.account')} icon="solar:user-id-bold-duotone">
                  <Grid container spacing={1.5}>
                    {accountEntries.map((item) => (
                      <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                        <DetailField {...item} />
                      </Grid>
                    ))}
                  </Grid>
                </SectionCard>

                {filledPayrollEntries.length ? (
                  <SectionCard title={t('sections.payroll')} icon="solar:wallet-money-bold-duotone">
                    <Grid container spacing={1.5}>
                      {filledPayrollEntries.map((item) => (
                        <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                          <DetailField {...item} />
                        </Grid>
                      ))}
                    </Grid>
                  </SectionCard>
                ) : null}
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={2.5}>
                <SectionCard title={t('sections.access')} icon="solar:shield-keyhole-bold-duotone">
                  <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                    {overviewEntries.map((item) => (
                      <DenseRow key={item.label} {...item} />
                    ))}
                  </Stack>
                </SectionCard>

                {hasHallAccessPermission ? (
                  <SectionCard title={t('sections.assignment')} icon="solar:layers-bold-duotone">
                    <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                      {hallEntries.map((item) => (
                        <DenseRow key={item.label} {...item} />
                      ))}
                    </Stack>
                  </SectionCard>
                ) : null}
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Box>
    </Content>
  );
};
