import Button from '@mui/material/Button';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { canAccessMyRestaurant } from 'app/routes';
import { useAdminRestaurantScopeId } from 'modules/auth';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { Iconify } from 'shared/ui/Iconify';

import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';
import { RestaurantPrepStationsSection } from '../../components/RestaurantPrepStationsSection';

const MyRestaurantPrepStationsPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const restaurantId = useAdminRestaurantScopeId();
  const canManageMyRestaurant = canAccessMyRestaurant(profile);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (profile && !canManageMyRestaurant) {
    return null;
  }

  return (
    <MyRestaurantSectionLayout
      heading={t('pages.prepStations.title')}
      listPage
      action={
        <Button
          variant="contained"
          color="black"
          disabled={!restaurantId}
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCreateDialogOpen(true)}>
          {t('actions.createPrepStation')}
        </Button>
      }>
      <RestaurantPrepStationsSection
        layoutMode="page"
        searchPlaceholder={t('filters.searchRestaurantPrepStationsPlaceholder')}
        createDialogOpen={createDialogOpen}
        onCreateDialogOpenChange={setCreateDialogOpen}
      />
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantPrepStationsPage;
