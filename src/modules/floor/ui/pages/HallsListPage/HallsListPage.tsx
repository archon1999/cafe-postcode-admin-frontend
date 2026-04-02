import Button from '@mui/material/Button';
import { useMatch } from 'react-router';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { HallDialog } from '../../components/HallDialog/HallDialog';

import { HallsGrid } from './HallsGrid';

const HallsListPage = () => {
  const { t } = useTranslate('floor');
  const { replace } = useRouter();
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.floorHallCreate);
  const createMatch = useMatch(RoutePath.floorHallCreate);
  const editMatch = useMatch(RoutePath.floorHallEdit);

  const activeHallId = editMatch?.params.id ?? null;
  const isDialogOpen = Boolean(createMatch || editMatch);

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.halls.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.floorHallCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createHall')}
          </Button>
        }
      />
      <ListPageBody>
        <HallsGrid />
      </ListPageBody>
      <HallDialog open={isDialogOpen} hallId={activeHallId} onClose={() => replace(RoutePath.floorHallList)} />
    </ListPageContent>
  );
};

export default HallsListPage;
