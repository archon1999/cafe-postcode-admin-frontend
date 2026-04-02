import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Label } from 'shared/ui/Label';
import { LabelRowWithIcon } from 'shared/ui/LabelRowWithIcon/LabelRowWithIcon';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatMoney } from 'shared/utils/format-money';

import { useGetOrderByIdQuery } from '../../../application';
import {
  formatDateTime,
  getOrderChannelTranslationKey,
  getOrderStatusColor,
  getPaymentMethodTranslationKey,
  getPaymentStatusColor,
  getReceiptKindTranslationKey,
  getReceiptStatusColor,
} from '../../lib/presenters';

const OrderDetailPage = () => {
  const { t } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const orderQuery = useGetOrderByIdQuery(id ?? '');

  useRedirectOnNotFound(orderQuery.error, !orderQuery.isLoading);

  if (orderQuery.isLoading) return <LoadingScreen />;
  const order = orderQuery.data;
  if (!order) return <Typography color="text.secondary">{tCommon('labels.notFound')}</Typography>;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('pages.orderDetail.title', { orderNumber: order.orderNumber })}
        links={[{ name: t('pages.orders.title'), href: RoutePath.orderList }, { name: `#${order.orderNumber}` }]}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <LabelRowWithIcon
                label={t('fields.orderNumber')}
                value={`#${order.orderNumber}`}
                icon="solar:bill-list-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.channel')}
                value={t(getOrderChannelTranslationKey(order.channel))}
                icon="solar:shop-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.hall')}
                value={formatHallDisplayName(order.hallName, undefined, tCommon)}
                icon="solar:home-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.table')}
                value={order.tableName || '-'}
                icon="solar:plate-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.openedBy')}
                value={order.openedByName || '-'}
                icon="solar:user-id-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.cashier')}
                value={order.cashierName || '-'}
                icon="solar:card-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.createdAt')}
                value={formatDateTime(order.createdAt)}
                icon="solar:calendar-date-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.closedAt')}
                value={formatDateTime(order.closedAt)}
                icon="solar:check-circle-bold-duotone"
              />
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('fields.status')}
                </Typography>
                <Label color={getOrderStatusColor(order.status)} variant="soft">
                  {t(`statuses.${order.status}`)}
                </Label>
              </Stack>
            </Card>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('fields.total')}
                </Typography>
                <Typography variant="h4">{formatMoney(order.total)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('fields.subtotal')}: {formatMoney(order.subtotal)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('fields.serviceFee')}: {formatMoney(order.serviceFee)}
                </Typography>
              </Stack>
            </Card>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="h6">{t('sections.items')}</Typography>
              {order.items.length ? (
                <Stack divider={<Divider flexItem />} spacing={2}>
                  {order.items.map((item) => (
                    <Stack key={item.id} spacing={0.75}>
                      <Typography variant="subtitle1">{item.catalogItemName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.quantity')}: {item.quantity} | {t('fields.lineTotal')}: {formatMoney(item.lineTotal)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">{t('labels.noItems')}</Typography>
              )}
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 1 }}>
            <Stack spacing={2.5}>
              <Typography variant="h6">{t('sections.payments')}</Typography>
              {order.payments.length ? (
                <Stack divider={<Divider flexItem />} spacing={2}>
                  {order.payments.map((payment) => (
                    <Stack key={payment.id} spacing={0.75}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1">{t(getPaymentMethodTranslationKey(payment.method))}</Typography>
                        <Label color={getPaymentStatusColor(payment.status)} variant="soft">
                          {t(`paymentStatuses.${payment.status}`)}
                        </Label>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.amount')}: {formatMoney(payment.amount)} | {t('fields.paidAt')}:{' '}
                        {formatDateTime(payment.paidAt)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">{t('labels.noPayments')}</Typography>
              )}
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ p: 3, height: 1 }}>
            <Stack spacing={2.5}>
              <Typography variant="h6">{t('sections.receipts')}</Typography>
              {order.receipts.length ? (
                <Stack divider={<Divider flexItem />} spacing={2}>
                  {order.receipts.map((receipt) => (
                    <Stack key={receipt.id} spacing={0.75}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1">{t(getReceiptKindTranslationKey(receipt.kind))}</Typography>
                        <Label color={getReceiptStatusColor(receipt.status)} variant="soft">
                          {t(`receiptStatuses.${receipt.status}`)}
                        </Label>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {t('fields.provider')}: {receipt.provider || '-'}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">{t('labels.noReceipts')}</Typography>
              )}
            </Stack>
          </Card>
        </Grid>
        {order.note ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">{t('sections.note')}</Typography>
                <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', typography: 'body2' }}>
                  {order.note}
                </Box>
              </Stack>
            </Card>
          </Grid>
        ) : null}
      </Grid>
    </Content>
  );
};

export default OrderDetailPage;
