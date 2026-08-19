import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';
import type { AdminRestaurantDetail } from 'shared/api/admin-types';

function SummaryField({
  label,
  children,
  fullWidth = false,
}: {
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <Stack spacing={0.5} sx={{ gridColumn: fullWidth ? { md: '1 / -1' } : undefined }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Typography variant="body2">{children}</Typography>
      ) : (
        children
      )}
    </Stack>
  );
}

function CustomerOverviewSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const { t: tPlatform } = useTranslate('platform');
  const tariffName =
    restaurant.tariff?.name ??
    (restaurant.activationType === 'custom' ? tPlatform('labels.customActivation') : t('labels.notSelected'));

  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.75}>
          <Typography variant="h6">{t('sections.customerOverview.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('sections.customerOverview.description')}
          </Typography>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2.5,
          }}>
          <SummaryField label={t('fields.name')}>{restaurant.name}</SummaryField>
          <SummaryField label={t('fields.status')}>
            <Chip
              size="small"
              color={restaurant.isActive ? 'success' : 'default'}
              variant="soft"
              label={restaurant.isActive ? tCommon('status.active') : tCommon('status.inactive')}
              sx={{ alignSelf: 'flex-start' }}
            />
          </SummaryField>
          <SummaryField label={t('fields.legalName')}>{restaurant.legalName || t('labels.notSelected')}</SummaryField>
          <SummaryField label={t('fields.taxNumber')}>{restaurant.taxNumber || t('labels.notSelected')}</SummaryField>
          <SummaryField label={t('fields.phone')}>{restaurant.phone || t('labels.notSelected')}</SummaryField>
          <SummaryField label={t('fields.social')}>{restaurant.social || t('labels.notSelected')}</SummaryField>
          <SummaryField label={t('fields.tariff')}>{tariffName}</SummaryField>
          <SummaryField label={t('fields.address')} fullWidth>
            {restaurant.address || t('labels.notSelected')}
          </SummaryField>
        </Box>
      </Stack>
    </Card>
  );
}

function ActiveUsersSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const { t: tPlatform } = useTranslate('platform');
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={0.75}>
          <Typography variant="h6">{t('sections.activeUsers.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('sections.activeUsers.description')}
          </Typography>
        </Stack>
        {restaurant.activeUsers.length ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('fields.name')}</TableCell>
                <TableCell>{tPlatform('fields.username')}</TableCell>
                <TableCell>{t('fields.role')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {restaurant.activeUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.role?.name ?? t('labels.notSelected')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('empty.activeUsers')}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}

function SoliqIntegrationSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const integration = restaurant.soliqIntegration;
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={0.75}>
          <Typography variant="h6">{t('sections.soliqIntegration.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('sections.soliqIntegration.description')}
          </Typography>
        </Stack>
        {integration ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gap: 2.5,
            }}>
            <SummaryField label={t('fields.provider')}>{integration.provider}</SummaryField>
            <SummaryField label={t('fields.status')}>
              <Chip
                size="small"
                color={integration.isEnabled ? 'success' : 'default'}
                variant="soft"
                label={integration.isEnabled ? tCommon('status.active') : tCommon('status.inactive')}
                sx={{ alignSelf: 'flex-start' }}
              />
            </SummaryField>
            <SummaryField label={t('fields.terminalId')}>
              {integration.terminalId || t('labels.notSelected')}
            </SummaryField>
            <SummaryField label={t('integrations.fields.cashboxId')}>
              {integration.cashboxId || t('labels.notSelected')}
            </SummaryField>
            <SummaryField label={t('fields.taxNumber')}>
              {integration.taxNumber || t('labels.notSelected')}
            </SummaryField>
            <SummaryField label={t('integrations.fields.endpointUrl')} fullWidth>
              {integration.endpointUrl || t('labels.notSelected')}
            </SummaryField>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('empty.soliqIntegration')}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}

type RestaurantDetailSectionsProps = {
  restaurant: AdminRestaurantDetail;
};

export function RestaurantDetailSections({ restaurant }: RestaurantDetailSectionsProps) {
  return (
    <Stack spacing={3}>
      <CustomerOverviewSection restaurant={restaurant} />
      <ActiveUsersSection restaurant={restaurant} />
      <SoliqIntegrationSection restaurant={restaurant} />
    </Stack>
  );
}
