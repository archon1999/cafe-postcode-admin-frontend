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
import type { AdminBusinessPartner } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { Iconify } from 'shared/ui/Iconify';

import { BusinessPartnerFilter, MonitoringPanel, SecurityEventsPanel, TelegramPanel } from './components';
import { defaultSecurityEventsDateRange } from './components/security-events-date-range';
import type { SecurityEventsDateRange } from './components/security-events-date-range';

type ControlCenterSection = 'monitoring' | 'security' | 'notifications';

function SecurityCenterPage() {
  const { t } = useTranslate('security-center');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const [tab, setTab] = useState<ControlCenterSection>('monitoring');
  const [businessPartner, setBusinessPartner] = useState<AdminBusinessPartner | null>(null);
  const [securityEventsDateRange, setSecurityEventsDateRange] = useState<SecurityEventsDateRange | null>(
    defaultSecurityEventsDateRange,
  );
  const businessPartnerRestaurantIds = businessPartner
    ? (businessPartner.restaurants ?? []).map((restaurant) => restaurant.id)
    : null;

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
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            spacing={1}
            sx={{ width: { xs: 1, sm: 'auto' } }}>
            <BusinessPartnerFilter value={businessPartner} onChange={setBusinessPartner} />
            <Button
              component="a"
              href={CONFIG.controlAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              color="black"
              startIcon={<Iconify icon="solar:monitor-bold" />}
              sx={{ whiteSpace: 'nowrap' }}>
              {t('controlCenter.openControl')}
            </Button>
          </Stack>
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

          {tab === 'monitoring' && (
            <MonitoringPanel businessPartnerId={businessPartner?.id} onSecurityDateSelect={handleSecurityDateSelect} />
          )}
          {tab === 'security' && (
            <Card sx={{ minWidth: 0, overflow: 'hidden' }}>
              <SecurityEventsPanel
                businessPartnerId={businessPartner?.id}
                dateRange={securityEventsDateRange}
                onDateRangeChange={setSecurityEventsDateRange}
              />
            </Card>
          )}
          {tab === 'notifications' && (
            <Card sx={{ minWidth: 0, overflow: 'hidden' }}>
              <TelegramPanel businessPartnerRestaurantIds={businessPartnerRestaurantIds} />
            </Card>
          )}
        </Stack>
      </ListPageBody>
    </ListPageContent>
  );
}

export default SecurityCenterPage;
