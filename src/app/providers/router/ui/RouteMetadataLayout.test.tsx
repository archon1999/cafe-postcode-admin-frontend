// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RoutePath } from 'app/routes';
import { authStore } from 'modules/auth/domain/stores/authentication.store';

import { RouteMetadataLayout } from './RouteMetadataLayout';

const mocks = vi.hoisted(() => ({
  logoutRequest: vi.fn(),
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key }),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      loadNamespaces: vi.fn().mockResolvedValue(undefined),
      resolvedLanguage: 'uz',
    },
    t: (key: string) => key,
  }),
}));

vi.mock('modules/auth/data-access', async (importOriginal) => ({
  ...(await importOriginal<typeof import('modules/auth/data-access')>()),
  logoutRequest: mocks.logoutRequest,
}));

const theme = createTheme();

function renderRouter(initialPath = '/test') {
  const router = createMemoryRouter(
    [
      {
        element: <RouteMetadataLayout />,
        children: [
          { path: '/test', element: <div>route content</div> },
          { path: RoutePath.login, element: <div>login content</div> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false }, queries: { retry: false } } });

  render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>,
  );

  return router;
}

beforeEach(() => {
  mocks.logoutRequest.mockReset().mockResolvedValue(undefined);
  authStore.getState().logout();
});

afterEach(() => {
  cleanup();
  authStore.getState().logout();
});

describe('RouteMetadataLayout auth overlays', () => {
  it('renders normal route content without a router-context crash', () => {
    renderRouter();

    expect(screen.getByText('route content')).toBeVisible();
  });

  it('logs out a locked session and navigates to login', async () => {
    authStore.getState().markLocked('2026-08-17T00:00:00Z');
    const router = renderRouter();

    expect(screen.getByText('lock.title')).toBeVisible();
    fireEvent.click(screen.getByText('lock.logout'));

    await waitFor(() => expect(mocks.logoutRequest).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(router.state.location.pathname).toBe(RoutePath.login));
    await waitFor(() => expect(screen.getByText('login content')).toBeVisible());
  });
});
