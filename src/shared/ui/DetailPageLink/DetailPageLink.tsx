import Link from '@mui/material/Link';
import type { SxProps, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { MouseEventHandler, ReactNode } from 'react';

import { RouterLink } from 'shared/ui/RouterLink';

export type DetailPageLinkProps = {
  href?: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
  onClick?: MouseEventHandler<HTMLElement>;
  target?: string;
  rel?: string;
  'data-testid'?: string;
};

const baseSx: SxProps<Theme> = {
  fontWeight: 600,
  lineHeight: 1,
};

export function DetailPageLink({ href, children, sx, ...other }: DetailPageLinkProps) {
  const mergedSx = [baseSx, ...(Array.isArray(sx) ? sx : [sx])];

  if (!href) {
    return (
      <Typography sx={mergedSx} {...other}>
        {children}
      </Typography>
    );
  }

  return (
    <Link component={RouterLink} href={href} color="inherit" sx={mergedSx} {...other}>
      {children}
    </Link>
  );
}
