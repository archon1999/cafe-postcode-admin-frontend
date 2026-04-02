import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';

import { PermissionsGrid } from './PermissionsGrid';

const PermissionsListPage = () => {
  const { t } = useTranslate('users');

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.permissions.title')} sx={{ mb: { xs: 3, md: 5 } }} />
      <ListPageBody>
        <PermissionsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default PermissionsListPage;
