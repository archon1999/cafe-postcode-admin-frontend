import Button from '@mui/material/Button';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { BranchesGrid } from './BranchesGrid';

const BranchesListPage = () => {
  const { t } = useTranslate('organizations');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.organizationBranchCreate);

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.branches.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.organizationBranchCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createBranch')}
          </Button>
        }
      />
      <ListPageBody>
        <BranchesGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default BranchesListPage;
