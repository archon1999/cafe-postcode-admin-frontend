import { useEffect } from 'react';

import { startAdminActivityTracking } from '../domain/services/admin-activity.service';

import { startAdminAuthCoordination } from './session-coordinator';

export function useAdminSessionLifecycle(): void {
  useEffect(() => {
    const stopActivity = startAdminActivityTracking();
    const stopCoordination = startAdminAuthCoordination();
    return () => {
      stopActivity();
      stopCoordination();
    };
  }, []);
}
