import Button from '@mui/material/Button';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { canAccessMyRestaurant } from 'app/routes';
import { useAdminRestaurantScopeId, useCurrentUser } from 'modules/auth';
import { Iconify } from 'shared/ui/Iconify';

import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';
import { RestaurantCashDesksSection } from '../../components/RestaurantCashDesksSection';

const MyRestaurantCashDesksPage = () => {
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
      heading={t('pages.cashDesks.title')}
      listPage
      action={
        <Button
          variant="contained"
          color="black"
          disabled={!restaurantId}
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCreateDialogOpen(true)}>
          {t('actions.createCashDesk')}
        </Button>
      }>
      <RestaurantCashDesksSection
        layoutMode="page"
        searchPlaceholder={t('filters.searchRestaurantCashDesksPlaceholder')}
        createDialogOpen={createDialogOpen}
        onCreateDialogOpenChange={setCreateDialogOpen}
      />
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantCashDesksPage;
