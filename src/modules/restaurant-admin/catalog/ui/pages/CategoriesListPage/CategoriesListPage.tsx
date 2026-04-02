import Button from '@mui/material/Button';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { CategoriesGrid } from './CategoriesGrid';

const CategoriesListPage = () => {
  const { t } = useTranslate('catalog');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.catalogCategoryCreate);
  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.categories.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.catalogCategoryCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createCategory', { defaultValue: 'Yangi kategoriya' })}
          </Button>
        }
      />
      <ListPageBody>
        <CategoriesGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default CategoriesListPage;
