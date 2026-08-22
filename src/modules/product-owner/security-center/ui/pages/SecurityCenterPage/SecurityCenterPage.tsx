import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
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

import { MonitoringPanel, SecurityEventsPanel, TelegramPanel } from './components';
import type { SecurityEventsDateRange } from './components/security-events-date-range';

type ControlCenterSection = 'monitoring' | 'security' | 'notifications';

function SecurityCenterPage() {
  const { t } = useTranslate('security-center');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const [tab, setTab] = useState<ControlCenterSection>('monitoring');
  const [securityEventsDateRange, setSecurityEventsDateRange] = useState<SecurityEventsDateRange | null>(null);

  const handleSecurityDateSelect = (date: string) => {
    setSecurityEventsDateRange({ startDate: date, endDate: date });
    setTab('security');
  };

  useEffect(() => {
    if (profile && !profile.isSuperuser) replace(RoutePath.main);
  }, [profile, replace]);

  if (profile && !profile.isSuperuser) return null;

  return (
    <ListPageContent sx={{ height: 'auto', maxHeight: 'none', overflow: 'visible' }}>
      <CustomBreadcrumbs
        heading={t('title')}
        action={
          <Button
            component="a"
            href={CONFIG.controlAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            variant="contained"
            color="black"
            startIcon={<Iconify icon="solar:monitor-bold" />}>
            {t('controlCenter.openControl')}
          </Button>
        }
      />
      <ListPageBody
        sx={{
          flex: '0 0 auto',
          minWidth: 0,
          overflow: 'visible',
          pb: 3,
        }}>
        <Stack
          spacing={3}
          sx={{
            minWidth: 0,
            px: { xs: 0.5, sm: 0.75 },
            pt: 0.25,
            '& > *': { minWidth: 0 },
          }}>
          <Tabs
            value={tab}
            onChange={(_event, value: ControlCenterSection) => setTab(value)}
            variant="scrollable"
            allowScrollButtonsMobile
            sx={{ width: 1, minWidth: 0, flexShrink: 0 }}
            aria-label={t('controlCenter.details.tabsLabel')}>
            <Tab
              value="monitoring"
              icon={<Iconify icon="solar:monitor-bold" />}
              iconPosition="start"
              label={t('tabs.monitoring')}
            />
            <Tab
              value="security"
              icon={<Iconify icon="solar:shield-check-bold" />}
              iconPosition="start"
              label={t('tabs.events')}
            />
            <Tab
              value="notifications"
              icon={<Iconify icon="solar:bell-bing-bold" />}
              iconPosition="start"
              label={t('tabs.notifications')}
            />
          </Tabs>

          {tab === 'monitoring' && <MonitoringPanel onSecurityDateSelect={handleSecurityDateSelect} />}
          {tab === 'security' && (
            <Card sx={{ minWidth: 0, overflow: 'hidden' }}>
              <SecurityEventsPanel dateRange={securityEventsDateRange} onDateRangeChange={setSecurityEventsDateRange} />
            </Card>
          )}
          {tab === 'notifications' && (
            <Card sx={{ minWidth: 0, overflow: 'hidden' }}>
              <TelegramPanel />
            </Card>
          )}
        </Stack>
      </ListPageBody>
    </ListPageContent>
  );
}

export default SecurityCenterPage;
