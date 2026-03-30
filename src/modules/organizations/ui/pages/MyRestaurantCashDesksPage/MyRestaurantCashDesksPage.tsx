import { useEffect } from 'react';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurant } from 'app/routes';
import { useCurrentUser } from 'modules/auth';
import { useRouter } from 'shared/hooks/router';
import { LoadingScreen } from 'shared/ui/LoadingScreen';

import { BranchCashDesksSection } from '../../components/BranchCashDesksSection';
import { MyRestaurantSectionLayout } from '../../components/MyRestaurantSectionLayout';

const MyRestaurantCashDesksPage = () => {
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
    <MyRestaurantSectionLayout heading={t('pages.cashDesks.title', { defaultValue: 'Kassalar' })}>
      <BranchCashDesksSection
        defaultExpanded
        title={t('pages.cashDesks.title', { defaultValue: 'Kassalar' })}
        description={t('sections.myRestaurantManagement.cashDesksDescription', {
          defaultValue: "Restorandagi kassalar va to'lov sozlamalarini boshqaring.",
        })}
        searchPlaceholder={t('filters.searchRestaurantCashDesksPlaceholder', {
          defaultValue: "Kassa nomi yoki joylashuvi bo'yicha qidiring",
        })}
      />
    </MyRestaurantSectionLayout>
  );
};

export default MyRestaurantCashDesksPage;
