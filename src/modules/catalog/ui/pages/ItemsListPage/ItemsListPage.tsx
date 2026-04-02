import Button from '@mui/material/Button';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { ItemsGrid } from './ItemsGrid';

const ItemsListPage = () => {
  const { t } = useTranslate('catalog');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.catalogItemCreate);

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.items.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.catalogItemCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createItem', { defaultValue: 'Yangi mahsulot' })}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <ListPageBody>
        <ItemsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default ItemsListPage;
