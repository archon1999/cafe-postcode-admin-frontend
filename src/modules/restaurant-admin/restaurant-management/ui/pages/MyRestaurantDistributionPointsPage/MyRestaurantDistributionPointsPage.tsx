import { useEffect } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { RestaurantDistributionPointsSection } from '../../components/RestaurantDistributionPointsSection';
import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';

const MyRestaurantDistributionPointsPage = () => {
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
    <MyRestaurantSectionLayout heading={t('pages.distributionPoints.title', { defaultValue: 'Tarqatish nuqtalari' })}>
      <RestaurantDistributionPointsSection
        defaultExpanded
        title={t('pages.distributionPoints.title', { defaultValue: 'Tarqatish nuqtalari' })}
        description={t('sections.myRestaurantManagement.distributionPointsDescription', {
          defaultValue: 'Restorandagi buyurtma kanallari va tarqatish nuqtalarini boshqaring.',
        })}
        searchPlaceholder={t('filters.searchRestaurantDistributionPointsPlaceholder', {
          defaultValue: "Nuqta nomi yoki kanal bo'yicha qidiring",
        })}
      />
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantDistributionPointsPage;
