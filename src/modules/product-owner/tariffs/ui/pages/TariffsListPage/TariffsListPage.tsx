import Button from '@mui/material/Button';
import { useEffect } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath, canAccessTariffs } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { TariffsGrid } from './TariffsGrid';

const TariffsListPage = () => {
  const { t } = useTranslate('platform');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const canManagePlatform = canAccessTariffs(profile);

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
        heading={t('pages.tariffs.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.platformTariffCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}>
            {t('actions.createTariff')}
          </Button>
        }
      />

      <ListPageBody>
        <TariffsGrid />
      </ListPageBody>
    </ListPageContent>
  );
};

export default TariffsListPage;
