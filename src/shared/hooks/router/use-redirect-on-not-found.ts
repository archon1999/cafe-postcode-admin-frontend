import { isAxiosError } from 'axios';
import { useEffect } from 'react';

import { useRouter } from './use-router.ts';

const NOT_FOUND_PATH = '/404';

export const useRedirectOnNotFound = (error?: unknown, enabled = true) => {
  const { replace } = useRouter();

  useEffect(() => {
    if (!enabled || !error || !isAxiosError(error)) return;
    if (error.response?.status !== 404) return;
    if (window.location.pathname === NOT_FOUND_PATH) return;

    replace(NOT_FOUND_PATH);
  }, [enabled, error, replace]);
};
