import type { Breakpoint } from '@mui/material/styles';

import { type MainSectionProps, MainSection } from '../../core';

export type AuthSplitMainSectionProps = MainSectionProps & {
  layoutQuery?: Breakpoint;
  sectionSlot: React.ReactNode;
  contentSlot: React.ReactNode;
};

export function AuthSplitMainSection({
  layoutQuery = 'md',
  sx,
  contentSlot,
  sectionSlot,
  ...other
}: AuthSplitMainSectionProps) {
  return (
    <MainSection
      {...other}
      sx={[
        (theme) => ({ [theme.breakpoints.up(layoutQuery)]: { flexDirection: 'row' } }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}>
      {sectionSlot}

      {contentSlot}
    </MainSection>
  );
}
