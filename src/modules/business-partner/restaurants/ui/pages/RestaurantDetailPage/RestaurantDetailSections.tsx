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

import { useTranslate } from 'app/providers/locales';
import type { AdminRestaurantBalanceTransaction, AdminRestaurantDetail } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';
import { formatMoney } from 'shared/utils/format-money';
import { formatDate, formatDateTime } from 'shared/utils/format-time';

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

function CustomerOverviewSection({ restaurant }: { restaurant: AdminRestaurantDetail }) {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const { t: tPlatform } = useTranslate('platform');
  const tariffName =
    restaurant.tariff?.name ??
    (restaurant.activationType === 'custom' ? tPlatform('labels.customActivation') : t('labels.notSelected'));
  const billingPeriodLabel =
    restaurant.billingPeriod === 'monthly'
      ? tPlatform('labels.monthly')
      : restaurant.billingPeriod === 'yearly'
        ? tPlatform('labels.yearly')
        : t('labels.notSelected');

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

function BalanceSection({ restaurant, onTopUp }: { restaurant: AdminRestaurantDetail; onTopUp: () => void }) {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const nextPeriodStatusLabel =
    restaurant.balance.nextPeriodStatus === 'active'
      ? tCommon('status.active')
      : restaurant.balance.nextPeriodStatus === 'inactive'
        ? tCommon('status.inactive')
        : t('labels.notSelected');
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Stack spacing={0.75}>
            <Typography variant="h6">{t('sections.balance.title')}</Typography>
            <Typography variant="body2" color="text.secondary">
              {t('sections.balance.description')}
            </Typography>
          </Stack>
          <Button variant="contained" color="black" startIcon={<Iconify icon="mingcute:add-line" />} onClick={onTopUp}>
            {t('actions.topUpBalance')}
          </Button>
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: 2.5,
          }}>
          <SummaryField label={t('fields.currentBalance')}>
            {formatMoney(restaurant.balance.currentBalance)}
          </SummaryField>
          <SummaryField label={t('fields.nextChargeAmount')}>
            {restaurant.balance.nextChargeAmount !== null && restaurant.balance.nextChargeAmount !== undefined
              ? formatMoney(restaurant.balance.nextChargeAmount)
              : t('labels.notSelected')}
          </SummaryField>
          <SummaryField label={t('fields.nextChargeOn')}>
            {restaurant.balance.nextChargeOn
              ? formatDate(restaurant.balance.nextChargeOn, 'DD.MM.YYYY')
              : t('labels.notSelected')}
          </SummaryField>
          <SummaryField label={t('fields.nextPeriodStatus')}>
            <Chip
              size="small"
              color={restaurant.balance.nextPeriodStatus === 'active' ? 'success' : 'default'}
              variant="soft"
              label={nextPeriodStatusLabel}
              sx={{ alignSelf: 'flex-start' }}
            />
          </SummaryField>
          <SummaryField label={t('fields.lastTopUpAt')}>
            {restaurant.balance.lastTopUpAt
              ? formatDateTime(restaurant.balance.lastTopUpAt, 'DD.MM.YYYY HH:mm')
              : t('labels.notSelected')}
          </SummaryField>
        </Box>
      </Stack>
    </Card>
  );
}

function BalanceHistorySection({
  transactions,
  isLoading,
}: {
  transactions: AdminRestaurantBalanceTransaction[];
  isLoading: boolean;
}) {
  const { t } = useTranslate('organizations');
  return (
    <Card sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Stack spacing={0.75}>
          <Typography variant="h6">{t('sections.balanceHistory.title')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('sections.balanceHistory.description')}
          </Typography>
        </Stack>
        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            {t('labels.loading')}
          </Typography>
        ) : transactions.length ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('fields.date')}</TableCell>
                <TableCell>{t('fields.type')}</TableCell>
                <TableCell>{t('fields.amount')}</TableCell>
                <TableCell>{t('fields.balanceAfter')}</TableCell>
                <TableCell>{t('fields.user')}</TableCell>
                <TableCell>{t('fields.note')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDateTime(transaction.createdAt, 'DD.MM.YYYY HH:mm')}</TableCell>
                  <TableCell>
                    {transaction.kind === 'renewal_charge'
                      ? t('labels.balanceTransactionKinds.renewalCharge')
                      : t('labels.balanceTransactionKinds.topUp')}
                  </TableCell>
                  <TableCell>{formatSignedMoney(transaction.amount)}</TableCell>
                  <TableCell>{formatMoney(transaction.balanceAfter)}</TableCell>
                  <TableCell>{transaction.performedBy?.fullName ?? t('labels.system')}</TableCell>
                  <TableCell>{transaction.note || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('empty.balanceTransactions')}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}

type RestaurantDetailSectionsProps = {
  restaurant: AdminRestaurantDetail;
  transactions: AdminRestaurantBalanceTransaction[];
  transactionsLoading: boolean;
  onTopUp: () => void;
};

export function RestaurantDetailSections({
  restaurant,
  transactions,
  transactionsLoading,
  onTopUp,
}: RestaurantDetailSectionsProps) {
  return (
    <Stack spacing={3}>
      <CustomerOverviewSection restaurant={restaurant} />
      <ActiveUsersSection restaurant={restaurant} />
      <SoliqIntegrationSection restaurant={restaurant} />
      <BalanceSection restaurant={restaurant} onTopUp={onTopUp} />
      <BalanceHistorySection transactions={transactions} isLoading={transactionsLoading} />
    </Stack>
  );
}
