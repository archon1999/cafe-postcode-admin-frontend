import { formLabelClasses } from '@mui/material/FormLabel';
import { inputLabelClasses } from '@mui/material/InputLabel';
import type { Components, Theme } from '@mui/material/styles';

import { getInputTypography } from './text-field';

const MuiFormControl: Components<Theme>['MuiFormControl'] = {
  defaultProps: {
    variant: 'outlined',
  },
};

const MuiInputLabel: Components<Theme>['MuiInputLabel'] = {
  defaultProps: {
    shrink: true,
  },

  styleOverrides: {
    root: ({ theme }) => ({
      variants: [
        {
          props: (props) => !props.shrink,
          style: {
            ...getInputTypography(theme, ['fontSize', 'lineHeight']),
            color: theme.vars.palette.text.disabled,
          },
        },
        {
          props: (props) => !!props.shrink,
          style: {
            fontWeight: theme.typography.fontWeightSemiBold,
            [`&.${inputLabelClasses.focused}:not(.${inputLabelClasses.error})`]: {
              color: 'inherit',
            },
          },
        },
        {
          props: (props) => !!props.shrink && props.variant === 'filled' && props.size === 'medium',
          style: {
            transform: 'translate(12px, 6px) scale(0.75)',
          },
        },
      ],
    }),
    asterisk: ({ theme }) => ({
      color: theme.vars.palette.error.main,
    }),
  },
};

const MuiFormLabel: Components<Theme>['MuiFormLabel'] = {
  styleOverrides: {
    root: ({ theme }) => ({
      [`&.${formLabelClasses.disabled}`]: {
        color: theme.vars.palette.action.disabled,
      },
      variants: [
        {
          props: (props) => !props.error,
          style: {
            [`&.${formLabelClasses.focused}`]: {
              color: theme.vars.palette.text.secondary,
            },
          },
        },
      ],
    }),
    asterisk: ({ theme }) => ({
      color: theme.vars.palette.error.main,
    }),
  },
};

const MuiFormControlLabel: Components<Theme>['MuiFormControlLabel'] = {
  styleOverrides: {
    label: ({ theme }) => ({
      ...theme.typography.body2,
    }),
  },
};

const MuiFormHelperText: Components<Theme>['MuiFormHelperText'] = {
  defaultProps: {
    component: 'div',
  },

  styleOverrides: {
    root: ({ theme }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(0.5),
      margin: theme.spacing(0.75, 1.5, 0, 1.5),
      '& > svg': { width: 16, height: 16 },
    }),
  },
};

export const form: Components<Theme> = {
  MuiFormLabel,
  MuiInputLabel,
  MuiFormControl,
  MuiFormHelperText,
  MuiFormControlLabel,
};
