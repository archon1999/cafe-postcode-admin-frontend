import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

import { OrdersGrid } from './OrdersGrid';

const OrdersListPage = () => {
  const { t } = useTranslate('orders');

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.orders.title')} />
      <ListPageBody>
        <OrdersGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default OrdersListPage;
