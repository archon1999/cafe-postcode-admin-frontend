import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useEffect, useState } from 'react';

import { CONFIG } from 'app/config/globalConfig';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';

import { MigrationPanel } from './components/MigrationPanel';
import { SecurityEventsPanel } from './components/SecurityEventsPanel';
import { TelegramPanel } from './components/TelegramPanel';

type ControlCenterTab = 'migration' | 'security' | 'telegram';

function SecurityCenterPage() {
  const { t } = useTranslate('security-center');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const [tab, setTab] = useState<ControlCenterTab>('migration');

  useEffect(() => {
    if (profile && !profile.isSuperuser) replace(RoutePath.main);
  }, [profile, replace]);

  if (profile && !profile.isSuperuser) return null;

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('controlCenter.title')}
        action={
          <Button
            component="a"
            href={CONFIG.controlAppUrl}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="solar:widget-5-bold" />}>
            {t('controlCenter.openControl')}
          </Button>
        }
      />
      <ListPageBody sx={{ overflow: 'auto', pb: 3 }}>
        <Card sx={{ overflow: 'hidden' }}>
          <Tabs
            value={tab}
            onChange={(_event, value: ControlCenterTab) => setTab(value)}
            variant="scrollable"
            allowScrollButtonsMobile
            aria-label={t('controlCenter.tabsLabel')}
            sx={{ px: { xs: 1, sm: 2 }, borderBottom: 1, borderColor: 'divider' }}>
            <Tab value="migration" label={t('tabs.migration')} />
            <Tab value="security" label={t('tabs.events')} />
            <Tab value="telegram" label={t('tabs.telegram')} />
          </Tabs>
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {tab === 'migration' && <MigrationPanel />}
            {tab === 'security' && <SecurityEventsPanel />}
            {tab === 'telegram' && <TelegramPanel />}
          </Box>
        </Card>
      </ListPageBody>
    </ListPageContent>
  );
}

export default SecurityCenterPage;
