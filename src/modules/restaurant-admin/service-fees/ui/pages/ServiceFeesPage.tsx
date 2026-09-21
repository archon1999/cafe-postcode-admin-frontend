import { useTranslate } from 'app/providers/locales';
import { useAdminRestaurantScopeId } from 'modules/auth';
import { MyRestaurantSectionLayout } from 'modules/restaurant-admin/restaurant-management/ui/components/MyRestaurantSectionLayout';
import { MyRestaurantSettingsTabs } from 'modules/restaurant-admin/restaurant-management/ui/components/MyRestaurantSettingsTabs';

import { ServiceFeesWorkspace } from '../components/ServiceFeesWorkspace';

export default function ServiceFeesPage() {
  const { t } = useTranslate('organizations');
  const scope = useAdminRestaurantScopeId();
  return (
    <MyRestaurantSectionLayout heading={t('serviceFees.title')}>
      <MyRestaurantSettingsTabs />
      <ServiceFeesWorkspace key={scope} />
    </MyRestaurantSectionLayout>
  );
}
