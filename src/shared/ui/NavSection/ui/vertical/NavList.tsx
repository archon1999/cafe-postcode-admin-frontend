import { useBoolean } from 'minimal-shared/hooks';
import { isExternalLink } from 'minimal-shared/utils';
import { useRef, useEffect, useCallback } from 'react';

import { usePathname } from 'shared/hooks/router';

import type { NavListProps, NavSubListProps } from '../../model/types.ts';
import { navSectionClasses } from '../../styles';
import { isNavItemActive } from '../../utils/is-nav-item-active.ts';
import { NavUl, NavLi, NavCollapse } from '../common';

import { NavItem } from './NavItem.tsx';

export function NavList({ data, depth, render, slotProps, checkPermissions, enabledRootRedirect }: NavListProps) {
  const pathname = usePathname();
  const navItemRef = useRef<HTMLButtonElement>(null);

  const isActive = isNavItemActive(pathname, data);

  const { value: open, onFalse: onClose, onToggle } = useBoolean(isActive);

  useEffect(() => {
    if (!isActive) {
      onClose();
    }
  }, [isActive, onClose, pathname]);

  const handleToggleMenu = useCallback(() => {
    if (data.children) {
      onToggle();
    }
  }, [data.children, onToggle]);

  const renderNavItem = () => (
    <NavItem
      ref={navItemRef}
      path={data.path}
      icon={data.icon}
      info={data.info}
      title={data.title}
      caption={data.caption}
      data-testid={data['data-testid']}
      open={open}
      active={isActive}
      disabled={data.disabled}
      depth={depth}
      render={render}
      hasChild={!!data.children}
      externalLink={isExternalLink(data.path)}
      enabledRootRedirect={enabledRootRedirect}
      slotProps={depth === 1 ? slotProps?.rootItem : slotProps?.subItem}
      onClick={handleToggleMenu}
    />
  );

  const renderCollapse = () =>
    !!data.children && (
      <NavCollapse mountOnEnter unmountOnExit depth={depth} in={open} data-group={data.title}>
        <NavSubList
          data={data.children}
          render={render}
          depth={depth}
          slotProps={slotProps}
          checkPermissions={checkPermissions}
          enabledRootRedirect={enabledRootRedirect}
        />
      </NavCollapse>
    );

  if (data.allowedRoles && checkPermissions && checkPermissions(data.allowedRoles)) {
    return null;
  }

  return (
    <NavLi
      disabled={data.disabled}
      sx={{
        ...(!!data.children && {
          [`& .${navSectionClasses.li}`]: {
            '&:first-of-type': { mt: 'var(--nav-item-gap)' },
          },
        }),
      }}>
      {renderNavItem()}
      {renderCollapse()}
    </NavLi>
  );
}

function NavSubList({ data, render, depth = 0, slotProps, checkPermissions, enabledRootRedirect }: NavSubListProps) {
  return (
    <NavUl sx={{ gap: 'var(--nav-item-gap)' }}>
      {data.map((list) => (
        <NavList
          key={list.title}
          data={list}
          render={render}
          depth={depth + 1}
          slotProps={slotProps}
          checkPermissions={checkPermissions}
          enabledRootRedirect={enabledRootRedirect}
        />
      ))}
    </NavUl>
  );
}
