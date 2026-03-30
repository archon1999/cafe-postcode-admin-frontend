import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';

import { RoutePath, canAccessAdminPath, getDefaultAdminPath } from 'app/routes';
import { useAuthStore, useCurrentUser } from 'modules/auth';
import { SplashScreen } from 'shared/ui/LoadingScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const { profile } = useCurrentUser();

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const performAuthCheck = async () => {
      void checkAuth();
      setIsChecking(false);
    };

    void performAuthCheck();
  }, [checkAuth]);

  if (isChecking || isLoading) {
    return <SplashScreen />;
  }

  if (!isAuthenticated) {
    const returnTo = location.pathname + location.search;
    const loginPath = `${RoutePath.login}${returnTo !== '/' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;

    return <Navigate to={loginPath} replace />;
  }

  if (!profile) {
    return <SplashScreen />;
  }

  if (!canAccessAdminPath(location.pathname, profile)) {
    const fallbackPath = getDefaultAdminPath(profile) ?? RoutePath.main;

    if (fallbackPath !== location.pathname) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  return <>{children}</>;
};
