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
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Label } from 'shared/ui/Label';
import { LabelRowWithIcon } from 'shared/ui/LabelRowWithIcon/LabelRowWithIcon';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatMoney } from 'shared/utils/format-money';
import { formatDateTime as formatTashkentDateTime } from 'shared/utils/format-time';

import { useGetKitchenTicketByIdQuery } from '../../../application';

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  return formatTashkentDateTime(value, 'DD.MM.YYYY HH:mm');
}

const KitchenTicketDetailPage = () => {
  const { t } = useTranslate('kitchen');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const ticketQuery = useGetKitchenTicketByIdQuery(id ?? '');

  useRedirectOnNotFound(ticketQuery.error, !ticketQuery.isLoading);

  if (ticketQuery.isLoading) {
    return <LoadingScreen />;
  }

  const ticket = ticketQuery.data;

  if (!ticket) {
    return (
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {tCommon('labels.notFound')}
      </Typography>
    );
  }

  const printedPayload =
    ticket.printedPayload && Object.keys(ticket.printedPayload).length
      ? JSON.stringify(ticket.printedPayload, null, 2)
      : null;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('pages.view.title', { orderNumber: ticket.orderNumber })}
        action={<BackToListButton href={RoutePath.kitchenTicketList} />}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3, height: 1 }}>
            <Stack spacing={2.5}>
              <LabelRowWithIcon
                label={t('fields.orderNumber')}
                value={`#${ticket.orderNumber}`}
                icon="solar:ticket-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.prepStation')}
                value={ticket.prepStationName}
                icon="solar:chef-hat-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.hall')}
                value={formatHallDisplayName(ticket.hallName, undefined, tCommon)}
                icon="solar:home-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.table')}
                value={ticket.tableName || '-'}
                icon="solar:plate-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.waiter')}
                value={ticket.waiterName || '-'}
                icon="solar:user-id-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.createdAt')}
                value={formatDateTime(ticket.createdAt)}
                icon="solar:calendar-date-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.completedAt')}
                value={formatDateTime(ticket.completedAt)}
                icon="solar:check-circle-bold-duotone"
              />
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={2} sx={{ height: 1 }}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {t('fields.status')}
                </Typography>
                <Label
                  color={ticket.status === 'done' ? 'success' : ticket.status === 'cooking' ? 'info' : 'warning'}
                  variant="soft">
                  {t(`status.${ticket.status}`)}
                </Label>
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {t('fields.routedVia')}
                </Typography>
                <Label
                  color={
                    ticket.routedVia === 'both' ? 'success' : ticket.routedVia === 'printer' ? 'secondary' : 'info'
                  }
                  variant="soft">
                  {t(`routedVia.${ticket.routedVia}`)}
                </Label>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', pt: 1 }}>
                  {t('fields.printed')}
                </Typography>
                <Label color={ticket.isPrinted ? 'success' : 'default'} variant="soft">
                  {ticket.isPrinted ? t('printed.printed') : t('printed.notPrinted')}
                </Label>
              </Stack>
            </Card>

            <Card sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  {t('fields.itemsCount')}
                </Typography>
                <Typography variant="h4">{ticket.items.length}</Typography>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="h6">{t('sections.items')}</Typography>

              {ticket.items.length ? (
                <Stack divider={<Divider flexItem />} spacing={2}>
                  {ticket.items.map((item) => (
                    <Stack key={item.id} spacing={1.25}>
                      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle1">{item.catalogItemName}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {t('fields.itemStatus')}: {item.status}
                          </Typography>
                        </Stack>

                        <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} spacing={0.5}>
                          <Typography variant="subtitle2">
                            {t('fields.quantity')}: {item.quantity}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {t('fields.unitPrice')}: {formatMoney(item.unitPrice)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {t('fields.lineTotal')}: {formatMoney(item.lineTotal)}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {t('fields.note')}: {item.note || '-'}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {t('labels.noItems')}
                </Typography>
              )}
            </Stack>
          </Card>
        </Grid>

        {printedPayload ? (
          <Grid size={{ xs: 12 }}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">{t('sections.printedPayload')}</Typography>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    borderRadius: 2,
                    overflow: 'auto',
                    typography: 'body2',
                    bgcolor: 'background.neutral',
                  }}>
                  {printedPayload}
                </Box>
              </Stack>
            </Card>
          </Grid>
        ) : null}
      </Grid>
    </Content>
  );
};

export default KitchenTicketDetailPage;
