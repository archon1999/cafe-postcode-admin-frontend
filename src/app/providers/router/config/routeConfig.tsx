import { createBrowserRouter } from 'react-router';

import { mainRoutes } from 'app/providers/router/config/mainRoutes.tsx';
import { RouteMetadataLayout } from 'app/providers/router/ui/RouteMetadataLayout';
import { RoutePath } from 'app/routes';
import { NotFound } from 'modules/error';

import { authRoutes } from './authRoutes.tsx';

export const routeConfig = createBrowserRouter([
  {
    element: <RouteMetadataLayout />,
    children: [
      ...mainRoutes,
      ...authRoutes,
      {
        path: RoutePath.notfound,
        element: <NotFound />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);
