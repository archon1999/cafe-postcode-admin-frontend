import { listItemIconClasses } from '@mui/material/ListItemIcon';
import type { Theme, Components } from '@mui/material/styles';

const MuiMenu: Components<Theme>['MuiMenu'] = {
  styleOverrides: {
    paper: {
      maxWidth: 'unset',
    },
  },
};

const MuiMenuItem: Components<Theme>['MuiMenuItem'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      ...theme.mixins.menuItemStyles(theme),
      [`& .${listItemIconClasses.root}`]: {
        minWidth: 'auto',
        marginRight: theme.spacing(1.5),
      },
    }),
  },
};

export const menu: Components<Theme> = {
  MuiMenu,
  MuiMenuItem,
};
