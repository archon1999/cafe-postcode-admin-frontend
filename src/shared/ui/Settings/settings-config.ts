import { CONFIG } from 'app/config/globalConfig.ts';
import { themeConfig } from 'app/theme/theme-config';

import type { SettingsState } from './types';

export const SETTINGS_STORAGE_KEY: string = 'app-settings';

export const defaultSettings: SettingsState = {
  mode: 'light',
  direction: themeConfig.direction,
  contrast: 'default',
  navLayout: 'vertical',
  primaryColor: 'preset3',
  navColor: 'integrate',
  compactLayout: false,
  fontSize: 16,
  fontFamily: themeConfig.fontFamily.primary,
  version: CONFIG.appVersion,
};
