import { useEffect } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { RestaurantPrepStationsSection } from '../../components/RestaurantPrepStationsSection';
import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';

const MyRestaurantPrepStationsPage = () => {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const restaurantId = profile?.restaurantId ?? null;
  const canManageMyRestaurant = canAccessMyRestaurant(profile);

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
    <MyRestaurantSectionLayout heading={t('pages.prepStations.title', { defaultValue: 'Tayyorlash stansiyalari' })}>
      <RestaurantPrepStationsSection
        defaultExpanded
        title={t('pages.prepStations.title', { defaultValue: 'Tayyorlash stansiyalari' })}
        description={t('sections.myRestaurantManagement.prepStationsDescription', {
          defaultValue: 'Restorandagi tayyorlash stansiyalarini boshqaring.',
        })}
        searchPlaceholder={t('filters.searchRestaurantPrepStationsPlaceholder', {
          defaultValue: "Stansiya nomi bo'yicha qidiring",
        })}
      />
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantPrepStationsPage;
