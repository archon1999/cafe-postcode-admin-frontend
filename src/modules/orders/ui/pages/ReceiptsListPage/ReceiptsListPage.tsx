import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

import { ReceiptsGrid } from './ReceiptsGrid';

const ReceiptsListPage = () => {
  const { t } = useTranslate('orders');

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.receipts.title')} />
      <ListPageBody>
        <ReceiptsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default ReceiptsListPage;
