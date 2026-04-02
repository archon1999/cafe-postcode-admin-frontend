import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { useTranslate } from 'app/providers/locales';

import { RestaurantCashDesksSection } from './RestaurantCashDesksSection';
import { RestaurantDevicesSection } from './RestaurantDevicesSection';
import { RestaurantDistributionPointsSection } from './RestaurantDistributionPointsSection';
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
            {t('sections.myRestaurantManagement.title', { defaultValue: "Restoran bo'yicha boshqaruv" })}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('sections.myRestaurantManagement.description', {
              defaultValue:
                'Kassalar, qurilmalar, tayyorlash stansiyalari va tarqatish nuqtalarini shu yerda boshqaring.',
            })}
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {showIntegrationsManagement ? (
            <RestaurantPrepStationsSection
              defaultExpanded
              title={t('pages.prepStations.title')}
              description={t('sections.myRestaurantManagement.prepStationsDescription', {
                defaultValue: 'Restorandagi tayyorlash stansiyalarini boshqaring.',
              })}
              searchPlaceholder={t('filters.searchRestaurantPrepStationsPlaceholder', {
                defaultValue: "Stansiya nomi bo'yicha qidiring",
              })}
            />
          ) : null}

          {showCashDeskManagement ? (
            <RestaurantCashDesksSection
              title={t('pages.cashDesks.title')}
              description={t('sections.myRestaurantManagement.cashDesksDescription', {
                defaultValue: "Restorandagi kassalar va to'lov sozlamalarini boshqaring.",
              })}
              searchPlaceholder={t('filters.searchRestaurantCashDesksPlaceholder', {
                defaultValue: "Kassa nomi yoki joylashuvi bo'yicha qidiring",
              })}
            />
          ) : null}

          {showIntegrationsManagement ? (
            <>
              <RestaurantDevicesSection
                title={t('pages.devices.title')}
                description={t('sections.myRestaurantManagement.devicesDescription', {
                  defaultValue: 'Restorandagi POS qurilmalari va zal birikmalarini boshqaring.',
                })}
                searchPlaceholder={t('filters.searchRestaurantDevicesPlaceholder', {
                  defaultValue: "Qurilma nomi yoki zal bo'yicha qidiring",
                })}
              />
              <RestaurantDistributionPointsSection
                title={t('pages.distributionPoints.title')}
                description={t('sections.myRestaurantManagement.distributionPointsDescription', {
                  defaultValue: 'Restorandagi buyurtma kanallari va tarqatish nuqtalarini boshqaring.',
                })}
                searchPlaceholder={t('filters.searchRestaurantDistributionPointsPlaceholder', {
                  defaultValue: "Nuqta nomi yoki kanal bo'yicha qidiring",
                })}
              />
            </>
          ) : null}
        </Stack>
      </Stack>
    </Card>
  );
}
