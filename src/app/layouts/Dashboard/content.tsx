import Box from '@mui/material/Box';
import type { ContainerProps } from '@mui/material/Container';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import type { Breakpoint, SxProps, Theme } from '@mui/material/styles';
import { mergeClasses } from 'minimal-shared/utils';

import { useSettingsContext } from 'shared/ui/Settings';

import { layoutClasses } from '../core';

export type ContentProps = ContainerProps & {
  layoutQuery?: Breakpoint;
  disablePadding?: boolean;
};

const LIST_PAGE_LAYOUT_SX: SxProps<Theme> = {
  height: 1,
  maxHeight: '100%',
  minHeight: 0,
  overflow: 'hidden',
};

const LIST_PAGE_BODY_SX: SxProps<Theme> = {
  display: 'flex',
  flex: '1 1 auto',
  flexDirection: 'column',
  minHeight: 0,
};

export function Content({
  sx,
  children,
  className,
  disablePadding,
  maxWidth = 'lg',
  layoutQuery = 'lg',
  ...other
}: ContentProps) {
  const settings = useSettingsContext();

  const isNavHorizontal = settings.state.navLayout === 'horizontal';

  return (
    <Container
      className={mergeClasses([layoutClasses.content, className])}
      maxWidth={settings.state.compactLayout ? maxWidth : false}
      sx={[
        (theme) => ({
          display: 'flex',
          flex: '1 1 auto',
          flexDirection: 'column',
          pt: 'var(--layout-dashboard-content-pt)',
          pb: 'var(--layout-dashboard-content-pb)',
          [theme.breakpoints.up(layoutQuery)]: {
            px: 'var(--layout-dashboard-content-px)',
            ...(isNavHorizontal && { '--layout-dashboard-content-pt': '40px' }),
          },
          ...(disablePadding && {
            p: {
              xs: 0,
              sm: 0,
              md: 0,
              lg: 0,
              xl: 0,
            },
          }),
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}>
      {children}
    </Container>
  );
}

export function ListPageContent({ sx, ...other }: ContentProps) {
  return <Content sx={[LIST_PAGE_LAYOUT_SX, ...(Array.isArray(sx) ? sx : [sx])]} {...other} />;
}

type ListPageBodyProps = React.ComponentProps<typeof Box>;

export function ListPageBody({ sx, ...other }: ListPageBodyProps) {
  return <Box sx={[LIST_PAGE_BODY_SX, ...(Array.isArray(sx) ? sx : [sx])]} {...other} />;
}

export const VerticalDivider = styled('span')(({ theme }) => ({
  width: 1,
  height: 10,
  flexShrink: 0,
  display: 'none',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(2.5),
  backgroundColor: 'currentColor',
  color: theme.vars.palette.divider,
  '&::before, &::after': {
    top: -5,
    width: 3,
    height: 3,
    content: '""',
    flexShrink: 0,
    borderRadius: '50%',
    position: 'absolute',
    backgroundColor: 'currentColor',
  },
  '&::after': { bottom: -5, top: 'auto' },
}));
