import Box from '@mui/material/Box';
import type { LinkProps } from '@mui/material/Link';
import Link from '@mui/material/Link';
import { mergeClasses } from 'minimal-shared/utils';

import { CONFIG } from 'app/config/globalConfig.ts';
import { RouterLink } from 'shared/ui/RouterLink';

import { logoClasses } from './classes';

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

const LOGO_SRC = `${CONFIG.assetsDir}/assets/icons/admin-logo.webp`;
const BRAND_NAME = 'Cafe Postcode';

export function Logo({ sx, disabled, className, href = '/', isSingle = true, ...other }: LogoProps) {
  return (
    <Link
      component={RouterLink}
      href={href}
      aria-label="Cafe Postcode Admin logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: isSingle ? 44 : 184,
          height: isSingle ? 44 : 50,
          display: 'inline-flex',
          alignItems: 'center',
          flexShrink: 0,
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}>
      <img src={LOGO_SRC} alt="" width={isSingle ? 44 : 50} height={isSingle ? 44 : 50} draggable={false} />

      {!isSingle && (
        <Box component="span" sx={{ display: 'flex', flexDirection: 'column', ml: 1.25, lineHeight: 1 }}>
          <Box
            component="span"
            sx={{ color: 'primary.main', fontSize: 9.5, fontWeight: 800, letterSpacing: 1.2, lineHeight: 1.2 }}>
            ADMIN
          </Box>

          <Box
            component="span"
            sx={{
              mt: 0.5,
              color: 'text.primary',
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: -0.35,
              lineHeight: 1.2,
              whiteSpace: 'nowrap',
            }}>
            {BRAND_NAME}
          </Box>
        </Box>
      )}
    </Link>
  );
}
