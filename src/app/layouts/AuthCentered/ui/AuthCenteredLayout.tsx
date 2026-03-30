import type { Theme, CSSObject } from '@mui/material/styles';

import { CONFIG } from 'app/config/globalConfig.ts';

import { LayoutSection } from '../../core';
import type { AuthCenteredLayoutProps } from '../model/types';

import { AuthCenteredContent } from './AuthCenteredContent.tsx';
import { AuthCenteredHeaderSection } from './AuthCenteredHeaderSection.tsx';
import { AuthCenteredMainSection } from './AuthCenteredMainSection.tsx';

export function AuthCenteredLayout({ sx, cssVars, slotProps, layoutQuery = 'md', children }: AuthCenteredLayoutProps) {
  return (
    <LayoutSection
      headerSection={<AuthCenteredHeaderSection layoutQuery={layoutQuery} {...slotProps?.header} />}
      footerSection={null}
      cssVars={{ '--layout-auth-content-width': '480px', ...cssVars }}
      sx={[
        (theme) => ({
          position: 'relative',
          '&::before': backgroundStyles(theme),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}>
      <AuthCenteredMainSection
        sx={sx}
        layoutQuery={layoutQuery}
        contentSlot={<AuthCenteredContent {...slotProps?.content}>{children}</AuthCenteredContent>}
      />
    </LayoutSection>
  );
}

const backgroundStyles = (theme: Theme): CSSObject => ({
  ...theme.mixins.bgGradient({
    images: [`url(${CONFIG.assetsDir}/assets/background/background-blur.png)`],
  }),
  zIndex: 1,
  width: '100%',
  height: '100%',
  content: "''",
  position: 'absolute',
  ...theme.applyStyles('dark', {}),
});
