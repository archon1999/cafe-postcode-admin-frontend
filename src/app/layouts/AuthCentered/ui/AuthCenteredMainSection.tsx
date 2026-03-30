import type { Breakpoint } from '@mui/material/styles';

import { type MainSectionProps, MainSection } from '../../core';

export type AuthSplitMainSectionProps = MainSectionProps & {
  layoutQuery?: Breakpoint;
  contentSlot: React.ReactNode;
};

export function AuthCenteredMainSection({ layoutQuery = 'md', sx, contentSlot, ...other }: AuthSplitMainSectionProps) {
  return (
    <MainSection
      {...other}
      sx={[
        (theme) => ({
          alignItems: 'center',
          p: theme.spacing(3, 2, 10, 2),
          [theme.breakpoints.up(layoutQuery)]: {
            justifyContent: 'center',
            p: theme.spacing(10, 0, 10, 0),
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}>
      {contentSlot}
    </MainSection>
  );
}
