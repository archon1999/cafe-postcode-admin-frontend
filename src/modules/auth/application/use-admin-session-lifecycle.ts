import { useEffect } from 'react';

import { getAdminAuthErrorCode, lockRequest } from '../data-access';
import { getLastAdminActivityAt, startAdminActivityTracking } from '../domain/services/admin-activity.service';
import { useAuthStore } from '../domain/stores/authentication.store';

import { markAdminSessionLocked, refreshAdminSession, startAdminAuthCoordination } from './session-coordinator';

const ADMIN_IDLE_LOCK_MS = 20 * 60 * 1000;

export function useAdminSessionLifecycle(): void {
  const status = useAuthStore((state) => state.status);

  useEffect(() => {
    const stopActivity = startAdminActivityTracking();
    const stopCoordination = startAdminAuthCoordination();
    return () => {
      stopActivity();
      stopCoordination();
    };
  }, []);

  useEffect(() => {
    if (status !== 'authenticated') {
      return;
    }
    let cancelled = false;
    let timer: number | undefined;

    const schedule = () => {
      const remaining = Math.max(250, ADMIN_IDLE_LOCK_MS - (Date.now() - getLastAdminActivityAt()));
      timer = window.setTimeout(async () => {
        if (cancelled) {
          return;
        }
        if (Date.now() - getLastAdminActivityAt() < ADMIN_IDLE_LOCK_MS) {
          schedule();
          return;
        }
        try {
          let token = useAuthStore.getState().getAccessToken();
          if (!token) {
            token = (await refreshAdminSession()).accessToken;
          }
          const response = await lockRequest(token);
          markAdminSessionLocked(response.lockedAt);
        } catch (error) {
          if (getAdminAuthErrorCode(error) === 'session_locked') {
            markAdminSessionLocked();
          } else {
            // The client stays closed on network failure; the server also enforces idle on the next request.
            markAdminSessionLocked();
          }
        }
      }, remaining);
    };
    schedule();
    return () => {
      cancelled = true;
      if (timer !== undefined) {
        window.clearTimeout(timer);
      }
    };
  }, [status]);
}
