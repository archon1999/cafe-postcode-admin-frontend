import Box from '@mui/material/Box';
import type { Breakpoint } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { mergeClasses, varAlpha } from 'minimal-shared/utils';
import { useEffect, useState } from 'react';

import { Logo } from 'shared/ui/Logo';
import type { NavSectionProps } from 'shared/ui/NavSection';
import { NavSectionMini, NavSectionVertical } from 'shared/ui/NavSection';
import { Scrollbar } from 'shared/ui/Scrollbar';

import { NavToggleButton } from '../components/nav-toggle-button';
import { layoutClasses } from '../core';

export type NavVerticalProps = React.ComponentProps<'div'> &
  NavSectionProps & {
    isNavMini: boolean;
    layoutQuery?: Breakpoint;
    onToggleNav: () => void;
    slots?: {
      topArea?: React.ReactNode;
      bottomArea?: React.ReactNode;
    };
  };

export function NavVertical({
  sx,
  data,
  slots,
  cssVars,
  className,
  isNavMini,
  onToggleNav,
  checkPermissions,
  layoutQuery = 'md',
  ...other
}: NavVerticalProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const { body } = document;

    if (!body) {
      return;
    }

    const drawerSelector = '.MuiDrawer-root';

    const computeHasOpenDrawer = () => {
      const drawers = Array.from(document.querySelectorAll(drawerSelector));

      if (!drawers.length) {
        return false;
      }

      const hasVisibleDrawer = drawers.some((drawer) => drawer.getAttribute('aria-hidden') !== 'true');

      if (!hasVisibleDrawer) {
        return false;
      }

      return Boolean(document.querySelector('.MuiBackdrop-root'));
    };

    const updateDrawerState = () => {
      const nextState = computeHasOpenDrawer();
      setIsDrawerOpen((prevState) => (prevState === nextState ? prevState : nextState));
    };

    updateDrawerState();

    if (typeof MutationObserver === 'undefined') {
      return;
    }

    const observer = new MutationObserver(updateDrawerState);

    observer.observe(body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['aria-hidden'],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const renderNavVertical = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical
          data={data}
          cssVars={cssVars}
          checkPermissions={checkPermissions}
          sx={{ px: 2, flex: '1 1 auto' }}
        />

        {slots?.bottomArea}
      </Scrollbar>
    </>
  );

  const renderNavMini = () => (
    <>
      {slots?.topArea ?? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2.5 }}>
          <Logo />
        </Box>
      )}

      <NavSectionMini
        data={data}
        cssVars={cssVars}
        checkPermissions={checkPermissions}
        sx={[
          (theme) => ({
            ...theme.mixins.hideScrollY,
            pb: 2,
            px: 0.5,
            flex: '1 1 auto',
            overflowY: 'auto',
          }),
        ]}
      />

      {slots?.bottomArea}
    </>
  );

  return (
    <NavRoot
      isDrawerOpen={isDrawerOpen}
      isNavMini={isNavMini}
      layoutQuery={layoutQuery}
      className={mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className])}
      sx={sx}
      {...other}>
      <NavToggleButton
        isNavMini={isNavMini}
        onClick={onToggleNav}
        sx={[
          (theme) => ({
            display: 'none',
            [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
          }),
        ]}
      />
      {isNavMini ? renderNavMini() : renderNavVertical()}
    </NavRoot>
  );
}

const NavRoot = styled('div', {
  shouldForwardProp: (prop: string) => !['isNavMini', 'layoutQuery', 'sx', 'isDrawerOpen'].includes(prop),
})<Pick<NavVerticalProps, 'isNavMini' | 'layoutQuery'> & { isDrawerOpen: boolean }>(
  ({ isNavMini, layoutQuery = 'md', theme, isDrawerOpen }) => ({
    top: 0,
    left: 0,
    height: '100%',
    display: 'none',
    position: 'fixed',
    flexDirection: 'column',
    zIndex: isDrawerOpen ? 0 : 1,
    backgroundColor: 'var(--layout-nav-bg)',
    width: isNavMini ? 'var(--layout-nav-mini-width)' : 'var(--layout-nav-vertical-width)',
    borderRight: `1px solid var(--layout-nav-border-color, ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)})`,
    pointerEvents: isDrawerOpen ? 'none' : 'auto',
    transition: theme.transitions.create(['width', 'opacity'], {
      easing: 'var(--layout-transition-easing)',
      duration: 'var(--layout-transition-duration)',
    }),
    [theme.breakpoints.up(layoutQuery)]: { display: 'flex' },
  }),
);
