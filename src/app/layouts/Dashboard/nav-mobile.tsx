import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { mergeClasses } from 'minimal-shared/utils';
import { useEffect } from 'react';

import { usePathname } from 'shared/hooks/router';
import { Logo } from 'shared/ui/Logo';
import { NavSectionVertical } from 'shared/ui/NavSection';
import type { NavSectionProps } from 'shared/ui/NavSection';
import { Scrollbar } from 'shared/ui/Scrollbar';

import { layoutClasses } from '../core';

type NavMobileProps = NavSectionProps & {
  open: boolean;
  onClose: () => void;
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
};

export function NavMobile({ sx, data, open, slots, onClose, className, checkPermissions, ...other }: NavMobileProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
  }, [onClose, open, pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          className: mergeClasses([layoutClasses.nav.root, layoutClasses.nav.vertical, className]),
          sx: [
            {
              overflow: 'unset',
              bgcolor: 'var(--layout-nav-bg)',
              width: 'var(--layout-nav-mobile-width)',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        },
      }}>
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo isSingle={false} />
        </Box>
      )}

      <Scrollbar fillContent>
        <NavSectionVertical
          data={data}
          checkPermissions={checkPermissions}
          sx={{ px: 2, flex: '1 1 auto' }}
          {...other}
        />
      </Scrollbar>

      {slots?.bottomArea}
    </Drawer>
  );
}
