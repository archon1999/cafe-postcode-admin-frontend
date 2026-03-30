import { Suspense, lazy } from 'react';
import type { RouteObject } from 'react-router';
import { Outlet } from 'react-router';

import { AuthCenteredLayout } from 'app/layouts/AuthCentered';
import { RoutePath } from 'app/routes';
import { SplashScreen } from 'shared/ui/LoadingScreen';

import { GuestRoute } from '../guards/GuestRoute';

const LoginPage = lazy(() => import('modules/auth/ui/pages/LoginPage/LoginPage'));

const authChildren = [
  {
    path: RoutePath.login,
    element: (
      <GuestRoute>
        <AuthCenteredLayout>
          <LoginPage />
        </AuthCenteredLayout>
      </GuestRoute>
    ),
  },
];

export const authRoutes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: authChildren,
  },
];
