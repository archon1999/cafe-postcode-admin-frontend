import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

import { PaymentsGrid } from './PaymentsGrid';

const PaymentsListPage = () => {
  const { t } = useTranslate('orders');

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.payments.title')} sx={{ mb: { xs: 3, md: 5 } }} />
      <ListPageBody>
        <PaymentsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default PaymentsListPage;
