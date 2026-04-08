import { useEffect } from 'react';

import { CONFIG } from 'app/config/globalConfig';

type PageTitlePart = string | null | undefined | false;

type UsePageTitleOptions = {
  enabled?: boolean;
};

function buildPageTitle(parts: PageTitlePart[]) {
  const normalizedParts = parts
    .filter((part): part is string => typeof part === 'string' && part.trim().length > 0)
    .map((part) => part.trim());

  if (normalizedParts.length === 0) {
    return CONFIG.appName;
  }

  return `${normalizedParts.join(' - ')} - ${CONFIG.appName}`;
}

export function usePageTitle(parts: PageTitlePart[], options: UsePageTitleOptions = {}) {
  const { enabled = true } = options;
  const title = buildPageTitle(parts);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    document.title = title;
  }, [enabled, title]);
}
