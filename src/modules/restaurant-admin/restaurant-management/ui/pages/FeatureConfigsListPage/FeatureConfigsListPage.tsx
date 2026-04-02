import Button from '@mui/material/Button';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { FeatureConfigsGrid } from './FeatureConfigsGrid';

const FeatureConfigsListPage = () => {
  const { t } = useTranslate('organizations');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.organizationFeatureConfigCreate);

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.featureConfigs.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.organizationFeatureConfigCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createFeatureConfig')}
          </Button>
        }
      />
      <ListPageBody>
        <FeatureConfigsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default FeatureConfigsListPage;
