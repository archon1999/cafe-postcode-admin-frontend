import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';
import { useState, type ReactNode } from 'react';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { renderEmptyValue } from 'shared/ui/EmptyValue';
import { Iconify } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { RouterLink } from 'shared/ui/RouterLink';

import { resolveStatusColor, type UserEntry } from './UserDetailPrimitives';

type ProfileTab = 'overview' | 'access';

type EmployeeProfileViewProps = {
  id: string;
  fullName: string;
  phone: string;
  initials: string;
  roleLabel: string;
  status: 'active' | 'inactive' | 'archived';
  canEdit: boolean;
  permissionCount: number;
  allowedHallCount: number;
  hasHallAccessPermission: boolean;
  detailEntries: UserEntry[];
  accessEntries: UserEntry[];
  hallEntries: UserEntry[];
};

function ProfileField({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.75 }}>
        {label}
      </Typography>
      <Box sx={{ typography: 'subtitle2', overflowWrap: 'anywhere' }}>{renderEmptyValue(value)}</Box>
    </Box>
  );
}

function ProfileRow({ label, value, icon }: UserEntry) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
      <Iconify icon={icon} width={20} sx={{ mt: 0.25, color: 'text.secondary', flexShrink: 0 }} />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
          {label}
        </Typography>
        <Box sx={{ typography: 'subtitle2', overflowWrap: 'anywhere' }}>{renderEmptyValue(value)}</Box>
      </Box>
    </Stack>
  );
}

export function EmployeeProfileView({
  id,
  fullName,
  phone,
  initials,
  roleLabel,
  status,
  canEdit,
  permissionCount,
  allowedHallCount,
  hasHallAccessPermission,
  detailEntries,
  accessEntries,
  hallEntries,
}: EmployeeProfileViewProps) {
  const { t } = useTranslate('users');
  const [selectedTab, setSelectedTab] = useState<ProfileTab>('overview');

  return (
    <Content>
      <Box sx={{ width: 1, maxWidth: 1440, mx: 'auto' }}>
        <CustomBreadcrumbs
          heading={t('pages.employeeView.title')}
          links={[{ name: t('pages.employeeList.title'), href: RoutePath.employeeList }, { name: fullName }]}
          action={
            <Stack direction="row" spacing={1}>
              <BackToListButton href={RoutePath.employeeList} />
              {canEdit ? (
                <Button
                  component={RouterLink}
                  href={RouterPathHelper.employeeEdit(id)}
                  variant="contained"
                  color="black"
                  startIcon={<Iconify icon="solar:pen-bold" />}
                  data-testid="user-view-edit">
                  {t('actions.edit')}
                </Button>
              ) : null}
            </Stack>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card sx={{ height: { xs: 300, md: 290 }, overflow: 'hidden' }}>
          <Box
            sx={(theme) => ({
              ...theme.mixins.bgGradient({
                images: [
                  `linear-gradient(90deg, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.88)}, ${varAlpha(theme.vars.palette.primary.darkerChannel, 0.52)})`,
                  'url(/assets/background/background-4.jpg)',
                ],
              }),
              height: 1,
              color: 'common.white',
            })}>
            <Label
              variant="soft"
              color={resolveStatusColor(status)}
              sx={{
                position: 'absolute',
                top: 24,
                right: 24,
                bgcolor: 'common.white',
                color: status === 'active' ? 'success.dark' : status === 'inactive' ? 'warning.dark' : 'text.primary',
              }}>
              {t(`status.${status}`)}
            </Label>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 2.5 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              sx={{ position: 'absolute', left: { xs: 20, md: 24 }, right: 20, bottom: { xs: 74, md: 76 } }}>
              <Avatar
                sx={{
                  width: { xs: 64, md: 112 },
                  height: { xs: 64, md: 112 },
                  bgcolor: 'primary.main',
                  color: 'common.white',
                  border: 'solid 3px white',
                  fontSize: { xs: 22, md: 32 },
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="h4" sx={{ color: 'common.white', overflowWrap: 'anywhere' }}>
                  {fullName}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5, color: 'common.white', opacity: 0.72 }}>
                  {roleLabel}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              zIndex: 9,
              width: 1,
              px: { md: 3 },
              bgcolor: 'background.paper',
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-end' },
            }}>
            <Tabs
              value={selectedTab}
              onChange={(_, value: ProfileTab) => setSelectedTab(value)}
              variant="scrollable"
              scrollButtons="auto">
              <Tab
                value="overview"
                icon={<Iconify icon="solar:user-id-bold" width={20} />}
                iconPosition="start"
                label={t('profile.overview')}
              />
              <Tab
                value="access"
                icon={<Iconify icon="solar:shield-keyhole-bold-duotone" width={20} />}
                iconPosition="start"
                label={t('profile.access')}
              />
            </Tabs>
          </Box>
        </Card>

        {selectedTab === 'overview' ? (
          <Grid container spacing={3} sx={{ mt: 3 }} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={3}>
                <Card>
                  <CardHeader title={t('profile.atGlance')} />
                  <Stack
                    direction="row"
                    divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
                    sx={{ p: 3, textAlign: 'center' }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="h4">{permissionCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.permissionsCount')}
                      </Typography>
                    </Box>
                    {hasHallAccessPermission ? (
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="h4">{allowedHallCount}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t('fields.allowedHalls')}
                        </Typography>
                      </Box>
                    ) : null}
                  </Stack>
                </Card>

                <Card>
                  <CardHeader title={t('profile.contact')} />
                  <Box sx={{ p: 3 }}>
                    <ProfileRow label={t('fields.phone')} value={phone} icon="solar:phone-bold-duotone" />
                  </Box>
                </Card>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Card>
                <CardHeader title={t('profile.details')} />
                <Box
                  sx={{
                    p: 3,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                    gap: 3,
                  }}>
                  {detailEntries.map((entry) => (
                    <ProfileField key={entry.label} label={entry.label} value={entry.value} />
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={3} sx={{ mt: 3 }} alignItems="flex-start">
            <Grid size={{ xs: 12, md: 4 }}>
              <Card>
                <CardHeader title={t('sections.access')} />
                <Stack spacing={2.5} sx={{ p: 3 }} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                  {accessEntries.map((entry) => (
                    <ProfileRow key={entry.label} {...entry} />
                  ))}
                </Stack>
              </Card>
            </Grid>
            {hasHallAccessPermission ? (
              <Grid size={{ xs: 12, md: 8 }}>
                <Card>
                  <CardHeader title={t('sections.assignment')} />
                  <Stack spacing={2.5} sx={{ p: 3 }} divider={<Divider flexItem sx={{ borderStyle: 'dashed' }} />}>
                    {hallEntries.map((entry) => (
                      <ProfileRow key={entry.label} {...entry} />
                    ))}
                  </Stack>
                </Card>
              </Grid>
            ) : null}
          </Grid>
        )}
      </Box>
    </Content>
  );
}
