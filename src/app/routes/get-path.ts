import { RoutePath } from './route-paths';

export const getPath = (route: keyof typeof RoutePath, params?: Record<string, string | number>) => {
  let path = RoutePath[route];

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      path = path.replace(`:${key}`, String(value));
    });
  }

  return path;
};
