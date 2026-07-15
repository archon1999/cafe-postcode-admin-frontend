import Link from '@mui/material/Link';
import { menuItemClasses } from '@mui/material/MenuItem';
import { styled } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import type { GridActionsCellItemProps } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { isExternalLink } from 'minimal-shared/utils';
import type { ReactNode } from 'react';
import { useMemo, Fragment } from 'react';

import { RouterLink } from 'shared/ui/RouterLink';

export type GridActionKind = 'view' | 'edit' | 'delete' | 'constructor';

type InlineGridActionProps = Extract<GridActionsCellItemProps, { showInMenu?: false }>;
type MenuGridActionProps = Extract<GridActionsCellItemProps, { showInMenu: true }>;
type GridActionPropsToReplace = 'component' | 'href' | 'showInMenu' | 'sx';

type CustomGridActionBaseProps = {
  actionKind: GridActionKind;
  href?: string;
  sx?: SxProps<Theme>;
};

type CustomGridActionsCellItemProps = CustomGridActionBaseProps &
  (
    | (Omit<InlineGridActionProps, GridActionPropsToReplace> & { showInMenu: false })
    | (Omit<MenuGridActionProps, GridActionPropsToReplace> & { showInMenu?: true })
  );

type ActionPaletteColor = 'info' | 'warning' | 'error' | 'secondary';

const ACTION_COLORS: Record<GridActionKind, ActionPaletteColor> = {
  view: 'info',
  edit: 'warning',
  delete: 'error',
  constructor: 'secondary',
};

const getActionStyles = (actionKind: GridActionKind, theme: Theme) => {
  const paletteColor = ACTION_COLORS[actionKind];
  const color = theme.vars?.palette[paletteColor].main ?? theme.palette[paletteColor].main;

  return {
    color,
    '&:hover': {
      color,
    },
  };
};

const getMenuActionStyles = (actionKind: GridActionKind, theme: Theme) => {
  const paletteColor = ACTION_COLORS[actionKind];
  const iconColor = theme.vars?.palette[paletteColor].main ?? theme.palette[paletteColor].main;
  const textColor =
    actionKind === 'delete' ? iconColor : (theme.vars?.palette.text.primary ?? theme.palette.text.primary);

  return {
    color: textColor,
    '& .MuiSvgIcon-root': {
      color: iconColor,
    },
  };
};

const StyledGridActionsCellItem = styled(GridActionsCellItem, {
  shouldForwardProp: (prop) => prop !== 'actionKind' && prop !== 'menuAction',
})<{ actionKind: GridActionKind; menuAction: boolean }>(({ actionKind, menuAction, theme }) =>
  menuAction ? getMenuActionStyles(actionKind, theme) : getActionStyles(actionKind, theme),
);

const getLinkProps = (href?: string) => {
  if (!href) return {};

  return isExternalLink(href)
    ? { component: Link, href, target: '_blank', rel: 'noopener noreferrer' }
    : { component: RouterLink, href };
};

const hasTooltipLabel = (label: ReactNode) => label !== undefined && label !== null && label !== false;

export function CustomGridActionsCellItem(props: CustomGridActionsCellItemProps) {
  const { actionKind, className, href, sx } = props;
  const linkProps = useMemo(() => getLinkProps(href), [href]);
  const Wrapper = href ? 'li' : Fragment;
  const actionClassName = useMemo(
    () => ['custom-grid-action', `custom-grid-action--${actionKind}`, className].filter(Boolean).join(' '),
    [actionKind, className],
  );

  if (props.showInMenu !== false) {
    return (
      <Wrapper {...(href && { className: menuItemClasses.root })}>
        <StyledGridActionsCellItem
          {...props}
          actionKind={actionKind}
          className={actionClassName}
          {...linkProps}
          label={props.label}
          menuAction
          showInMenu
          sx={sx}
        />
      </Wrapper>
    );
  }

  const actionItem = (
    <StyledGridActionsCellItem
      {...props}
      actionKind={actionKind}
      className={actionClassName}
      {...linkProps}
      label={props.label}
      menuAction={false}
      showInMenu={false}
      sx={sx}
    />
  );

  if (!hasTooltipLabel(props.label)) {
    return actionItem;
  }

  return (
    <Tooltip title={props.label}>
      <span style={{ display: 'inline-flex' }}>{actionItem}</span>
    </Tooltip>
  );
}
