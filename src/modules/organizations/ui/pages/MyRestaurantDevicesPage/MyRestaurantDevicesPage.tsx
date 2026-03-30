import { useEffect } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { BranchDevicesSection } from '../../components/BranchDevicesSection';
import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';

const MyRestaurantDevicesPage = () => {
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
    <MyRestaurantSectionLayout heading={t('pages.devices.title', { defaultValue: 'Qurilmalar' })}>
      <BranchDevicesSection
        defaultExpanded
        title={t('pages.devices.title', { defaultValue: 'Qurilmalar' })}
        description={t('sections.myRestaurantManagement.devicesDescription', {
          defaultValue: 'Restorandagi POS qurilmalari va zal birikmalarini boshqaring.',
        })}
        searchPlaceholder={t('filters.searchRestaurantDevicesPlaceholder', {
          defaultValue: "Qurilma nomi yoki zal bo'yicha qidiring",
        })}
      />
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantDevicesPage;
