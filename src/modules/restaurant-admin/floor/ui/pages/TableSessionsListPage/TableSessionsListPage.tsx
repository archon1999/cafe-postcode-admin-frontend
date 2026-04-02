import Button from '@mui/material/Button';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { TableSessionsGrid } from './TableSessionsGrid';

const TableSessionsListPage = () => {
  const { t } = useTranslate('floor');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.floorTableSessionCreate);

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.tableSessions.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.floorTableSessionCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createTableSession')}
          </Button>
        }
      />
      <ListPageBody>
        <TableSessionsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default TableSessionsListPage;
