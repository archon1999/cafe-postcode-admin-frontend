import Button from '@mui/material/Button';
import { useEffect, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurantIntegrations } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';
import { Iconify } from 'shared/ui/Iconify';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';
import { RestaurantIntegrationsSection } from '../../components/RestaurantIntegrationsSection';

const MyRestaurantIntegrationsPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const restaurantId = profile?.restaurantId ?? null;
  const canManageIntegrations = canAccessMyRestaurantIntegrations(profile);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    if (profile && (!canManageIntegrations || !restaurantId)) {
      replace(RoutePath.main);
    }
  }, [canManageIntegrations, profile, replace, restaurantId]);

  if (profile && (!canManageIntegrations || !restaurantId)) {
    return null;
  }

  if (!restaurantId) {
    return <LoadingScreen />;
  }

  return (
    <MyRestaurantSectionLayout
      heading={t('pages.integrations.title')}
      listPage
      action={
        <Button
          variant="contained"
          color="black"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={() => setCreateDialogOpen(true)}>
          {t('actions.createIntegration')}
        </Button>
      }>
      <RestaurantIntegrationsSection
        layoutMode="page"
        searchPlaceholder={t('filters.searchIntegrationsPlaceholder')}
        createDialogOpen={createDialogOpen}
        onCreateDialogOpenChange={setCreateDialogOpen}
      />
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantIntegrationsPage;
