import { useEffect } from 'react';

import { authStore } from '../domain/stores/authentication.store';

import { bootstrapAdminSession } from './session-coordinator';

let authBootstrapPromise: Promise<void> | null = null;

export function useAuthBootstrap(): void {
  useEffect(() => {
    const bootstrap = () => {
      if (!authBootstrapPromise) {
        authBootstrapPromise = bootstrapAdminSession().finally(() => {
          authBootstrapPromise = null;
        });
      }
      void authBootstrapPromise;
    };
    const reconnect = () => {
      if (authStore.getState().bootstrapError) bootstrap();
    };
    bootstrap();
    window.addEventListener('online', reconnect);
    return () => window.removeEventListener('online', reconnect);
  }, []);
}
