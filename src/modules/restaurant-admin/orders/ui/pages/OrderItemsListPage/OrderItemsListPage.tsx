import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

import { OrderItemsGrid } from './OrderItemsGrid';

const OrderItemsListPage = () => {
  const { t } = useTranslate('orders');

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.orderItems.title')} />
      <ListPageBody>
        <OrderItemsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default OrderItemsListPage;
