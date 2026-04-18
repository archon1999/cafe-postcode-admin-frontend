import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import {
  useGetRestaurantBalanceTransactionsQuery,
  useGetRestaurantDetailQuery,
  useTopUpRestaurantBalanceMutation,
} from 'modules/business-partner/restaurants/application';
import type { AdminRestaurantBalanceTransaction } from 'shared/api/admin-types';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { RouterLink } from 'shared/ui/RouterLink';
import { formatMoney } from 'shared/utils/format-money';
import { formatDate, formatDateTime } from 'shared/utils/format-time';

import { RestaurantBalanceTopUpDialog } from '../../components/RestaurantBalanceTopUpDialog';

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

function formatSignedMoney(value?: number | string | null) {
  const numericValue = Number(value ?? NaN);

  if (!Number.isFinite(numericValue)) {
    return '-';
  }

  const formattedValue = formatMoney(Math.abs(numericValue));
  return numericValue < 0 ? `-${formattedValue}` : formattedValue;
}

function getTransactionKindLabel(
  kind: AdminRestaurantBalanceTransaction['kind'],
  t: ReturnType<typeof useTranslate>['t'],
) {
  if (kind === 'renewal_charge') {
    return t('labels.balanceTransactionKinds.renewalCharge', { defaultValue: 'Davr uchun yechim' });
  }

  return t('labels.balanceTransactionKinds.topUp', { defaultValue: "Balans to'ldirish" });
}

