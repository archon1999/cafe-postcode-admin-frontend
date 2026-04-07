import { useEffect } from 'react';

import { useAuthStore } from '../domain/stores/authentication.store';

import { syncCurrentUser } from './current-user';

let authBootstrapPromise: Promise<void> | null = null;

export function useAuthBootstrap() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);
  const setBootstrapping = useAuthStore((state) => state.setBootstrapping);

  useEffect(() => {
    if (!isAuthenticated) {
      if (isBootstrapping) {
        setBootstrapping(false);
      }

      return;
    }

    if (!isBootstrapping) {
      return;
    }

    let isActive = true;

    if (!authBootstrapPromise) {
      authBootstrapPromise = (async () => {
        try {
          await syncCurrentUser({ logoutOnError: true });
        } catch (error) {
          console.error('Failed to bootstrap current user', error);
        } finally {
          authBootstrapPromise = null;
        }
      })();
    }

    void authBootstrapPromise.finally(() => {
      if (isActive) {
        setBootstrapping(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [isAuthenticated, isBootstrapping, setBootstrapping]);
}
