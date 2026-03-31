import Button from '@mui/material/Button';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import type { UserManagementSurface } from '../../../domain';

import { UsersGrid } from './UsersGrid';

type UsersListPageProps = {
  surface?: UserManagementSurface;
};

const UsersListPage = ({ surface = 'user' }: UsersListPageProps) => {
  const { t } = useTranslate('users');
  const createPath = surface === 'employee' ? RoutePath.employeeCreate : RoutePath.userCreate;
  const heading = surface === 'employee' ? t('pages.employeeList.title') : t('pages.list.title');
  const createLabel = surface === 'employee' ? t('actions.createEmployee') : t('actions.create');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(createPath);

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={heading}
        action={
          <Button
            component={RouterLink}
            href={createPath}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}
            data-testid={`${surface}-list-add`}>
            {createLabel}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ListPageBody>
        <UsersGrid surface={surface} />
      </ListPageBody>
    </ListPageContent>
  );
};

export default UsersListPage;
