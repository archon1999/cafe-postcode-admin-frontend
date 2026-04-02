import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

import { TableSessionsGrid } from './TableSessionsGrid';

const TableSessionsListPage = () => {
  const { t } = useTranslate('floor');

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.tableSessions.title')} />
      <ListPageBody>
        <TableSessionsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default TableSessionsListPage;
