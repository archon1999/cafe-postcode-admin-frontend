import { Navigate, useSearchParams } from 'react-router';

import { CONFIG } from 'app/config/globalConfig';
import { getSafeAdminReturnTarget, useAuthStore } from 'modules/auth';
import { SplashScreen } from 'shared/ui/LoadingScreen';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isBootstrapping = useAuthStore((state) => state.isBootstrapping);

  if (isBootstrapping) {
    return <SplashScreen />;
  }

  if (isAuthenticated) {
    const returnTo = getSafeAdminReturnTarget(searchParams.get('returnTo'));
    const redirectPath = returnTo || CONFIG.auth.redirectPath;

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
