import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { useEffect, useState } from 'react';

import { Content } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessRestaurants } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useGetRestaurantDetailQuery } from 'modules/business-partner/restaurants/application';
import { useParams, useRedirectOnNotFound, useRouter } from 'shared/hooks/router';
import { usePageTitle } from 'shared/hooks/use-page-title';
import { BackToListButton } from 'shared/ui/BackToListButton';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import {
  RestaurantActivateDialog,
  RestaurantBranchCreateDialog,
  RestaurantCredentialsDialog,
  type RestaurantCredentialsDialogState,
  RestaurantDeactivateDialog,
  RestaurantTariffChangeDialog,
} from '../../components';
import { canUseRestaurantPermission } from '../../shared/restaurant-helpers';

import { RestaurantDetailActions } from './RestaurantDetailActions';
import { RestaurantDetailHero } from './RestaurantDetailHero';
import { RestaurantDetailSections } from './RestaurantDetailSections';

type DetailDialog = 'branch' | 'activate' | 'deactivate' | 'tariff' | null;

const RestaurantDetailPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const params = useParams();
  const id = typeof params.id === 'string' ? params.id : undefined;
  const { replace } = useRouter();
  const [dialog, setDialog] = useState<DetailDialog>(null);
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState<RestaurantCredentialsDialogState>(null);
  const canViewRestaurants = canAccessRestaurants(profile) && canUseRestaurantPermission(profile, 'view');

  const detailQuery = useGetRestaurantDetailQuery(id ?? '', {
    enabled: Boolean(id && canViewRestaurants),
  });

  useRedirectOnNotFound(detailQuery.error, Boolean(id));
  usePageTitle(
    detailQuery.data?.name ? [t('pages.restaurants.title'), detailQuery.data.name] : [t('pages.restaurants.title')],
  );

  useEffect(() => {
    if (profile && !canViewRestaurants) {
      replace(RoutePath.main);
    }
  }, [canViewRestaurants, profile, replace]);

  if (profile && !canViewRestaurants) {
    return null;
  }

  if (detailQuery.isLoading) {
    return <LoadingScreen />;
  }

  if (!id || detailQuery.isError || !detailQuery.data) {
    return (
      <Content>
        <CustomBreadcrumbs
          heading={t('restaurantDetail.pageTitle')}
          action={<BackToListButton href={RoutePath.organizationRestaurantList} />}
        />
        <Alert
          severity="error"
          action={
            id ? (
              <Button color="inherit" size="small" onClick={() => void detailQuery.refetch()}>
                {t('portfolio.retry')}
              </Button>
            ) : null
          }>
          {t('restaurantDetail.loadFailed')}
        </Alert>
      </Content>
    );
  }

  const restaurant = detailQuery.data;

  return (
    <Content>
      <Box sx={{ width: 1, maxWidth: 1440, mx: 'auto' }}>
        <CustomBreadcrumbs
          heading={t('restaurantDetail.pageTitle')}
          action={
            <Stack direction="row" spacing={1}>
              <BackToListButton href={RoutePath.organizationRestaurantList} />
              <RestaurantDetailActions
                restaurant={restaurant}
                onCreateBranch={() => setDialog('branch')}
                onActivate={() => setDialog('activate')}
                onDeactivate={() => setDialog('deactivate')}
                onChangeTariff={() => setDialog('tariff')}
                onCredentials={(credentials) => setCredentialsDialogOpen({ credentials, mode: 'reset' })}
              />
            </Stack>
          }
        />

        <Stack spacing={2.5}>
          <RestaurantDetailHero restaurant={restaurant} />
          <RestaurantDetailSections restaurant={restaurant} />
        </Stack>
      </Box>

      {dialog === 'branch' ? (
        <RestaurantBranchCreateDialog
          parentId={restaurant.id}
          parentName={restaurant.name}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'activate' ? (
        <RestaurantActivateDialog
          open={restaurant}
          onClose={() => setDialog(null)}
          onSuccess={(result) => {
            setDialog(null);
            setCredentialsDialogOpen({
              credentials: { username: result.username, password: result.password },
              mode: 'activation',
            });
          }}
        />
      ) : null}
      {dialog === 'deactivate' ? (
        <RestaurantDeactivateDialog
          open={restaurant}
          onClose={() => setDialog(null)}
          onSuccess={() => setDialog(null)}
        />
      ) : null}
      {dialog === 'tariff' ? (
        <RestaurantTariffChangeDialog
          open={restaurant}
          onClose={() => setDialog(null)}
          onSuccess={() => setDialog(null)}
        />
      ) : null}
      {credentialsDialogOpen ? (
        <RestaurantCredentialsDialog open={credentialsDialogOpen} onClose={() => setCredentialsDialogOpen(null)} />
      ) : null}
    </Content>
  );
};

export default RestaurantDetailPage;
