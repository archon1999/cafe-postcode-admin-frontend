import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

import { OrderItemNotesGrid } from './OrderItemNotesGrid';

const OrderItemNotesListPage = () => {
  const { t } = useTranslate('orders');

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.orderItemNotes.title')} />
      <ListPageBody>
        <OrderItemNotesGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default OrderItemNotesListPage;
