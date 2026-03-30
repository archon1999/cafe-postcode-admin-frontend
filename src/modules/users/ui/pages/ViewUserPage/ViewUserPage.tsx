import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import { useParams } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { LabelRowWithIcon } from 'shared/ui/LabelRowWithIcon/LabelRowWithIcon';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { RouterLink } from 'shared/ui/RouterLink';
import { getAdminRoleLabel } from 'shared/utils/admin-role';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import { useGetHallsQuery, useGetUserByIdQuery } from '../../../application';

const ViewUserPage = () => {
  const { t } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
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

  const currentStatus = user.employmentStatus ?? (user.isActive ? 'active' : 'inactive');
  const primaryHall = (hallsQuery.data ?? []).find((hall) => hall.id === user.primaryHallId);
  const allowedHalls = (hallsQuery.data ?? []).filter((hall) => user.allowedHallIds?.includes(hall.id));

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
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Typography variant="h6">{t('sections.account')}</Typography>
                <LabelRowWithIcon label={t('fields.username')} value={user.username} icon="solar:user-bold-duotone" />
                <LabelRowWithIcon label={t('fields.fullName')} value={user.fullName} icon="solar:card-bold-duotone" />
                <LabelRowWithIcon label={t('fields.phone')} value={user.phone || '-'} icon="solar:phone-bold-duotone" />
                <LabelRowWithIcon
                  label={t('fields.role')}
                  value={getAdminRoleLabel(user.role, t) ?? t('labels.withoutRole')}
                  icon="solar:shield-user-bold-duotone"
                />
                <LabelRowWithIcon
                  label={t('fields.uiMode')}
                  value={user.uiMode === 'admin' ? t('uiMode.admin') : t('uiMode.pos')}
                  icon="solar:widget-4-bold-duotone"
                />
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Typography variant="h6">{t('sections.assignment')}</Typography>
                <LabelRowWithIcon
                  label={t('fields.employmentStatus')}
                  value={t(`status.${currentStatus}`)}
                  icon="solar:user-check-bold-duotone"
                />
                <LabelRowWithIcon
                  label={t('fields.primaryHall')}
                  value={
                    primaryHall
                      ? formatHallDisplayName(primaryHall.name, primaryHall.level, tCommon)
                      : t('labels.notSelected')
                  }
                  icon="solar:home-2-bold-duotone"
                />
                <LabelRowWithIcon
                  label={t('fields.allowedHalls')}
                  value={
                    allowedHalls.length
                      ? allowedHalls.map((hall) => formatHallDisplayName(hall.name, hall.level, tCommon)).join(', ')
                      : t('labels.notSelected')
                  }
                  icon="solar:layers-bold-duotone"
                />
                <LabelRowWithIcon
                  label={t('fields.hallSwitchPermission')}
                  value={user.hallSwitchPermission ? tCommon('labels.yes') : tCommon('labels.no')}
                  icon="solar:transfer-horizontal-bold-duotone"
                />
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Typography variant="h6">{t('sections.payroll')}</Typography>
                <LabelRowWithIcon
                  label={t('fields.passportSeries')}
                  value={user.passportSeries || '-'}
                  icon="solar:passport-bold-duotone"
                />
                <LabelRowWithIcon
                  label={t('fields.pnfl')}
                  value={user.pnfl || '-'}
                  icon="solar:clipboard-text-bold-duotone"
                />
                <LabelRowWithIcon
                  label={t('fields.birthDate')}
                  value={user.birthDate || '-'}
                  icon="solar:calendar-bold-duotone"
                />
                <LabelRowWithIcon
                  label={t('fields.salaryType')}
                  value={user.salaryType ? t(`salaryType.${user.salaryType}`) : t('labels.notSelected')}
                  icon="solar:wallet-money-bold-duotone"
                />
                <LabelRowWithIcon
                  label={t('fields.baseAmount')}
                  value={user.baseAmount !== null && user.baseAmount !== undefined ? String(user.baseAmount) : '-'}
                  icon="solar:bill-list-bold-duotone"
                />
                <LabelRowWithIcon
                  label={t('fields.kpiPercent')}
                  value={user.kpiPercent !== null && user.kpiPercent !== undefined ? `${user.kpiPercent}%` : '-'}
                  icon="solar:chart-square-bold-duotone"
                />
              </Stack>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3, height: 1 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {t('fields.status')}
              </Typography>
              <Label
                color={currentStatus === 'active' ? 'success' : currentStatus === 'inactive' ? 'warning' : 'default'}
                variant="soft">
                {t(`status.${currentStatus}`)}
              </Label>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Content>
  );
};

export default ViewUserPage;
