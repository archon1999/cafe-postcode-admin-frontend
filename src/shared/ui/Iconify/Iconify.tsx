import type { IconProps } from '@iconify/react';
import { Icon } from '@iconify/react';
import { styled } from '@mui/material/styles';
import { mergeClasses } from 'minimal-shared/utils';
import { useId } from 'react';

import { iconifyClasses } from './classes';
import type { IconifyName } from './register-icons';
import { allIconNames, registerIcons } from './register-icons';

const ICON_PREFIX_ALIASES = [{ from: 'icons/solid/ic-solar:', to: 'solar:' }] as const;

const resolveIconAlias = (icon: string) => {
  for (const alias of ICON_PREFIX_ALIASES) {
    if (icon.startsWith(alias.from)) {
      return `${alias.to}${icon.slice(alias.from.length)}`;
    }
  }
  return icon;
};

export type IconifyProps = React.ComponentProps<typeof IconRoot> &
  Omit<IconProps, 'icon'> & {
    icon: IconifyName;
  };

export function Iconify({ className, icon, width = 20, height, sx, ...other }: IconifyProps) {
  const uniqueId = useId();
  const resolvedIcon = resolveIconAlias(icon);

  if (!allIconNames.includes(resolvedIcon)) {
    console.warn(
      [
        `Icon "${resolvedIcon}" is currently loaded online, which may cause flickering effects.`,
        `To ensure a smoother experience, please register your icon collection for offline use.`,
        `More information is available at: https://docs.minimals.cc/icons/`,
      ].join('\n'),
    );
  }

  registerIcons();

  return (
    <IconRoot
      ssr
      id={uniqueId}
      icon={resolvedIcon}
      className={mergeClasses([iconifyClasses.root, className])}
      sx={[
        {
          width,
          flexShrink: 0,
          height: height ?? width,
          display: 'inline-flex',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    />
  );
}

const IconRoot = styled(Icon)``;
