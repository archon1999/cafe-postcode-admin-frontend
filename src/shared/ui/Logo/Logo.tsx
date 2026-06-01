import type { LinkProps } from '@mui/material/Link';
import Link from '@mui/material/Link';
import { styled, useTheme } from '@mui/material/styles';
import { mergeClasses } from 'minimal-shared/utils';
import { useId } from 'react';

import { RouterLink } from 'shared/ui/RouterLink';

import { logoClasses } from './classes';

export type LogoProps = LinkProps & {
  isSingle?: boolean;
  disabled?: boolean;
};

const FONT_FAMILY = '"Public Sans Variable", "Inter", sans-serif';
const BRAND_NAME = 'Cafe Postcode';

export function Logo({ sx, disabled, className, href = '/', isSingle = true, ...other }: LogoProps) {
  const theme = useTheme();
  const uniqueId = useId();

  const TEXT_PRIMARY = theme.vars.palette.text.primary;
  const PRIMARY_LIGHT = theme.vars.palette.primary.light;
  const PRIMARY_MAIN = theme.vars.palette.primary.main;
  const PRIMARY_DARK = theme.vars.palette.primary.dark;
  const PRIMARY_DARKER = theme.vars.palette.primary.darker;
  const WARNING_MAIN = theme.vars.palette.warning.main;

  const gradientId = `${uniqueId}-admin-gradient`;
  const glowId = `${uniqueId}-admin-glow`;

  const mark = (
    <>
      <defs>
        <linearGradient id={gradientId} x1="10" y1="10" x2="54" y2="58" gradientUnits="userSpaceOnUse">
          <stop stopColor={PRIMARY_DARKER} />
          <stop offset="0.55" stopColor={PRIMARY_MAIN} />
          <stop offset="1" stopColor={PRIMARY_LIGHT} />
        </linearGradient>
        <radialGradient
          id={glowId}
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(45 15) rotate(130) scale(34 32)">
          <stop stopColor="#FFFFFF" stopOpacity="0.34" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect x="6" y="6" width="52" height="52" rx="16" fill={`url(#${gradientId})`} />
      <rect x="6.75" y="6.75" width="50.5" height="50.5" rx="15.25" fill={`url(#${glowId})`} />

      <path
        fill="#FFFFFF"
        d="M32 14C23.716 14 17 20.716 17 29C17 42.374 29.297 50.835 32 54C34.703 50.835 47 42.374 47 29C47 20.716 40.284 14 32 14Z"
      />

      <path
        fill={PRIMARY_DARK}
        d="M25.5 28.5H36.4C37.2837 28.5 38 29.2163 38 30.1V33.2C38 37.5078 34.5078 41 30.2 41H29.8C25.4922 41 22 37.5078 22 33.2V32C22 30.067 23.567 28.5 25.5 28.5Z"
      />
      <path
        d="M38.1 31.3H39.05C40.9554 31.3 42.5 32.8446 42.5 34.75C42.5 36.6554 40.9554 38.2 39.05 38.2H38.1"
        stroke={PRIMARY_DARK}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M25.8 43.6H37.8" stroke={PRIMARY_DARK} strokeWidth="2.4" strokeLinecap="round" />
      <path
        d="M27.8 24.2C27.8 22.9 28.7 22.05 28.7 20.8"
        stroke={PRIMARY_DARK}
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M32 23.3C32 21.95 32.95 21.05 32.95 19.7"
        stroke={PRIMARY_DARK}
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M36.2 24.2C36.2 22.9 37.1 22.05 37.1 20.8"
        stroke={PRIMARY_DARK}
        strokeWidth="2.3"
        strokeLinecap="round"
      />

      <rect x="39" y="11" width="14" height="14" rx="5" fill={WARNING_MAIN} />
      <rect x="42" y="14.3" width="2.2" height="2.2" rx="0.7" fill="#FFFFFF" />
      <rect x="46" y="14.3" width="2.2" height="2.2" rx="0.7" fill="#FFFFFF" />
      <rect x="42" y="18.1" width="2.2" height="2.2" rx="0.7" fill="#FFFFFF" />
      <rect x="46" y="18.1" width="2.2" height="2.2" rx="0.7" fill="#FFFFFF" />
    </>
  );

  const singleLogo = (
    <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      {mark}
    </svg>
  );

  const fullLogo = (
    <svg width="100%" height="100%" viewBox="0 0 264 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0 4)">{mark}</g>

      <text
        x="78"
        y="24"
        fill={PRIMARY_MAIN}
        fontFamily={FONT_FAMILY}
        fontSize="10.5"
        fontWeight="800"
        letterSpacing="1.4">
        ADMIN
      </text>

      <text
        x="76"
        y="54"
        fill={TEXT_PRIMARY}
        fontFamily={FONT_FAMILY}
        fontSize="22"
        fontWeight="700"
        letterSpacing="-0.5">
        {BRAND_NAME}
      </text>
    </svg>
  );

  return (
    <LogoRoot
      component={RouterLink}
      href={href}
      aria-label="Cafe Postcode Admin logo"
      underline="none"
      className={mergeClasses([logoClasses.root, className])}
      sx={[
        {
          width: 44,
          height: 44,
          ...(!isSingle && { width: 184, height: 50 }),
          ...(disabled && { pointerEvents: 'none' }),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}>
      {isSingle ? singleLogo : fullLogo}
    </LogoRoot>
  );
}

const LogoRoot = styled(Link)(() => ({
  flexShrink: 0,
  color: 'transparent',
  display: 'inline-flex',
  verticalAlign: 'middle',
}));
