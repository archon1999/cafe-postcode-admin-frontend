import { Navigate, useSearchParams } from 'react-router';

import { CONFIG } from 'app/config/globalConfig';
import { useAuthStore } from 'modules/auth';

interface GuestRouteProps {
  children: React.ReactNode;
}

export const GuestRoute = ({ children }: GuestRouteProps) => {
  const [searchParams] = useSearchParams();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    const returnTo = searchParams.get('returnTo');
    const redirectPath = returnTo || CONFIG.auth.redirectPath;

    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
