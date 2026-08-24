// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const { logoSpy } = vi.hoisted(() => ({ logoSpy: vi.fn() }));

vi.mock('../Logo', () => ({
  Logo: (props: unknown) => {
    logoSpy(props);
    return <span data-testid="logo" />;
  },
}));

import { AnimateLogoZoom } from './animate-logo';

const theme = createTheme({ cssVariables: true });

afterEach(() => {
  cleanup();
  logoSpy.mockReset();
});

describe('AnimateLogoZoom', () => {
  it('centers the logo inside the animation outlines', () => {
    render(
      <ThemeProvider theme={theme}>
        <AnimateLogoZoom />
      </ThemeProvider>,
    );

    expect(logoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        sx: expect.arrayContaining([expect.objectContaining({ justifyContent: 'center' })]),
      }),
    );
  });
});
