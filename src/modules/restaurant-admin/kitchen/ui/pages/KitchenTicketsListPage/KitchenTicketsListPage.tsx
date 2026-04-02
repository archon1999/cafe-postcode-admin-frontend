import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

import { KitchenTicketsGrid } from './KitchenTicketsGrid';

const KitchenTicketsListPage = () => {
  const { t } = useTranslate('kitchen');

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.list.title')} />

      <ListPageBody>
        <KitchenTicketsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default KitchenTicketsListPage;
