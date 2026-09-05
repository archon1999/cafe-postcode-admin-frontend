import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import { useParams, useRedirectOnNotFound } from 'shared/hooks/router';
import { usePageTitle } from 'shared/hooks/use-page-title';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import { DetailPageLink } from 'shared/ui/DetailPageLink';
import { Label } from 'shared/ui/Label';
import { LabelRowWithIcon } from 'shared/ui/LabelRowWithIcon/LabelRowWithIcon';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { TechnicalDetailsAccordion } from 'shared/ui/TechnicalDetailsAccordion';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import { useGetPaymentByIdQuery, useRetryPaymentFiscalMutation } from '../../../application';
import { getPaymentMethodTranslationKey, getPaymentStatusColor } from '../../lib/presenters';

const PaymentDetailPage = () => {
  const { t } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const query = useGetPaymentByIdQuery(id ?? '');
  const retryFiscalMutation = useRetryPaymentFiscalMutation(id ?? '');
  const [retryConfirmOpen, setRetryConfirmOpen] = useState(false);
  const [financialError, setFinancialError] = useState('');
  const [financialUnknown, setFinancialUnknown] = useState(false);
  const recoveredId = useRef('');
  const { mutateAsync: recoverFiscal } = retryFiscalMutation;
  const showFinancialError = (error: unknown) => {
    const response = (error as { response?: { data?: { detail?: string; state?: string } } })?.response?.data;
    setFinancialUnknown(response?.state !== 'failed');
    setFinancialError(response?.detail ?? (error instanceof Error ? error.message : t('messages.fiscalRetryFailed')));
  };
  useEffect(() => {
    if (!id || recoveredId.current === id) return;
    recoveredId.current = id;
    void recoverFiscal(true).catch(showFinancialError);
    // Only recover when the payment changes; mutation state must not trigger another lookup.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, recoverFiscal]);
  usePageTitle(
    query.data
      ? [t('pages.payments.title'), t('pages.paymentDetail.title', { orderNumber: query.data.orderNumber })]
      : [t('pages.payments.title')],
  );

  useRedirectOnNotFound(query.error, !query.isLoading);

  if (query.isLoading) return <LoadingScreen />;
  const payment = query.data;
  if (!payment) return <Typography color="text.secondary">{tCommon('labels.notFound')}</Typography>;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('pages.paymentDetail.title', { orderNumber: payment.orderNumber })}
        action={<BackToListButton href={RoutePath.paymentList} />}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <LabelRowWithIcon
                label={t('fields.orderNumber')}
                value={
                  <DetailPageLink href={RouterPathHelper.orderView(payment.order)}>
                    #{payment.orderNumber}
                  </DetailPageLink>
                }
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
                {financialError ? (
                  <Alert severity={financialUnknown ? 'warning' : 'error'}>{financialError}</Alert>
                ) : null}
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
                    onClick={() => setRetryConfirmOpen(true)}>
                    {financialUnknown
                      ? t('actions.checkFinancialResult', { defaultValue: 'Amal holatini tekshirish' })
                      : t('actions.retryFiscal')}
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
          <TechnicalDetailsAccordion title={t('sections.providerPayload')} value={payment.providerPayload} />
        </Grid>
      </Grid>

      <ConfirmDialog
        open={retryConfirmOpen}
        onClose={() => setRetryConfirmOpen(false)}
        title={t('dialogs.retryFiscal.title', { defaultValue: 'Fiscalga qayta yuborish' })}
        content={
          financialUnknown
            ? financialError
            : t('dialogs.retryFiscal.description', {
                defaultValue:
                  'Asl Local Agent shu to‘lovga tegishli fiskal chekni tekshiradi va zarur bo‘lsa davom ettiradi.',
              })
        }
        action={
          <Button
            variant="contained"
            loading={retryFiscalMutation.isPending}
            onClick={() => {
              retryFiscalMutation
                .mutateAsync(false)
                .then((result) => {
                  setRetryConfirmOpen(false);
                  setFinancialError('');
                  setFinancialUnknown(false);
                  const results = result?.results ?? (result?.result ? [result.result] : []);
                  if (results.length > 0 && results.every((item) => item.ok === true)) {
                    toast.success(t('messages.fiscalRetrySent'));
                  } else {
                    toast.error(
                      String(results.find((item) => item.ok !== true)?.detail ?? t('messages.fiscalRetryFailed')),
                    );
                  }
                })
                .catch((error: unknown) => {
                  showFinancialError(error);
                  setRetryConfirmOpen(false);
                });
            }}>
            {financialUnknown
              ? t('actions.checkFinancialResult', { defaultValue: 'Amal holatini tekshirish' })
              : t('actions.retryFiscal')}
          </Button>
        }
      />
    </Content>
  );
};

export default PaymentDetailPage;
