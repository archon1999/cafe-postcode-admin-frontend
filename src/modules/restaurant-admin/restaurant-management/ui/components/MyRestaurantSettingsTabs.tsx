import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessMyRestaurantGeneral, canAccessMyRestaurantSetup } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { usePathname } from 'shared/hooks/router';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

export function MyRestaurantSettingsTabs() {
  const { t } = useTranslate('organizations');
  const { profile } = useCurrentUser();
  const pathname = usePathname();
  const value = pathname.startsWith(RoutePath.organizationMyRestaurantSetup) ? 'setup' : 'general';

  return (
    <Tabs value={value} variant="scrollable" scrollButtons="auto" sx={{ mb: 3, px: { xs: 1, sm: 2 } }}>
      {canAccessMyRestaurantSetup(profile) ? (
        <Tab
          value="setup"
          icon={<Iconify icon="solar:clipboard-check-bold-duotone" width={20} />}
          iconPosition="start"
          label={t('pages.setup.title')}
          component={RouterLink}
          href={RoutePath.organizationMyRestaurantSetup}
        />
      ) : null}
      {canAccessMyRestaurantGeneral(profile) ? (
        <Tab
          value="general"
          icon={<Iconify icon="solar:shop-2-bold-duotone" width={20} />}
          iconPosition="start"
          label={t('pages.myRestaurantGeneral.title')}
          component={RouterLink}
          href={RoutePath.organizationMyRestaurantGeneral}
        />
      ) : null}
    </Tabs>
  );
}
