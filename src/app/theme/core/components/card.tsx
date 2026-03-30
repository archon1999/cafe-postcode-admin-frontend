import type { Components, Theme } from '@mui/material/styles';

const MuiCard: Components<Theme>['MuiCard'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      position: 'relative',
      boxShadow: `var(--card-shadow, ${theme.vars.customShadows.card})`,
      borderRadius: `var(--card-radius, var(--radius-1, ${Number(theme.shape.borderRadius)}px))`,
      zIndex: 0,
    }),
  },
};

const MuiCardHeader: Components<Theme>['MuiCardHeader'] = {
  defaultProps: {
    titleTypographyProps: { variant: 'h6' },
    subheaderTypographyProps: { variant: 'body2', marginTop: '4px' },
  },

  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(3, 3, 0),
    }),
  },
};

const MuiCardContent: Components<Theme>['MuiCardContent'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      padding: theme.spacing(3),
    }),
  },
};

export const card: Components<Theme> = {
  MuiCard,
  MuiCardHeader,
  MuiCardContent,
};
