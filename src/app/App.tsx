import type { FC } from 'react';

import { useAdminSessionLifecycle, useAuthBootstrap } from 'modules/auth';
import { MotionLazy } from 'shared/ui/Animate/motion-lazy.tsx';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'shared/ui/Settings';
import { Snackbar } from 'shared/ui/Snackbar';

import { I18nProvider } from './providers/locales/i18n-provider';
import { LocalizationProvider } from './providers/locales/localization-provider';
import { ReactQueryClientProvider } from './providers/query';
import { ThemeProvider } from './theme';

type AppProps = {
  children: React.ReactNode;
};

const AuthBootstrap = () => {
  useAuthBootstrap();
  useAdminSessionLifecycle();

  return null;
};

const App: FC<AppProps> = ({ children }) => {
  return (
    <ReactQueryClientProvider>
      <AuthBootstrap />
      <I18nProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <LocalizationProvider>
            <ThemeProvider>
              <MotionLazy>
                <Snackbar />
                <SettingsDrawer defaultSettings={defaultSettings}></SettingsDrawer>
                {children}
              </MotionLazy>
            </ThemeProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </I18nProvider>
    </ReactQueryClientProvider>
  );
};

export default App;
