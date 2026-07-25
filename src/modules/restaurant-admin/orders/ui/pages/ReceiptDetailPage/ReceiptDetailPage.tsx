import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound } from 'shared/hooks/router';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import { LabelRowWithIcon } from 'shared/ui/LabelRowWithIcon/LabelRowWithIcon';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime } from 'shared/utils/format-time';

import { useGetReceiptByIdQuery } from '../../../application';
import {
  getPaymentMethodTranslationKey,
  getReceiptKindTranslationKey,
  getReceiptStatusColor,
} from '../../lib/presenters';
import { getReceiptFiscalQrUrl } from '../../lib/receipt-fiscal-qr';

const ReceiptDetailPage = () => {
  const { t } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const query = useGetReceiptByIdQuery(id ?? '');

  useRedirectOnNotFound(query.error, !query.isLoading);

  if (query.isLoading) return <LoadingScreen />;
  const receipt = query.data;
  if (!receipt) return <Typography color="text.secondary">{tCommon('labels.notFound')}</Typography>;
  const fiscalQrUrl = getReceiptFiscalQrUrl(receipt);

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('pages.receiptDetail.title', { orderNumber: receipt.orderNumber })}
        action={<BackToListButton href={RoutePath.receiptList} />}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <LabelRowWithIcon
                label={t('fields.orderNumber')}
                value={`#${receipt.orderNumber}`}
                icon="solar:bill-list-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.kind')}
                value={t(getReceiptKindTranslationKey(receipt.kind))}
                icon="custom:invoice-duotone"
              />
              <LabelRowWithIcon label={t('fields.provider')} value={receipt.provider || '-'} icon="solar:inbox-bold" />
              <Stack direction="row" spacing={1}>
                <Iconify icon="eva:external-link-fill" width={20} height={20} />
                <Stack direction="column" spacing={0.75}>
                  <Box component="span" sx={{ typography: 'body2', color: 'text.secondary' }}>
                    {t('fields.fiscalQrCode')}
                  </Box>
                  {fiscalQrUrl ? (
                    <Button
                      component="a"
                      href={fiscalQrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="outlined"
                      size="small"
                      sx={{ alignSelf: 'flex-start' }}>
                      {t('actions.openFiscalQr')}
                    </Button>
                  ) : (
                    <Typography variant="subtitle2" color="text.secondary">
                      -
                    </Typography>
                  )}
                </Stack>
              </Stack>
              <LabelRowWithIcon
                label={t('fields.paymentMethod')}
                value={receipt.paymentMethod ? t(getPaymentMethodTranslationKey(receipt.paymentMethod)) : '-'}
                icon="solar:card-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.paymentAmount')}
                value={formatMoney(receipt.paymentAmount)}
                icon="solar:wallet-money-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.reprintCount')}
                value={String(receipt.reprintCount ?? 0)}
                icon="solar:restart-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.lastReprintedAt')}
                value={formatDateTime(receipt.lastReprintedAt)}
                icon="solar:history-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.createdAt')}
                value={formatDateTime(receipt.createdAt)}
                icon="solar:calendar-date-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.updatedAt')}
                value={formatDateTime(receipt.updatedAt)}
                icon="solar:history-bold-duotone"
              />
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('fields.status')}
              </Typography>
              <Label color={getReceiptStatusColor(receipt.status)} variant="soft">
                {t(`receiptStatuses.${receipt.status}`)}
              </Label>
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6">{t('sections.receiptPayload')}</Typography>
              <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', typography: 'body2' }}>
                {JSON.stringify(receipt.payload ?? {}, null, 2)}
              </Box>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Content>
  );
};

export default ReceiptDetailPage;
