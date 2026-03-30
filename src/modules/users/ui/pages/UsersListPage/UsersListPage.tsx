import Button from '@mui/material/Button';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { UsersGrid } from './UsersGrid';

const UsersListPage = () => {
  const { t } = useTranslate('users');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.userCreate);

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.list.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.userCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}
            data-testid="user-list-add">
            {t('actions.create')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ListPageBody>
        <UsersGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default UsersListPage;
