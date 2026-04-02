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
      void navigate(href, options);
    },
    [navigate],
  );

  const replace = useCallback(
    (href: string, options?: NavigateOptions) => {
      if (!isEqualPath(href, window.location.href, { deep: false })) {
        NProgress.start();
      }
      void navigate(href, { ...options, replace: true });
    },
    [navigate],
  );

  const back = useCallback(() => {
    void navigate(-1);
  }, [navigate]);

  const forward = useCallback(() => {
    void navigate(1);
  }, [navigate]);

  const refresh = useCallback(() => {
    void navigate(0);
  }, [navigate]);

  const router = useMemo(
    () => ({
      push,
      replace,
      back,
      forward,
      refresh,
      pathname: location.pathname,
    }),
    [back, forward, location.pathname, push, refresh, replace],
  );

  return router;
}
