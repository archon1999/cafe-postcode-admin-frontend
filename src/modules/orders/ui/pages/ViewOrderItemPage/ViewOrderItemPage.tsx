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
import { formatMoney } from 'shared/utils/format-money';

import { useGetOrderItemByIdQuery } from '../../../application';
import { formatDateTime, getOrderItemStatusColor } from '../../lib/presenters';

const ViewOrderItemPage = () => {
  const { t } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const { id } = useParams<{ id: string }>();
  const query = useGetOrderItemByIdQuery(id ?? '');
  useRedirectOnNotFound(query.error, !query.isLoading);
  if (query.isLoading) return <LoadingScreen />;
  const item = query.data;
  if (!item) return <Typography color="text.secondary">{tCommon('labels.notFound')}</Typography>;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={item.catalogItemName}
        links={[{ name: t('pages.orderItems.title'), href: RoutePath.orderItemList }, { name: item.catalogItemName }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <LabelRowWithIcon
                label={t('fields.orderNumber')}
                value={`#${item.orderNumber}`}
                icon="solar:bill-list-bold-duotone"
              />
              <LabelRowWithIcon label={t('fields.item')} value={item.catalogItemName} icon="solar:plate-bold-duotone" />
              <LabelRowWithIcon
                label={t('fields.prepStation')}
                value={item.prepStationName || '-'}
                icon="solar:chef-hat-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.createdBy')}
                value={item.createdByName || '-'}
                icon="solar:user-id-bold-duotone"
              />
              <LabelRowWithIcon
                label={t('fields.createdAt')}
                value={formatDateTime(item.createdAt)}
                icon="solar:calendar-date-bold-duotone"
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
                <Label color={getOrderItemStatusColor(item.status)} variant="soft">
                  {t(`orderItemStatuses.${item.status}`)}
                </Label>
              </Stack>
            </Card>
            <Card sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  {t('fields.quantity')}: {item.quantity}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('fields.unitPrice')}: {formatMoney(item.unitPrice)}
                </Typography>
                <Typography variant="h5">
                  {t('fields.lineTotal')}: {formatMoney(item.lineTotal)}
                </Typography>
              </Stack>
            </Card>
          </Stack>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="h6">{t('sections.itemNote')}</Typography>
              <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', typography: 'body2' }}>
                {item.note || '-'}
              </Box>
            </Stack>
          </Card>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <Typography variant="h6">{t('sections.orderItemNotes')}</Typography>
              {item.notes.length ? (
                <Stack divider={<Divider flexItem />} spacing={2}>
                  {item.notes.map((note) => (
                    <Stack key={note.id} spacing={0.5}>
                      <Typography variant="body2">{note.body}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateTime(note.createdAt)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">{t('labels.noOrderItemNotes')}</Typography>
              )}
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Content>
  );
};

export default ViewOrderItemPage;
