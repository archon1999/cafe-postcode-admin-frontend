import { listClasses } from '@mui/material/List';
import type { Theme, Components } from '@mui/material/styles';

const MuiPopover: Components<Theme>['MuiPopover'] = {
  styleOverrides: {
    paper: ({ theme }) => ({
      ...theme.mixins.paperStyles(theme, { dropdown: true }),
      [`& .${listClasses.root}`]: {
        paddingTop: 0,
        paddingBottom: 0,
      },
    }),
  },
};

export const popover: Components<Theme> = {
  MuiPopover,
};
