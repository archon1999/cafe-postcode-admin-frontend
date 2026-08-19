import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useEffect } from 'react';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useGetRestaurantDetailQuery } from 'modules/business-partner/restaurants/application';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';
import { RouterLink } from 'shared/ui/RouterLink';

import { RestaurantDetailSections } from './RestaurantDetailSections';

const RestaurantDetailPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { replace } = useRouter();
  const canManageRestaurants = canAccessRestaurants(profile);

  const detailQuery = useGetRestaurantDetailQuery(id ?? '', {
    enabled: Boolean(id && canManageRestaurants),
  });

  useRedirectOnNotFound(detailQuery.error, Boolean(id));

  useEffect(() => {
    if (profile && !canManageRestaurants) {
      replace(RoutePath.main);
    }
  }, [canManageRestaurants, profile, replace]);

  if (profile && !canManageRestaurants) {
    return null;
  }

  if (!id || detailQuery.isLoading || !detailQuery.data) {
    return <LoadingScreen />;
  }

  const restaurant = detailQuery.data;
  return (
    <Content>
      <CustomBreadcrumbs
        heading={restaurant.name}
        action={
          <Stack direction="row" spacing={1}>
            <BackToListButton href={RoutePath.organizationRestaurantList} />
            <Button
              component={RouterLink}
              href={RouterPathHelper.organizationRestaurantEdit(restaurant.id)}
              variant="contained"
              color="black"
              startIcon={<Iconify icon="solar:pen-bold" />}>
              {t('actions.edit')}
            </Button>
          </Stack>
        }
      />

      <RestaurantDetailSections restaurant={restaurant} />
    </Content>
  );
};

export default RestaurantDetailPage;
