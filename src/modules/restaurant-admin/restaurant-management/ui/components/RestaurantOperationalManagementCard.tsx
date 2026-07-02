import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';

import { RestaurantCashDesksSection } from './RestaurantCashDesksSection';
import { RestaurantPrepStationsSection } from './RestaurantPrepStationsSection';

type RestaurantOperationalManagementCardProps = {
  showCashDeskManagement: boolean;
  showIntegrationsManagement: boolean;
};

export function RestaurantOperationalManagementCard({
  showCashDeskManagement,
  showIntegrationsManagement,
}: RestaurantOperationalManagementCardProps) {
  const { t } = useTranslate('organizations');

  if (!showCashDeskManagement && !showIntegrationsManagement) {
    return null;
  }

  return (
    <Card sx={{ p: 3, mt: 3 }}>
      <Stack spacing={3}>
        <Stack spacing={0.75}>
          <Typography variant="h6">
            {t('sections.myRestaurantManagement.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('sections.myRestaurantManagement.description')}
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {showIntegrationsManagement ? (
            <RestaurantPrepStationsSection
              defaultExpanded
              title={t('pages.prepStations.title')}
              description={t('sections.myRestaurantManagement.prepStationsDescription')}
              searchPlaceholder={t('filters.searchRestaurantPrepStationsPlaceholder')}
            />
          ) : null}

          {showCashDeskManagement ? (
            <RestaurantCashDesksSection
              title={t('pages.cashDesks.title')}
              description={t('sections.myRestaurantManagement.cashDesksDescription')}
              searchPlaceholder={t('filters.searchRestaurantCashDesksPlaceholder')}
            />
          ) : null}
        </Stack>
      </Stack>
    </Card>
  );
}
