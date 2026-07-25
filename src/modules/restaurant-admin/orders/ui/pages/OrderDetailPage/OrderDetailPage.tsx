import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { varAlpha } from 'minimal-shared/utils';
import { useState, type ReactNode } from 'react';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import { useParams, useRedirectOnNotFound } from 'shared/hooks/router';
import { usePageTitle } from 'shared/hooks/use-page-title';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { DetailPageLink } from 'shared/ui/DetailPageLink';
import { Iconify, type IconifyName } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import { useGetOrderByIdQuery } from '../../../application';
import {
  getOrderChannelTranslationKey,
  getOrderItemStatusColor,
  getOrderStatusColor,
  getPaymentMethodTranslationKey,
  getPaymentStatusColor,
  getReceiptKindTranslationKey,
  getReceiptStatusColor,
} from '../../lib/presenters';

import { hasReceiptPrintPreview, OrderReceiptPreviewDialog } from './OrderReceiptPreviewDialog';

type InfoTileProps = {
  label: string;
  value: ReactNode;
  icon: IconifyName;
};

function InfoTile({ label, value, icon }: InfoTileProps) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="center"
      sx={{ minHeight: 76, p: 1.5, border: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box
        sx={(theme) => ({
          width: 38,
          height: 38,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          color: 'text.secondary',
          bgcolor: varAlpha(theme.vars.palette.grey['500Channel'], 0.08),
          flexShrink: 0,
        })}>
        <Iconify icon={icon} width={18} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
          {label}
        </Typography>
        <Box sx={{ typography: 'subtitle2', overflowWrap: 'anywhere' }}>{value}</Box>
      </Box>
    </Stack>
  );
}

function SectionTitle({ title, icon, count }: { title: string; icon: IconifyName; count?: number }) {
  return (
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
        <Iconify icon={icon} width={19} />
      </Box>
      <Typography variant="h6">{title}</Typography>
      {count !== undefined ? (
        <Label variant="soft" color="default">
          {count}
        </Label>
      ) : null}
    </Stack>
  );
}

function combineStaffNames(cashierName?: string | null, openedByName?: string | null) {
  return [...new Set([cashierName, openedByName].filter(Boolean))].join(' / ') || '-';
}

