import Button from '@mui/material/Button';
import { useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import { canAccessMyRestaurantIntegrations } from 'app/routes';
import { useAdminRestaurantScopeId, useCurrentUser } from 'modules/auth';
import { Iconify } from 'shared/ui/Iconify';

import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';
import { RestaurantIntegrationsSection } from '../../components/RestaurantIntegrationsSection';

const MyRestaurantIntegrationsPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const restaurantId = useAdminRestaurantScopeId();
  const canManageIntegrations = canAccessMyRestaurantIntegrations(profile);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (profile && !canManageIntegrations) {
    return null;
  }

  return (
    <MyRestaurantSectionLayout
      heading={t('pages.integrations.title')}
      listPage
      action={
        <Button
          variant="contained"
          color="black"
          disabled={!restaurantId}
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
