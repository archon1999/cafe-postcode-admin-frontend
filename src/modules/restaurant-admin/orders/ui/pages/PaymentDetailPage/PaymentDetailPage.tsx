import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { toast } from 'sonner';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Label } from 'shared/ui/Label';
import { LabelRowWithIcon } from 'shared/ui/LabelRowWithIcon/LabelRowWithIcon';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatMoney } from 'shared/utils/format-money';

import { useGetPaymentByIdQuery, useRetryPaymentFiscalMutation } from '../../../application';
import { formatDateTime, getPaymentMethodTranslationKey, getPaymentStatusColor } from '../../lib/presenters';

const PaymentDetailPage = () => {
  const { t } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const query = useGetPaymentByIdQuery(id ?? '');
  const retryFiscalMutation = useRetryPaymentFiscalMutation(id ?? '');

  useRedirectOnNotFound(query.error, !query.isLoading);

  if (query.isLoading) return <LoadingScreen />;
  const payment = query.data;
  if (!payment) return <Typography color="text.secondary">{tCommon('labels.notFound')}</Typography>;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('pages.paymentDetail.title', { orderNumber: payment.orderNumber })}
        links={[{ name: t('pages.payments.title'), href: RoutePath.paymentList }, { name: `#${payment.orderNumber}` }]}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <LabelRowWithIcon
                label={t('fields.orderNumber')}
                value={`#${payment.orderNumber}`}
                icon="solar:bill-list-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.method')}
                value={t(getPaymentMethodTranslationKey(payment.method))}
                icon="solar:card-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.cashDesk')}
                value={payment.cashDeskName || '-'}
                icon="solar:wallet-money-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.cashShift')}
                value={payment.cashShiftId || '-'}
                icon="solar:hourglass-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.receivedBy')}
                value={payment.receivedByName || '-'}
                icon="solar:user-id-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.externalRef')}
                value={payment.externalRef || '-'}
                icon="solar:hashtag-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.paidAt')}
                value={formatDateTime(payment.paidAt)}
                icon="solar:check-circle-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.refundsTotal')}
                value={formatMoney(payment.refundsTotal ?? 0)}
                icon="solar:restart-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.isRefunded')}
                value={payment.isRefunded ? t('labels.refunded') : t('labels.notRefunded')}
                icon="solar:refresh-circle-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.createdAt')}
                value={formatDateTime(payment.createdAt)}
                icon="solar:calendar-date-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.updatedAt')}
                value={formatDateTime(payment.updatedAt)}
                icon="solar:history-bold-duotone"
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
                <Label color={getPaymentStatusColor(payment.status)} variant="soft">
                  {t(`paymentStatuses.${payment.status}`)}
                </Label>
                {payment.status === 'succeeded' ? (
                  <Button
                    variant="contained"
                    color="black"
                    loading={retryFiscalMutation.isPending}
                    onClick={() => {
                      retryFiscalMutation
                        .mutateAsync()
                        .then((result) => {
                          if (result.result?.ok) {
                            toast.success('Fiscal chek yuborildi');
                          } else {
                            toast.error(String(result.result?.detail ?? 'Fiscal yuborilmadi'));
                          }
                        })
                        .catch((error: unknown) => {
                          const detail = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
                          toast.error(detail ?? 'Fiscal yuborilmadi');
                        });
                    }}>
                    Retry fiscal
                  </Button>
                ) : null}
              </Stack>
            </Card>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" color="text.secondary">
                  {t('fields.amount')}
                </Typography>
                <Typography variant="h4">{formatMoney(payment.amount)}</Typography>
              </Stack>
            </Card>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">{t('sections.providerPayload')}</Typography>
              <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', typography: 'body2' }}>
                {JSON.stringify(payment.providerPayload ?? {}, null, 2)}
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Content>
  );
};

export default PaymentDetailPage;