const OrderDetailPage = () => {
  const { t } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const orderQuery = useGetOrderByIdQuery(id ?? '');
  const [receiptPreviewOpen, setReceiptPreviewOpen] = useState(false);
  usePageTitle(
    orderQuery.data
      ? [t('pages.orders.title'), t('pages.orderDetail.title', { orderNumber: orderQuery.data.orderNumber })]
      : [t('pages.orders.title')],
  );

  useRedirectOnNotFound(orderQuery.error, !orderQuery.isLoading);

  if (orderQuery.isLoading) return <LoadingScreen />;
  const order = orderQuery.data;
  if (!order) return <Typography color="text.secondary">{tCommon('labels.notFound')}</Typography>;

  const hallName = formatHallDisplayName(order.hallName, undefined, tCommon);
  const location = order.tableName ? `${hallName} · ${order.tableName}` : hallName;
  const staffNames = combineStaffNames(order.cashierName, order.openedByName);
  const canPreviewReceipt = order.receipts.some(hasReceiptPrintPreview);

  return (
    <Content>
      <Box sx={{ width: 1, maxWidth: 1440, mx: 'auto' }}>
        <CustomBreadcrumbs
          heading={t('pages.orderDetail.title', { orderNumber: order.orderNumber })}
          action={
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <BackToListButton href={RoutePath.orderList} />
              <Button
                variant="contained"
                color="inherit"
                startIcon={<Iconify icon="solar:document-text-bold-duotone" />}
                disabled={!canPreviewReceipt}
                onClick={() => setReceiptPreviewOpen(true)}>
                {t('actions.viewReceipt')}
              </Button>
            </Stack>
          }
          sx={{ mb: 2.5 }}
        />

        <Stack spacing={2.5}>
          <Card
            sx={(theme) => ({
              p: { xs: 2.5, md: 3 },
              bgcolor: 'background.neutral',
              borderTop: `3px solid ${theme.vars.palette.primary.main}`,
            })}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
                gap: 3,
                alignItems: 'center',
              }}>
              <Stack spacing={1.25} sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                  <Typography variant="h3" sx={{ letterSpacing: '-0.035em' }}>
                    #{order.orderNumber}
                  </Typography>
                  <Label color={getOrderStatusColor(order.status)} variant="soft">
                    {t(`statuses.${order.status}`)}
                  </Label>
                  <Label color="default" variant="soft">
                    {t(getOrderChannelTranslationKey(order.channel))}
                  </Label>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {formatDateTime(order.createdAt)}
                  {order.restaurantName ? ` · ${order.restaurantName}` : ''}
                </Typography>
              </Stack>

              <Stack direction="row" spacing={{ xs: 3, sm: 5 }} alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('fields.itemsCount')}
                  </Typography>
                  <Typography variant="h5" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                    {order.items.length}
                  </Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('fields.total')}
                  </Typography>
                  <Typography variant="h4" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                    {formatMoney(order.total)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Card>

          <Grid container spacing={2.5} alignItems="flex-start">
            <Grid size={{ xs: 12, lg: 8 }}>
              <Stack spacing={2.5}>
                <Card sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack spacing={2}>
                    <SectionTitle title={t('fields.orderNumber')} icon="solar:bill-list-bold-duotone" />
                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoTile
                          label={t('fields.channel')}
                          value={t(getOrderChannelTranslationKey(order.channel))}
                          icon="solar:shop-bold-duotone"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoTile
                          label={`${t('fields.hall')} / ${t('fields.table')}`}
                          value={location}
                          icon="solar:home-bold-duotone"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoTile
                          label={t('fields.cashierAndOpenedBy')}
                          value={staffNames}
                          icon="solar:user-id-bold-duotone"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <InfoTile
                          label={t('fields.status')}
                          value={
                            <Label color={getOrderStatusColor(order.status)} variant="soft">
                              {t(`statuses.${order.status}`)}
                            </Label>
                          }
                          icon="solar:verified-check-bold-duotone"
                        />
                      </Grid>
                    </Grid>
                  </Stack>
                </Card>

                <Card sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack spacing={2}>
                    <SectionTitle
                      title={t('sections.items')}
                      icon="solar:bag-4-bold-duotone"
                      count={order.items.length}
                    />
                    {order.items.length ? (
                      <Stack divider={<Divider flexItem />}>
                        {order.items.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr auto', sm: 'minmax(0, 1fr) auto auto' },
                              gap: { xs: 1, sm: 2.5 },
                              alignItems: 'center',
                              py: 2,
                            }}>
                            <Stack spacing={0.75} sx={{ minWidth: 0, gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
                              <DetailPageLink href={RouterPathHelper.orderItemView(item.id)} sx={{ lineHeight: 1.35 }}>
                                {item.catalogItemName}
                              </DetailPageLink>
                              <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
                                <Label color={getOrderItemStatusColor(item.status)} variant="soft">
                                  {t(`orderItemStatuses.${item.status}`)}
                                </Label>
                                {item.prepStationName ? (
                                  <Typography variant="caption" color="text.secondary">
                                    {item.prepStationName}
                                  </Typography>
                                ) : null}
                              </Stack>
                            </Stack>
                            <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                              <Typography variant="caption" color="text.secondary">
                                {t('fields.quantity')}
                              </Typography>
                              <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                {item.quantity} × {formatMoney(item.unitPrice)}
                              </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                              <Typography variant="caption" color="text.secondary">
                                {t('fields.lineTotal')}
                              </Typography>
                              <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatMoney(item.lineTotal)}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography color="text.secondary">{t('labels.noItems')}</Typography>
                    )}
                  </Stack>
                </Card>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 4 }}>
              <Stack spacing={2.5} sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
                <Card sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack spacing={2}>
                    <SectionTitle title={t('fields.total')} icon="solar:wallet-money-bold-duotone" />
                    <Stack spacing={1.25}>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          {t('fields.subtotal')}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatMoney(order.subtotal)}
                        </Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          {t('fields.serviceFee')}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatMoney(order.serviceFee)}
                        </Typography>
                      </Stack>
                      <Divider sx={{ borderStyle: 'dashed' }} />
                      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={2}>
                        <Typography variant="subtitle1">{t('fields.total')}</Typography>
                        <Typography variant="h3" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {formatMoney(order.total)}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>

                <Card sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack spacing={2}>
                    <SectionTitle title={t('fields.createdAt')} icon="solar:calendar-date-bold-duotone" />
                    <InfoTile
                      label={t('fields.createdAt')}
                      value={formatDateTime(order.createdAt)}
                      icon="solar:calendar-add-bold-duotone"
                    />
                    <InfoTile
                      label={t('fields.closedAt')}
                      value={formatDateTime(order.closedAt)}
                      icon="solar:check-circle-bold-duotone"
                    />
                  </Stack>
                </Card>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ p: { xs: 2, md: 2.5 }, height: 1 }}>
                <Stack spacing={2}>
                  <SectionTitle
                    title={t('sections.payments')}
                    icon="solar:card-2-bold-duotone"
                    count={order.payments.length}
                  />
                  {order.payments.length ? (
                    <Stack divider={<Divider flexItem />}>
                      {order.payments.map((payment) => (
                        <Stack key={payment.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.75 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: 'background.neutral',
                              color: 'text.secondary',
                              flexShrink: 0,
                            }}>
                            <Iconify icon="solar:wallet-money-bold-duotone" width={20} />
                          </Box>
                          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
                              <DetailPageLink href={RouterPathHelper.paymentView(payment.id)}>
                                {t(getPaymentMethodTranslationKey(payment.method))}
                              </DetailPageLink>
                              <Label color={getPaymentStatusColor(payment.status)} variant="soft">
                                {t(`paymentStatuses.${payment.status}`)}
                              </Label>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {formatDateTime(payment.paidAt)}
                            </Typography>
                          </Stack>
                          <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                            {formatMoney(payment.amount)}
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
              <Card sx={{ p: { xs: 2, md: 2.5 }, height: 1 }}>
                <Stack spacing={2}>
                  <SectionTitle
                    title={t('sections.receipts')}
                    icon="solar:document-text-bold-duotone"
                    count={order.receipts.length}
                  />
                  {order.receipts.length ? (
                    <Stack divider={<Divider flexItem />}>
                      {order.receipts.map((receipt) => (
                        <Stack key={receipt.id} direction="row" spacing={1.5} alignItems="center" sx={{ py: 1.75 }}>
                          <Box
                            sx={{
                              width: 40,
                              height: 40,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: 'background.neutral',
                              color: 'text.secondary',
                              flexShrink: 0,
                            }}>
                            <Iconify icon="solar:document-text-bold-duotone" width={20} />
                          </Box>
                          <Stack spacing={0.5} sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center">
                              <DetailPageLink href={RouterPathHelper.receiptView(receipt.id)}>
                                {t(getReceiptKindTranslationKey(receipt.kind))}
                              </DetailPageLink>
                              <Label color={getReceiptStatusColor(receipt.status)} variant="soft">
                                {t(`receiptStatuses.${receipt.status}`)}
                              </Label>
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {t('fields.provider')}: {receipt.provider || '-'}
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(receipt.createdAt)}
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
                <Card sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Stack spacing={2}>
                    <SectionTitle title={t('sections.note')} icon="solar:notes-bold-duotone" />
                    <Box
                      component="pre"
                      sx={{ m: 0, p: 2, whiteSpace: 'pre-wrap', typography: 'body2', bgcolor: 'background.neutral' }}>
                      {order.note}
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            ) : null}
          </Grid>
        </Stack>
      </Box>
      <OrderReceiptPreviewDialog open={receiptPreviewOpen} order={order} onClose={() => setReceiptPreviewOpen(false)} />
    </Content>
  );
};

export default OrderDetailPage;
