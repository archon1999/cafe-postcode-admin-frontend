import { RoutePath } from 'app/routes';

import packageJson from '../../../package.json';

export type ConfigValue = {
  appName: string;
  appVersion: string;
  serverUrl: string;
  assetsDir: string;
  auth: {
    method: 'token';
    skip: boolean;
    redirectPath: string;
  };
};

export const CONFIG: ConfigValue = {
  appName: 'Cafe Postcode Admin',
  appVersion: packageJson.version,
  serverUrl: import.meta.env.VITE_SERVER_URL ?? '',
  assetsDir: import.meta.env.VITE_ASSETS_DIR ?? '',
  auth: {
    method: 'token',
    skip: false,
    redirectPath: RoutePath.userList,
  },
};
