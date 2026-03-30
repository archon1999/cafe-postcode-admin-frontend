import { CONFIG } from 'app/config/globalConfig.ts';
import { RoutePath } from 'app/routes';

import { LayoutSection } from '../../core';
import type { AuthSplitLayoutProps } from '../model/types';

import { AuthSplitContent } from './AuthSplitContent.tsx';
import { AuthSplitHeaderSection } from './AuthSplitHeaderSection.tsx';
import { AuthSplitMainSection } from './AuthSplitMainSection.tsx';
import { AuthSplitSection } from './AuthSplitSection.tsx';

export function AuthSplitLayout({ sx, cssVars, slotProps, layoutQuery = 'md', children }: AuthSplitLayoutProps) {
  return (
    <LayoutSection
      headerSection={<AuthSplitHeaderSection layoutQuery={layoutQuery} {...slotProps?.header} />}
      footerSection={null}
      cssVars={{ '--layout-auth-content-width': '420px', ...cssVars }}
      sx={sx}>
      <AuthSplitMainSection
        sx={sx}
        layoutQuery={layoutQuery}
        sectionSlot={
          <AuthSplitSection
            layoutQuery={layoutQuery}
            method={CONFIG.auth.method}
            {...slotProps?.section}
            methods={[
              {
                label: 'Token',
                path: RoutePath.login,
                icon: `${CONFIG.assetsDir}/assets/icons/platforms/ic-token.svg`,
              },
            ]}
          />
        }
        contentSlot={
          <AuthSplitContent layoutQuery={layoutQuery} {...slotProps?.content}>
            {children}
          </AuthSplitContent>
        }
      />
    </LayoutSection>
  );
}
