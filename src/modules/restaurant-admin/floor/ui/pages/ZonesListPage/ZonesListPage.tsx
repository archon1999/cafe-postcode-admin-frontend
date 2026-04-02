import Button from '@mui/material/Button';
import { useMatch } from 'react-router';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';

import { ZoneDialog } from '../../components/ZoneDialog/ZoneDialog';

import { ZonesGrid } from './ZonesGrid';

const ZonesListPage = () => {
  const { t } = useTranslate('floor');
  const { replace } = useRouter();
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.floorZoneCreate);
  const createMatch = useMatch(RoutePath.floorZoneCreate);
  const editMatch = useMatch(RoutePath.floorZoneEdit);

  const activeZoneId = editMatch?.params.id ?? null;
  const isDialogOpen = Boolean(createMatch || editMatch);

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.zones.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.floorZoneCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createZone')}
          </Button>
        }
      />
      <ListPageBody>
        <ZonesGrid />
      </ListPageBody>
      <ZoneDialog open={isDialogOpen} zoneId={activeZoneId} onClose={() => replace(RoutePath.floorZoneList)} />
    </ListPageContent>
  );
};

export default ZonesListPage;
