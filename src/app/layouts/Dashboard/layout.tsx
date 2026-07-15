import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { iconButtonClasses } from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import type { Breakpoint } from '@mui/material/styles';
import { merge } from 'es-toolkit';
import { useBoolean } from 'minimal-shared/hooks';

import { useTranslate } from 'app/providers/locales';
import { allLangs } from 'app/providers/locales/locales-config';
import { useAdminScopeStore, useCurrentUser } from 'modules/auth';
import { usePathname } from 'shared/hooks/router';
import { Logo } from 'shared/ui/Logo';
import type { NavItemProps, NavSectionProps } from 'shared/ui/NavSection';
import { useSettingsContext } from 'shared/ui/Settings';

import { AccountDrawer } from '../components/account-drawer';
import { getMissingAdminScopeRequirement, resolveAdminAccessSnapshot } from '../components/admin-scope-access';
import { AdminScopeBlocker } from '../components/admin-scope-blocker';
import { getAdminScopeRequirement } from '../components/admin-scope-requirements';
import { AdminScopeSelector } from '../components/admin-scope-selector';
import { LanguagePopover } from '../components/language-popover';
import { MenuButton } from '../components/menu-button';
import { SettingsButton } from '../components/settings-button';
import type { MainSectionProps, HeaderSectionProps, LayoutSectionProps } from '../core';
import { MainSection, layoutClasses, HeaderSection, LayoutSection } from '../core';
import { _account } from '../nav-config-account';
import { navData as dashboardNavData } from '../nav-config-dashboard';

import { VerticalDivider } from './content';
import { dashboardLayoutVars, dashboardNavColorVars } from './css-vars';
import { NavHorizontal } from './nav-horizontal';
import { NavMobile } from './nav-mobile';
import { NavVertical } from './nav-vertical';

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    nav?: {
      data?: NavSectionProps['data'];
    };
    main?: MainSectionProps;
  };
};

export function DashboardLayout({ sx, cssVars, children, slotProps, layoutQuery = 'lg' }: DashboardLayoutProps) {
  const theme = useTheme();
  const navTranslations = useTranslate('navbar');
  const { t: tCommon } = useTranslate('common');
  const { user, profile } = useCurrentUser();
  const pathname = usePathname();

  const settings = useSettingsContext();

  const navVars = dashboardNavColorVars(theme, settings.state.navColor, settings.state.navLayout);

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const navData = slotProps?.nav?.data ?? dashboardNavData(navTranslations.t, resolveAdminAccessSnapshot(profile));

  const isNavMini = settings.state.navLayout === 'mini';
  const isNavHorizontal = settings.state.navLayout === 'horizontal';
  const isNavVertical = isNavMini || settings.state.navLayout === 'vertical';
  const scopeRequirement = getAdminScopeRequirement(pathname);
  const selectedRestaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);

  const canDisplayItemByRole = (allowedRoles: NavItemProps['allowedRoles']): boolean => {
    const role = user?.role ?? '';

    if (Array.isArray(allowedRoles)) {
      return !allowedRoles.includes(role);
    }

    return allowedRoles !== role;
  };

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
        sx: {
          ...(isNavVertical && { px: { [layoutQuery]: 5 } }),
          ...(isNavHorizontal && {
            bgcolor: 'var(--layout-nav-bg)',
            height: { [layoutQuery]: 'var(--layout-nav-horizontal-height)' },
            [`& .${iconButtonClasses.root}`]: { color: 'var(--layout-nav-text-secondary-color)' },
          }),
        },
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          {tCommon('auth.infoAlert')}
        </Alert>
      ),
      bottomArea: isNavHorizontal ? (
        <NavHorizontal
          data={navData}
          layoutQuery={layoutQuery}
          cssVars={navVars.section}
          checkPermissions={canDisplayItemByRole}
        />
      ) : null,
      leftArea: (
        <>
          <MenuButton
            onClick={onOpen}
            sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
          />
          <NavMobile
            data={navData}
            open={open}
            onClose={onClose}
            cssVars={navVars.section}
            checkPermissions={canDisplayItemByRole}
          />

          {isNavHorizontal && (
            <Logo
              isSingle={false}
              sx={{
                display: 'none',
                [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
              }}
            />
          )}

          {isNavHorizontal && <VerticalDivider sx={{ [theme.breakpoints.up(layoutQuery)]: { display: 'flex' } }} />}
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 0.75 } }}>
          <AdminScopeSelector />

          <LanguagePopover data={allLangs} />

          <SettingsButton />

          <AccountDrawer data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        layoutQuery={layoutQuery}
        disableElevation={isNavVertical}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(
          {
            ...headerSlotProps,
            centerArea: {
              sx: {
                justifyContent: 'flex-start',
                px: { xs: 1, md: 3 },
              },
            },
          },
          slotProps?.header?.slotProps ?? {},
        )}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderSidebar = () => (
    <NavVertical
      data={navData}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      cssVars={navVars.section}
      checkPermissions={canDisplayItemByRole}
      onToggleNav={() => settings.setField('navLayout', settings.state.navLayout === 'vertical' ? 'mini' : 'vertical')}
    />
  );

  const renderFooter = () => null;

  const renderMain = () => {
    const selectedRestaurant = profile?.isSuperuser ? selectedRestaurantId : (profile?.restaurantId ?? null);
    const blockerRequirement = getMissingAdminScopeRequirement(scopeRequirement, {
      restaurantId: selectedRestaurant,
    });

    return (
      <MainSection {...slotProps?.main}>
        {blockerRequirement ? <AdminScopeBlocker requirement={blockerRequirement} /> : children}
      </MainSection>
    );
  };

  return (
    <LayoutSection
      headerSection={renderHeader()}
      sidebarSection={isNavHorizontal ? null : renderSidebar()}
      footerSection={renderFooter()}
      cssVars={{ ...dashboardLayoutVars(theme), ...navVars.layout, ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: 'var(--layout-transition-easing)',
                duration: 'var(--layout-transition-duration)',
              }),
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}>
      {renderMain()}
    </LayoutSection>
  );
}
