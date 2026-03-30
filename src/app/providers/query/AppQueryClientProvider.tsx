import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { FC, ReactNode } from 'react';

import { queryClient } from 'shared/api';

type QueryClientProviderProps = {
  children: ReactNode;
};

export const ReactQueryClientProvider: FC<QueryClientProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
