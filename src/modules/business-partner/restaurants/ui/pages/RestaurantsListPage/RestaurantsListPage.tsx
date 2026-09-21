import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useGetRestaurantPortfolioSummaryQuery } from 'modules/business-partner/restaurants/application';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { canUseRestaurantPermission } from '../../shared/restaurant-helpers';

import { RestaurantPortfolioSummary } from './RestaurantPortfolioSummary';
import { RestaurantsGrid } from './RestaurantsGrid';

const RestaurantsListPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const canManageRestaurants = canAccessRestaurants(profile) && canUseRestaurantPermission(profile, 'view');
  const canCreateRestaurant = canUseRestaurantPermission(profile, 'create');
  const summaryQuery = useGetRestaurantPortfolioSummaryQuery({ enabled: canManageRestaurants });

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
        sx={{ mb: 2 }}
        action={
          <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="center">
            <RestaurantPortfolioSummary data={summaryQuery.data} loading={summaryQuery.isLoading} />
            {canCreateRestaurant ? (
              <Button
                component={RouterLink}
                href={RoutePath.organizationRestaurantCreate}
                variant="contained"
                color="black"
                startIcon={<Iconify icon="mingcute:add-line" />}>
                {t('actions.createRestaurant')}
              </Button>
            ) : null}
          </Stack>
        }
      />
      <ListPageBody>
        <RestaurantsGrid summaryError={summaryQuery.isError} onRetrySummary={() => void summaryQuery.refetch()} />
      </ListPageBody>
    </ListPageContent>
  );
};

export default RestaurantsListPage;
