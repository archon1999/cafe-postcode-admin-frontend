import type { ColorSystem } from '@mui/material/styles';
import { setFont, hexToRgbChannel, createPaletteChannel } from 'minimal-shared/utils';

import type { SettingsState } from 'shared/ui/Settings';

import { createShadowColor } from '../core/custom-shadows';
import type { ThemeOptions, ThemeColorScheme } from '../types';

import { primaryColorPresets } from './color-presets';

export function applySettingsToTheme(theme: ThemeOptions, settingsState?: SettingsState): ThemeOptions {
  const { direction, fontFamily, contrast = 'default', primaryColor = 'default' } = settingsState ?? {};

  const isDefaultContrast = contrast === 'default';
  const isDefaultPrimaryColor = primaryColor === 'default';

  const lightPalette = theme.colorSchemes?.light?.palette as ColorSystem['palette'];

  const primaryColorPalette = createPaletteChannel(primaryColorPresets[primaryColor]);

  const updateColorScheme = (schemeName: ThemeColorScheme) => {
    const currentScheme = theme.colorSchemes?.[schemeName];

    const updatedPalette = {
      ...currentScheme?.palette,
      ...(!isDefaultPrimaryColor && {
        primary: primaryColorPalette,
      }),
      ...(schemeName === 'light' && {
        background: {
          ...lightPalette?.background,
          ...(!isDefaultContrast && {
            default: lightPalette.grey[200],
            defaultChannel: hexToRgbChannel(lightPalette.grey[200]),
          }),
        },
      }),
    };

    const updatedCustomShadows = {
      ...currentScheme?.customShadows,
      ...(!isDefaultPrimaryColor && {
        primary: createShadowColor(primaryColorPalette.mainChannel),
      }),
    };

    return {
      ...currentScheme,
      palette: updatedPalette,
      customShadows: updatedCustomShadows,
    };
  };

  return {
    ...theme,
    direction,
    colorSchemes: {
      light: updateColorScheme('light'),
      dark: updateColorScheme('dark'),
    },
    typography: {
      ...theme.typography,
      fontFamily: setFont(fontFamily),
    },
  };
}
