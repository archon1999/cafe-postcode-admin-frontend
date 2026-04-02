import Button from '@mui/material/Button';
import { useEffect } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessBusinessPartners } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { BusinessPartnersGrid } from './BusinessPartnersGrid';

const BusinessPartnersListPage = () => {
  const { t } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const canManagePlatform = canAccessBusinessPartners(profile);

  useEffect(() => {
    if (profile && !canManagePlatform) {
      replace(RoutePath.main);
    }
  }, [canManagePlatform, profile, replace]);

  if (profile && !canManagePlatform) {
    return null;
  }

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.businessPartners.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.platformBusinessPartnerCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}>
            {t('actions.createBusinessPartner')}
          </Button>
        }
      />

      <ListPageBody>
        <BusinessPartnersGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default BusinessPartnersListPage;
