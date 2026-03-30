import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import type { Breakpoint } from '@mui/material/styles';
import { merge } from 'es-toolkit';

import { useTranslate } from 'app/providers/locales';
import { RoutePath } from 'app/routes';
import { Logo } from 'shared/ui/Logo';
import { RouterLink } from 'shared/ui/RouterLink';

import type { HeaderSectionProps } from '../../core';
import { HeaderSection } from '../../core';

export type AuthSplitHeaderProps = HeaderSectionProps & {
  layoutQuery?: Breakpoint;
};

export function AuthSplitHeaderSection({ slotProps, slots, layoutQuery = 'md', sx }: AuthSplitHeaderProps) {
  const { t } = useTranslate('common');

  const headerSlotProps: HeaderSectionProps['slotProps'] = {
    container: { maxWidth: false },
  };

  const headerSlots: AuthSplitHeaderProps['slots'] = {
    topArea: (
      <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
        {t('auth.infoAlert')}
      </Alert>
    ),
    leftArea: (
      <>
        <Logo isSingle={false} />
      </>
    ),
    rightArea: (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
        <Link href={RoutePath.notfound} component={RouterLink} color="inherit" sx={{ typography: 'subtitle2' }}>
          {t('auth.needHelp')}
        </Link>
      </Box>
    ),
  };

  return (
    <HeaderSection
      disableElevation
      layoutQuery={layoutQuery}
      {...slotProps}
      slots={{ ...headerSlots, ...slots }}
      slotProps={merge(headerSlotProps, slotProps ?? {})}
      sx={[{ position: { [layoutQuery]: 'fixed' } }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  );
}
