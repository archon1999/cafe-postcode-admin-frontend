import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';
import { RestaurantDistributionPointsSection } from '../../components/RestaurantDistributionPointsSection';

const MyRestaurantDistributionPointsPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const restaurantId = profile?.restaurantId ?? null;
  const canManageMyRestaurant = canAccessMyRestaurant(profile);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (profile && (!canManageMyRestaurant || !restaurantId)) {
      replace(RoutePath.main);
    }
  }, [canManageMyRestaurant, profile, replace, restaurantId]);

  if (profile && (!canManageMyRestaurant || !restaurantId)) {
    return null;
  }

  if (!restaurantId) {
    return <LoadingScreen />;
  }

  return (
    <MyRestaurantSectionLayout
      heading={t('pages.distributionPoints.title')}
      listPage
      action={
        <Button
          variant="contained"
          color="black"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCreateDialogOpen(true)}>
          {t('actions.createDistributionPoint')}
        </Button>
      }>
      <RestaurantDistributionPointsSection
        layoutMode="page"
        searchPlaceholder={t('filters.searchRestaurantDistributionPointsPlaceholder')}
        createDialogOpen={createDialogOpen}
        onCreateDialogOpenChange={setCreateDialogOpen}
      />
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantDistributionPointsPage;
