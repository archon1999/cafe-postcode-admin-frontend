import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';

import { notifyError, normalizeError, isCanceled } from 'shared/api';

export const queryCache = new QueryCache({
  onError: (error, query) => {
    if (isCanceled(error)) return;
    if (query.meta?.silentError) return;
    notifyError(normalizeError(error));
  },
});

export const mutationCache = new MutationCache({
  onError: (error, _variables, _context, mutation) => {
    if (isCanceled(error)) return;
    if (mutation.meta?.silentError) return;
    notifyError(normalizeError(error));
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 2_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: 0,
    },
  },
});
