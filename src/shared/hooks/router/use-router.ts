import { isEqualPath } from 'minimal-shared/utils';
import NProgress from 'nprogress';
import { useMemo, useCallback } from 'react';
import type { NavigateOptions } from 'react-router';
import { useLocation, useNavigate } from 'react-router';

export function useRouter() {
  const navigate = useNavigate();
  const location = useLocation();

  const push = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (!isEqualPath(href, window.location.href, { deep: false })) {
        NProgress.start();
      }
      navigate(href, options);
    },
    [navigate],
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (!isEqualPath(href, window.location.href, { deep: false })) {
        NProgress.start();
      }
      navigate(href, { ...options, replace: true });
    },
    [navigate],
  );

  const router = useMemo(
    () => ({
      push,
      replace,
      back: () => navigate(-1),
      forward: () => navigate(1),
      refresh: () => navigate(0),
      pathname: location.pathname,
      ...navigate,
    }),
    [navigate, push, replace],
  );

  return router;
}
