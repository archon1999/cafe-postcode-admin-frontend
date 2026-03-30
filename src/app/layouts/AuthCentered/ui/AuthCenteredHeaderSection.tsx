import type { Breakpoint } from '@mui/material/styles';
import { merge } from 'es-toolkit';

import type { HeaderSectionProps } from '../../core';
import { HeaderSection } from '../../core';

export type AuthSplitHeaderProps = HeaderSectionProps & {
  layoutQuery?: Breakpoint;
};

export function AuthCenteredHeaderSection({ slotProps, slots, layoutQuery = 'md', sx }: AuthSplitHeaderProps) {
  const headerSlotProps: HeaderSectionProps['slotProps'] = {
    container: { maxWidth: false },
  };

  const headerSlots: AuthSplitHeaderProps['slots'] = {};

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
