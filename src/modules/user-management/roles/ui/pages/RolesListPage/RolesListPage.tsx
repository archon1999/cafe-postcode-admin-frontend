import Button from '@mui/material/Button';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { RolesGrid } from './RolesGrid';

const RolesListPage = () => {
  const { t } = useTranslate('users');

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.roles.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.roleCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}>
            {t('actions.roleCreate')}
          </Button>
        }
      />
      <ListPageBody>
        <RolesGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default RolesListPage;