const RestaurantDetailPage = () => {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const { t: tPlatform } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { replace } = useRouter();
  const canManageRestaurants = canAccessRestaurants(profile);
  const [topUpDialogOpen, setTopUpDialogOpen] = useState(false);

  const detailQuery = useGetRestaurantDetailQuery(id ?? '', {
    enabled: Boolean(id && canManageRestaurants),
  });
  const balanceTransactionsQuery = useGetRestaurantBalanceTransactionsQuery(
    id ?? '',
    { page: 1, pageSize: 10 },
    { enabled: Boolean(id && canManageRestaurants) },
  );
  const topUpMutation = useTopUpRestaurantBalanceMutation(id ?? '');

  useRedirectOnNotFound(detailQuery.error, Boolean(id));

  useEffect(() => {
    if (profile && !canManageRestaurants) {
      replace(RoutePath.main);
    }
  }, [canManageRestaurants, profile, replace]);

  if (profile && !canManageRestaurants) {
    return null;
  }

  if (!id || detailQuery.isLoading || !detailQuery.data) {
    return <LoadingScreen />;
  }

  const restaurant = detailQuery.data;
  const transactions = balanceTransactionsQuery.data?.data ?? [];
  const tariffName =
    restaurant.tariff?.name ??
    (restaurant.activationType === 'custom' ? tPlatform('labels.customActivation') : t('labels.notSelected'));
  const billingPeriodLabel =
    restaurant.billingPeriod === 'monthly'
      ? tPlatform('labels.monthly')
      : restaurant.billingPeriod === 'yearly'
        ? tPlatform('labels.yearly')
        : t('labels.notSelected');
  const nextPeriodStatusLabel =
    restaurant.balance.nextPeriodStatus === 'active'
      ? tCommon('status.active')
      : restaurant.balance.nextPeriodStatus === 'inactive'
        ? tCommon('status.inactive')
        : t('labels.notSelected');

  return (
    <Content>
      <CustomBreadcrumbs
        heading={restaurant.name}
        links={[
          { name: t('pages.restaurants.title'), href: RoutePath.organizationRestaurantList },
          { name: restaurant.name },
        ]}
        action={
          <Button
            component={RouterLink}
            href={RouterPathHelper.organizationRestaurantEdit(restaurant.id)}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="solar:pen-bold" />}>
            {t('actions.edit')}
          </Button>
        }
      />

      <Stack spacing={3}>
        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack spacing={0.75}>
              <Typography variant="h6">
                {t('sections.customerOverview.title', { defaultValue: "Mijoz ma'lumotlari" })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.customerOverview.description', {
                  defaultValue: "Mijozning asosiy ma'lumotlari va joriy aktivlik holati shu yerda ko'rinadi.",
                })}
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
              <SummaryField label={t('fields.legalName')}>
                {restaurant.legalName || t('labels.notSelected')}
              </SummaryField>
              <SummaryField label={t('fields.taxNumber')}>
                {restaurant.taxNumber || t('labels.notSelected')}
              </SummaryField>
              <SummaryField label={t('fields.phone')}>{restaurant.phone || t('labels.notSelected')}</SummaryField>
              <SummaryField label={t('fields.tariff')}>{tariffName}</SummaryField>
              <SummaryField label={tPlatform('fields.billingPeriod')}>{billingPeriodLabel}</SummaryField>
              <SummaryField label={tPlatform('fields.expiresOn')}>
                {restaurant.expiresOn ? formatDate(restaurant.expiresOn, 'DD.MM.YYYY') : t('labels.notSelected')}
              </SummaryField>
              <SummaryField label={t('fields.address')} fullWidth>
                {restaurant.address || t('labels.notSelected')}
              </SummaryField>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack spacing={0.75}>
              <Typography variant="h6">
                {t('sections.activeUsers.title', { defaultValue: 'Aktiv foydalanuvchilar' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.activeUsers.description', {
                  defaultValue: 'Mijozga biriktirilgan aktiv foydalanuvchilar va ularning rollari.',
                })}
              </Typography>
            </Stack>

            {restaurant.activeUsers.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('fields.name')}</TableCell>
                    <TableCell>{tPlatform('fields.username')}</TableCell>
                    <TableCell>{t('fields.role', { defaultValue: 'Rol' })}</TableCell>
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
                {t('empty.activeUsers', { defaultValue: "Aktiv foydalanuvchilar hali yo'q." })}
              </Typography>
            )}
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack spacing={0.75}>
              <Typography variant="h6">
                {t('sections.soliqIntegration.title', { defaultValue: 'Soliq bilan integratsiya' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.soliqIntegration.description', {
                  defaultValue: 'Soliq OFD integratsiyasining joriy holati va asosiy identifikatorlari.',
                })}
              </Typography>
            </Stack>

            {restaurant.soliqIntegration ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 2.5,
                }}>
                <SummaryField label={t('fields.provider', { defaultValue: 'Provayder' })}>
                  {restaurant.soliqIntegration.provider}
                </SummaryField>
                <SummaryField label={t('fields.status')}>
                  <Chip
                    size="small"
                    color={restaurant.soliqIntegration.isEnabled ? 'success' : 'default'}
                    variant="soft"
                    label={
                      restaurant.soliqIntegration.isEnabled ? tCommon('status.active') : tCommon('status.inactive')
                    }
                    sx={{ alignSelf: 'flex-start' }}
                  />
                </SummaryField>
                <SummaryField label={t('fields.mode')}>{restaurant.soliqIntegration.mode}</SummaryField>
                <SummaryField label={t('fields.terminalId')}>
                  {restaurant.soliqIntegration.terminalId || t('labels.notSelected')}
                </SummaryField>
                <SummaryField label={t('integrations.fields.cashboxId')}>
                  {restaurant.soliqIntegration.cashboxId || t('labels.notSelected')}
                </SummaryField>
                <SummaryField label={t('fields.taxNumber')}>
                  {restaurant.soliqIntegration.taxNumber || t('labels.notSelected')}
                </SummaryField>
                <SummaryField label={t('integrations.fields.endpointUrl')} fullWidth>
                  {restaurant.soliqIntegration.endpointUrl || t('labels.notSelected')}
                </SummaryField>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('empty.soliqIntegration', { defaultValue: 'Soliq integratsiyasi sozlanmagan.' })}
              </Typography>
            )}
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
              <Stack spacing={0.75}>
                <Typography variant="h6">{t('sections.balance.title', { defaultValue: 'Balans' })}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('sections.balance.description', {
                    defaultValue: "Keyingi davr uchun balans, yechim summasi va status preview shu bo'limda ko'rinadi.",
                  })}
                </Typography>
              </Stack>
              <Button
                variant="contained"
                color="black"
                startIcon={<Iconify icon="mingcute:add-line" />}
                onClick={() => setTopUpDialogOpen(true)}>
                {t('actions.topUpBalance', { defaultValue: "Balansni to'ldirish" })}
              </Button>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2.5,
              }}>
              <SummaryField label={t('fields.currentBalance', { defaultValue: 'Joriy balans' })}>
                {formatMoney(restaurant.balance.currentBalance)}
              </SummaryField>
              <SummaryField label={t('fields.nextChargeAmount', { defaultValue: 'Keyingi yechim summasi' })}>
                {restaurant.balance.nextChargeAmount !== null && restaurant.balance.nextChargeAmount !== undefined
                  ? formatMoney(restaurant.balance.nextChargeAmount)
                  : t('labels.notSelected')}
              </SummaryField>
              <SummaryField label={t('fields.nextChargeOn', { defaultValue: 'Keyingi yechim sanasi' })}>
                {restaurant.balance.nextChargeOn
                  ? formatDate(restaurant.balance.nextChargeOn, 'DD.MM.YYYY')
                  : t('labels.notSelected')}
              </SummaryField>
              <SummaryField label={t('fields.nextPeriodStatus', { defaultValue: 'Keyingi davr statusi' })}>
                <Chip
                  size="small"
                  color={restaurant.balance.nextPeriodStatus === 'active' ? 'success' : 'default'}
                  variant="soft"
                  label={nextPeriodStatusLabel}
                  sx={{ alignSelf: 'flex-start' }}
                />
              </SummaryField>
              <SummaryField label={t('fields.lastTopUpAt', { defaultValue: "Oxirgi to'ldirish" })}>
                {restaurant.balance.lastTopUpAt
                  ? formatDateTime(restaurant.balance.lastTopUpAt, 'DD.MM.YYYY HH:mm')
                  : t('labels.notSelected')}
              </SummaryField>
            </Box>
          </Stack>
        </Card>

        <Card sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Stack spacing={0.75}>
              <Typography variant="h6">
                {t('sections.balanceHistory.title', { defaultValue: 'Balans tarixi' })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('sections.balanceHistory.description', {
                  defaultValue: "So'nggi balans harakatlari: to'ldirishlar va davr uchun yechimlar.",
                })}
              </Typography>
            </Stack>

            {balanceTransactionsQuery.isLoading ? (
              <Typography variant="body2" color="text.secondary">
                {t('labels.loading', { defaultValue: 'Yuklanmoqda...' })}
              </Typography>
            ) : transactions.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('fields.date', { defaultValue: 'Sana' })}</TableCell>
                    <TableCell>{t('fields.type', { defaultValue: 'Turi' })}</TableCell>
                    <TableCell>{t('fields.amount', { defaultValue: 'Summa' })}</TableCell>
                    <TableCell>{t('fields.balanceAfter', { defaultValue: 'Balansdan keyin' })}</TableCell>
                    <TableCell>{t('fields.user', { defaultValue: 'Foydalanuvchi' })}</TableCell>
                    <TableCell>{t('fields.note', { defaultValue: 'Izoh' })}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDateTime(transaction.createdAt, 'DD.MM.YYYY HH:mm')}</TableCell>
                      <TableCell>{getTransactionKindLabel(transaction.kind, t)}</TableCell>
                      <TableCell>{formatSignedMoney(transaction.amount)}</TableCell>
                      <TableCell>{formatMoney(transaction.balanceAfter)}</TableCell>
                      <TableCell>
                        {transaction.performedBy?.fullName ?? t('labels.system', { defaultValue: 'Tizim' })}
                      </TableCell>
                      <TableCell>{transaction.note || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('empty.balanceTransactions', { defaultValue: "Balans harakatlari hali yo'q." })}
              </Typography>
            )}
          </Stack>
        </Card>
      </Stack>

      <RestaurantBalanceTopUpDialog
        open={topUpDialogOpen}
        isSubmitting={topUpMutation.isPending}
        onClose={() => setTopUpDialogOpen(false)}
        onSubmit={async (payload) => {
          await topUpMutation.mutateAsync(payload);
          setTopUpDialogOpen(false);
        }}
      />
    </Content>
  );
};

export default RestaurantDetailPage;
