import Button from '@mui/material/Button';
import { useEffect } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { RestaurantsGrid } from './RestaurantsGrid';

const RestaurantsListPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const canManageRestaurants = canAccessRestaurants(profile);

  useEffect(() => {
    if (profile && !canManageRestaurants) {
      replace(RoutePath.main);
    }
  }, [canManageRestaurants, profile, replace]);

  if (profile && !canManageRestaurants) {
    return null;
  }

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.restaurants.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.organizationRestaurantCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}>
            {t('actions.createRestaurant')}
          </Button>
        }
      />
      <ListPageBody>
        <RestaurantsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default RestaurantsListPage;
