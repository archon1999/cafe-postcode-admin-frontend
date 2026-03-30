import Button from '@mui/material/Button';
import type { ButtonProps } from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import { useCallback, useMemo, type MouseEvent as ReactMouseEvent } from 'react';
import { useLocation } from 'react-router';

import {
  BACK_LABEL_QUERY_PARAM,
  BACK_ORIGIN_QUERY_PARAM,
  BACK_ORIGIN_STATEMENT,
  BACK_TO_QUERY_PARAM,
} from 'shared/constants';
import { useRouter } from 'shared/hooks/router';
import { resolveCurrentPathFromLocation } from 'shared/utils/navigation-context';

import { Iconify } from '../Iconify';

export type BackToProps = Omit<ButtonProps, 'onClick'> & {
  redirect?: string;
  label?: React.ReactNode;
  onClick?: ButtonProps['onClick'];
};

const isModifiedEvent = (event: ReactMouseEvent<HTMLElement>) =>
  event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;

const resolveNavigationContextFromSearch = (search: string) => {
  const searchParams = new URLSearchParams(search);
  const backTo = searchParams.get(BACK_TO_QUERY_PARAM)?.trim() || null;
  const backLabel = searchParams.get(BACK_LABEL_QUERY_PARAM)?.trim() || null;
  const origin = searchParams.get(BACK_ORIGIN_QUERY_PARAM)?.trim() || null;

  return { backLabel, backTo, origin };
};

const baseSx: SxProps<Theme> = {
  background: '#919EAB29',
  padding: '6px 12px',
  border: 0,
};

export function BackTo({
  redirect,
  label,
  onClick,
  startIcon,
  sx,
  variant = 'outlined',
  color = 'inherit',
  ...other
}: BackToProps) {
  const { push } = useRouter();
  const location = useLocation();
  const currentPath = resolveCurrentPathFromLocation(location);
  const navigationContext = useMemo(() => resolveNavigationContextFromSearch(location.search), [location.search]);
  const resolvedLabel = useMemo(() => {
    if (label) {
      return label;
    }

    if (navigationContext.backLabel) {
      return navigationContext.backLabel;
    }

    if (navigationContext.origin === BACK_ORIGIN_STATEMENT) {
      return 'Back to statement';
    }

    return 'Back to list';
  }, [label, navigationContext.backLabel, navigationContext.origin]);

  const handleClick = useCallback<NonNullable<ButtonProps['onClick']>>(
    (event) => {
      onClick?.(event);

      if (event.defaultPrevented || isModifiedEvent(event) || event.button !== 0) {
        return;
      }

      if (navigationContext.backTo && navigationContext.backTo !== currentPath) {
        void push(navigationContext.backTo);
        return;
      }

      if (redirect) {
        void push(redirect);
      }
    },
    [currentPath, navigationContext.backTo, onClick, push, redirect],
  );

  return (
    <Button
      onClick={handleClick}
      startIcon={startIcon ?? <Iconify icon="eva:arrow-ios-back-fill" />}
      variant={variant}
      color={color}
      sx={[baseSx, ...(Array.isArray(sx) ? sx : [sx])]}
      {...other}>
      {resolvedLabel}
    </Button>
  );
}
