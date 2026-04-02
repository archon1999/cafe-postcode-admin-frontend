import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useParams, useRedirectOnNotFound } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { LabelRowWithIcon } from 'shared/ui/LabelRowWithIcon/LabelRowWithIcon';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { useGetOrderItemNoteByIdQuery } from '../../../application';
import { formatDateTime } from '../../lib/presenters';

const OrderItemNoteDetailPage = () => {
  const { t } = useTranslate('orders');
  const { id } = useParams<{ id: string }>();
  const query = useGetOrderItemNoteByIdQuery(id ?? '');
  useRedirectOnNotFound(query.error, !query.isLoading);
  if (query.isLoading) return <LoadingScreen />;
  const note = query.data;
  if (!note) return null;

  return (
    <Content>
      <CustomBreadcrumbs
        heading={t('pages.orderItemNoteDetail.title')}
        links={[
          { name: t('pages.orderItemNotes.title'), href: RoutePath.orderItemNoteList },
          { name: `#${note.orderNumber}` },
        ]}
      />
      <Card sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <LabelRowWithIcon
            label={t('fields.orderNumber')}
            value={`#${note.orderNumber}`}
            icon="solar:bill-list-bold-duotone"
          />
          <LabelRowWithIcon label={t('fields.item')} value={note.catalogItemName} icon="solar:plate-bold-duotone" />
          <LabelRowWithIcon label={t('fields.table')} value={note.tableName || '-'} icon="solar:home-bold-duotone" />
          <LabelRowWithIcon
            label={t('fields.createdAt')}
            value={formatDateTime(note.createdAt)}
            icon="solar:calendar-date-bold-duotone"
          />
          <Stack spacing={1}>
            <Typography variant="subtitle2" color="text.secondary">
              {t('fields.noteBody')}
            </Typography>
            <Box component="pre" sx={{ m: 0, whiteSpace: 'pre-wrap', typography: 'body2' }}>
              {note.body}
            </Box>
          </Stack>
        </Stack>
      </Card>
    </Content>
  );
};

export default OrderItemNoteDetailPage;
