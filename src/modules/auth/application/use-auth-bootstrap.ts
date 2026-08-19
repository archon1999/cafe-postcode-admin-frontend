import { useEffect } from 'react';

import { bootstrapAdminSession } from './session-coordinator';

let authBootstrapPromise: Promise<void> | null = null;

export function useAuthBootstrap(): void {
  useEffect(() => {
    if (!authBootstrapPromise) {
      authBootstrapPromise = bootstrapAdminSession().finally(() => {
        authBootstrapPromise = null;
      });
    }
    void authBootstrapPromise;
  }, []);
}
