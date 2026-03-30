import { useState, type ReactNode } from 'react';

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
import { EmptyValueChip, renderEmptyValue } from 'shared/ui/EmptyValue';
import { useParams } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify, type IconifyName } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { RouterLink } from 'shared/ui/RouterLink';
import { getAdminRoleLabel } from 'shared/utils/admin-role';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatMoney } from 'shared/utils/format-money';

import { useGetHallsQuery, useGetUserByIdQuery } from '../../../application';

type ViewVariant = 'compact' | 'split' | 'minimal';

type UserEntry = {
  label: string;
  value?: ReactNode;
  icon: IconifyName;
};

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

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: IconifyName;
  children: ReactNode;
}) {
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

function DetailTile({ label, value, icon }: UserEntry) {
  return (
    <Box
      sx={(theme) => ({
        p: 1.75,
        height: '100%',
        borderRadius: 2,
        border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.14)}`,
        bgcolor: 'background.neutral',
      })}>
      <Stack spacing={1.1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={(theme) => ({
              width: 30,
              height: 30,
              borderRadius: 1.25,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
            })}>
            <Iconify icon={icon} width={16} />
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary', letterSpacing: 0.2 }}>
            {label}
          </Typography>
        </Stack>

        <Box sx={{ typography: 'subtitle2', minHeight: 24 }}>{renderEmptyValue(value)}</Box>
      </Stack>
    </Box>
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

function StatBox({ label, value, icon }: UserEntry) {
  return (
    <Box
      sx={(theme) => ({
        p: 1.75,
        borderRadius: 2,
        border: `1px solid ${varAlpha(theme.vars.palette.grey['500Channel'], 0.14)}`,
        bgcolor: 'background.paper',
      })}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={(theme) => ({
              width: 28,
              height: 28,
              borderRadius: 1.25,
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              bgcolor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
            })}>
            <Iconify icon={icon} width={15} />
          </Box>

          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {label}
          </Typography>
        </Stack>

        <Box sx={{ typography: 'subtitle2' }}>{renderEmptyValue(value)}</Box>
      </Stack>
    </Box>
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

const variantOptions: Array<{ value: ViewVariant; label: string; hint: string }> = [
  { value: 'compact', label: '1. Kompakt', hint: "Kartali ko'rinish" },
  { value: 'split', label: '2. Split', hint: "Chap summary + o'ng tafsilot" },
  { value: 'minimal', label: '3. Minimal', hint: 'Sokin va zich layout' },
];

const ViewUserPage = () => {
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const [variant, setVariant] = useState<ViewVariant>('compact');

  const userQuery = useGetUserByIdQuery(id ?? '');
  const hallsQuery = useGetHallsQuery();

  if (userQuery.isLoading) {
    return <LoadingScreen />;
  }

  const user = userQuery.data;

  if (!user) {
    return (
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {tCommon('labels.notFound')}
      </Typography>
    );
  }

  const yesLabel = tCommon('labels.yes', { defaultValue: 'Ha' });
  const noLabel = tCommon('labels.no', { defaultValue: "Yo'q" });
  const currentStatus = user.employmentStatus ?? (user.isActive ? 'active' : 'inactive');
  const roleLabel = getAdminRoleLabel(user.role, t) ?? t('labels.withoutRole');
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
    { label: t('fields.username'), value: user.username, icon: 'solar:user-bold-duotone' },
    { label: t('fields.fullName'), value: user.fullName, icon: 'solar:card-bold-duotone' },
    { label: t('fields.phone'), value: user.phone, icon: 'solar:phone-bold-duotone' },
    { label: t('fields.role'), value: roleLabel, icon: 'solar:shield-user-bold-duotone' },
  ];

  const assignmentEntries: UserEntry[] = [
    { label: t('fields.employmentStatus'), value: t(`status.${currentStatus}`), icon: 'solar:user-check-bold-duotone' },
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

  const quickStats: UserEntry[] = [
    { label: t('fields.primaryHall'), value: primaryHallName, icon: 'solar:home-2-bold-duotone' },
    {
      label: t('fields.allowedHalls'),
      value: allowedHalls.length ? `${allowedHalls.length} ta` : null,
      icon: 'solar:layers-bold-duotone',
    },
    { label: t('fields.salaryType'), value: salaryTypeLabel, icon: 'solar:wallet-money-bold-duotone' },
    { label: t('fields.permissionsCount'), value: permissionsCount, icon: 'solar:checklist-minimalistic-bold-duotone' },
  ];

  const summaryCard = (
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
              <Label variant="soft" color="default">
                @{user.username}
              </Label>
              <Label variant="soft" color="default">
                {roleLabel}
              </Label>
              {user.isSuperuser ? (
                <Label variant="soft" color="warning">
                  {t('labels.system')}
                </Label>
              ) : null}
            </Stack>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Label variant="soft" color="default" startIcon={<Iconify icon="solar:phone-bold-duotone" width={14} />}>
            {renderEmptyValue(user.phone)}
          </Label>
          <Label variant="soft" color="default" startIcon={<Iconify icon="solar:layers-bold-duotone" width={14} />}>
            {allowedHalls.length ? `${allowedHalls.length} ta zal` : t('labels.notSelected')}
          </Label>
          <Label
            variant="soft"
            color="default"
            startIcon={<Iconify icon="solar:wallet-money-bold-duotone" width={14} />}>
            {renderEmptyValue(salaryTypeLabel)}
          </Label>
        </Stack>
      </Stack>
    </Card>
  );

  const renderCompactVariant = () => (
    <Stack spacing={2.5}>
      {summaryCard}

      <Grid container spacing={2}>
        {quickStats.map((item) => (
          <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
            <StatBox {...item} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title={t('sections.account')} icon="solar:user-id-bold-duotone">
            <Grid container spacing={1.5}>
              {accountEntries.map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                  <DetailTile {...item} />
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <SectionCard title={t('sections.assignment')} icon="solar:buildings-2-bold-duotone">
            <Grid container spacing={1.5}>
              {assignmentEntries.map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: item.label === t('fields.allowedHalls') ? 12 : 6 }}>
                  <DetailTile {...item} />
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <SectionCard title={t('sections.payroll')} icon="solar:wallet-money-bold-duotone">
            <Grid container spacing={1.5}>
              {payrollEntries.map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <DetailTile {...item} />
                </Grid>
              ))}
            </Grid>
          </SectionCard>
        </Grid>
      </Grid>
    </Stack>
  );

  const renderSplitVariant = () => (
    <Grid container spacing={2.5}>
      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={2}>
          {summaryCard}

          <SectionCard title={t('fields.status')} icon="solar:shield-keyhole-bold-duotone">
            <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
              {overviewEntries.map((item) => (
                <DenseRow key={item.label} {...item} />
              ))}
            </Stack>
          </SectionCard>
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, lg: 8 }}>
        <Stack spacing={2}>
          <SectionCard title={t('sections.account')} icon="solar:user-id-bold-duotone">
            <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
              {accountEntries.map((item) => (
                <DenseRow key={item.label} {...item} />
              ))}
            </Stack>
          </SectionCard>

          <SectionCard title={t('sections.assignment')} icon="solar:buildings-2-bold-duotone">
            <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
              {assignmentEntries.map((item) => (
                <DenseRow key={item.label} {...item} />
              ))}
            </Stack>
          </SectionCard>

          <SectionCard title={t('sections.payroll')} icon="solar:wallet-money-bold-duotone">
            <Stack spacing={1.5} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
              {payrollEntries.map((item) => (
                <DenseRow key={item.label} {...item} />
              ))}
            </Stack>
          </SectionCard>
        </Stack>
      </Grid>
    </Grid>
  );

  const renderMinimalVariant = () => (
    <Stack spacing={2.5}>
      {summaryCard}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, xl: 8 }}>
          <Card sx={{ p: 0 }}>
            <Grid container>
              <Grid size={{ xs: 12, md: 6 }}>
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

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ p: 2.5, borderLeft: { md: 1 }, borderColor: 'divider', borderTop: { xs: 1, md: 0 } }}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {t('sections.assignment')}
                  </Typography>
                  <Stack spacing={1.5} divider={<Divider flexItem />}>
                    {assignmentEntries.map((item) => (
                      <DenseRow key={item.label} {...item} />
                    ))}
                  </Stack>
                </Box>
              </Grid>

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

            <SectionCard title={t('fields.allowedHalls')} icon="solar:layers-bold-duotone">
              <HallChips halls={allowedHalls} />
            </SectionCard>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );

  return (
    <Content>
      <CustomBreadcrumbs
        heading={user.fullName}
        links={[{ name: t('pages.list.title'), href: RoutePath.userList }, { name: user.fullName }]}
        action={
          <Button
            component={RouterLink}
            href={RouterPathHelper.userEdit(user.id)}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="solar:pen-bold" />}
            data-testid="user-view-edit">
            {t('actions.edit')}
          </Button>
        }
        sx={{ mb: 2.5 }}
      />

      <Card sx={{ p: 1.25, mb: 2.5 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={1.25}
          alignItems={{ xs: 'stretch', lg: 'center' }}
          justifyContent="space-between">
          <Typography variant="body2" sx={{ color: 'text.secondary', px: 1 }}>
            3 ta preview variant. Yoqganini tanlaymiz va keyin bittasini qoldiramiz.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            {variantOptions.map((option) => (
              <Button
                key={option.value}
                size="small"
                variant={variant === option.value ? 'contained' : 'text'}
                color={variant === option.value ? 'primary' : 'inherit'}
                onClick={() => setVariant(option.value)}
                sx={{ justifyContent: 'flex-start', minWidth: { sm: 184 } }}>
                <Stack spacing={0.1} alignItems="flex-start">
                  <Box component="span">{option.label}</Box>
                  <Box component="span" sx={{ fontSize: 11, opacity: 0.72 }}>
                    {option.hint}
                  </Box>
                </Stack>
              </Button>
            ))}
          </Stack>
        </Stack>
      </Card>

      {variant === 'compact' ? renderCompactVariant() : null}
      {variant === 'split' ? renderSplitVariant() : null}
      {variant === 'minimal' ? renderMinimalVariant() : null}
    </Content>
  );
};

export default ViewUserPage;
