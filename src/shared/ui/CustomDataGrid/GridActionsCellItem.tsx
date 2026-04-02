import Link from '@mui/material/Link';
import { menuItemClasses } from '@mui/material/MenuItem';
import type { SxProps, Theme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import type { GridActionsCellItemProps } from '@mui/x-data-grid';
import { GridActionsCellItem } from '@mui/x-data-grid';
import { isExternalLink } from 'minimal-shared/utils';
import { useMemo, Fragment } from 'react';

import { RouterLink } from 'shared/ui/RouterLink';

export type GridActionKind = 'view' | 'edit' | 'delete' | 'constructor';

type CustomGridActionsCellItemProps = GridActionsCellItemProps & {
  actionKind: GridActionKind;
  href?: string;
};

type ActionPaletteColor = 'info' | 'warning' | 'error' | 'secondary';

const ACTION_COLORS: Record<GridActionKind, ActionPaletteColor> = {
  view: 'info',
  edit: 'warning',
  delete: 'error',
  constructor: 'secondary',
};

const getActionSx =
  (actionKind: GridActionKind): SxProps<Theme> =>
  (theme) => {
    const paletteColor = ACTION_COLORS[actionKind];
    const color = theme.vars?.palette[paletteColor].main ?? theme.palette[paletteColor].main;

    return {
      color,
      '&:hover': {
        color,
      },
    };
  };

const getMenuActionSx =
  (actionKind: GridActionKind): SxProps<Theme> =>
  (theme) => {
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

const getLinkProps = (href?: string) => {
  if (!href) return {};

  return isExternalLink(href)
    ? { component: Link, href, target: '_blank', rel: 'noopener noreferrer' }
    : { component: RouterLink, href };
};

export function CustomGridActionsCellItem({
  actionKind,
  href,
  showInMenu = true,
  className,
  label,
  sx,
  ...other
}: CustomGridActionsCellItemProps) {
  const linkProps = useMemo(() => getLinkProps(href), [href]);
  const Wrapper = href ? 'li' : Fragment;
  const actionClassName = useMemo(
    () => ['custom-grid-action', `custom-grid-action--${actionKind}`, className].filter(Boolean).join(' '),
    [actionKind, className],
  );
  const actionSx = useMemo(
    () => [getActionSx(actionKind), ...(Array.isArray(sx) ? sx : sx ? [sx] : [])],
    [actionKind, sx],
  );
  const menuActionSx = useMemo(
    () => [getMenuActionSx(actionKind), ...(Array.isArray(sx) ? sx : sx ? [sx] : [])],
    [actionKind, sx],
  );

  if (showInMenu) {
    return (
      <Wrapper {...(href && { className: menuItemClasses.root })}>
        <GridActionsCellItem
          {...(other as Extract<CustomGridActionsCellItemProps, { showInMenu?: true }>)}
          className={actionClassName}
          {...linkProps}
          label={label}
          showInMenu
          sx={menuActionSx}
        />
      </Wrapper>
    );
  }

  const actionItem = (
    <GridActionsCellItem
      {...(other as Extract<CustomGridActionsCellItemProps, { showInMenu?: false }>)}
      className={actionClassName}
      {...linkProps}
      label={label}
      showInMenu={false}
      sx={actionSx}
    />
  );

  if (label === undefined || label === null || label === false) {
    return actionItem;
  }

  return (
    <Tooltip title={label}>
      <span style={{ display: 'inline-flex' }}>{actionItem}</span>
    </Tooltip>
  );
}
