import { useCallback, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router';

import { useRouter } from './use-router';
import { useSearchParams } from './use-search-params';

type SetUrlTabOptions = {
  replace?: boolean;
};

type UseUrlTabStateOptions<T extends string> = {
  tabs: readonly T[];
  defaultTab: T;
  queryKey?: string;
  fallbackTab?: string | null;
  enabled?: boolean;
};

const isTabValue = <T extends string>(tabs: readonly T[], value: string | null): value is T => {
  return value !== null && tabs.includes(value as T);
};

export const useUrlTabState = <T extends string>({
  tabs,
  defaultTab,
  queryKey = 'tab',
  fallbackTab = null,
  enabled = true,
}: UseUrlTabStateOptions<T>) => {
  const { push, replace } = useRouter();
  const { pathname, hash } = useLocation();
  const searchParams = useSearchParams();

  const rawTab = searchParams.get(queryKey);
  const isValidTab = useMemo(() => isTabValue(tabs, rawTab), [rawTab, tabs]);
  const isValidFallbackTab = useMemo(() => isTabValue(tabs, fallbackTab), [fallbackTab, tabs]);
  const activeTab = (enabled ? (isValidTab ? rawTab : isValidFallbackTab ? fallbackTab : defaultTab) : defaultTab) as T;

  const buildHref = useCallback(
    (tab: T) => {
      const nextSearchParams = new URLSearchParams(searchParams);
      nextSearchParams.set(queryKey, tab);

      const query = nextSearchParams.toString();
      const search = query ? `?${query}` : '';
      return `${pathname}${search}${hash}`;
    },
    [hash, pathname, queryKey, searchParams],
  );

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (isValidTab) {
      return;
    }

    replace(buildHref(activeTab));
  }, [activeTab, buildHref, enabled, isValidTab, replace]);

  const setActiveTab = useCallback(
    (tab: T, options?: SetUrlTabOptions) => {
      if (!tabs.includes(tab)) {
        return;
      }

      if (!enabled) {
        return;
      }

      if (tab === activeTab) {
        return;
      }

      const href = buildHref(tab);

      if (options?.replace) {
        replace(href);
        return;
      }

      push(href);
    },
    [activeTab, buildHref, enabled, push, replace, tabs],
  );

  return {
    activeTab,
    setActiveTab,
  };
};
