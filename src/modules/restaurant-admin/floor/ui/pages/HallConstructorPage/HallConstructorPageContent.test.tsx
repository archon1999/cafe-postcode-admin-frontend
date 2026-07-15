/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const testState = vi.hoisted(() => ({
  mode: undefined as 'light' | 'dark' | 'system' | undefined,
  hallConstructor: {
    hallName: 'Main hall',
    gridColumns: 8,
    tables: [
      {
        id: 'table-1',
        name: 'Table 1',
        tableNumber: 1,
        seatCount: 4,
        shapeVariant: 'seat4_square',
        positionX: 0,
        positionY: 0,
        width: 1,
        height: 1,
        isActive: true,
      },
    ],
  },
}));

vi.mock('app/layouts/Dashboard', () => ({
  Content: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('app/routes', () => ({
  RoutePath: {
    floorHallList: '/halls',
  },
}));

vi.mock('shared/hooks/router', () => ({
  useRedirectOnNotFound: vi.fn(),
}));

vi.mock('shared/ui/BackToListButton', () => ({
  BackToListButton: () => null,
}));

vi.mock('shared/ui/CustomBreadcrumbs', () => ({
  CustomBreadcrumbs: () => null,
}));

vi.mock('shared/ui/Iconify', () => ({
  Iconify: () => null,
}));

vi.mock('shared/ui/LoadingScreen', () => ({
  LoadingScreen: () => <div data-testid="loading-screen" />,
}));

vi.mock('shared/ui/Settings', () => ({
  useSettingsContext: () => ({
    state: { mode: testState.mode },
  }),
}));

vi.mock('../../../application', () => ({
  useGetHallConstructorQuery: () => ({
    data: testState.hallConstructor,
    error: null,
    isLoading: false,
  }),
  useUpdateHallConstructorMutation: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

import { HallConstructorPageContent } from './HallConstructorPageContent';

afterEach(() => {
  cleanup();
  testState.mode = undefined;
});

function getTablePaletteElements() {
  const table = screen.getAllByRole('button').find((button) => button.textContent?.trim() === '1');

  if (!table || !table.parentElement?.parentElement) {
    throw new Error('Hall constructor table palette elements were not rendered');
  }

  return {
    canvas: table.parentElement.parentElement,
    table,
  };
}

describe('HallConstructorPageContent render mode', () => {
  it('uses the dark palette only for the exact dark mode', async () => {
    testState.mode = 'dark';
    render(<HallConstructorPageContent id="hall-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
    });

    const { canvas, table } = getTablePaletteElements();

    expect(getComputedStyle(canvas).backgroundColor).toBe('rgb(26, 29, 33)');
    expect(getComputedStyle(table).backgroundColor).toBe('rgb(32, 55, 69)');
  });

  it.each([
    ['light', 'light'],
    ['system', 'system'],
    ['undefined', undefined],
  ] as const)('uses the light palette for the current %s mode', async (_label, mode) => {
    testState.mode = mode;
    render(<HallConstructorPageContent id="hall-1" />);

    await waitFor(() => {
      expect(screen.queryByTestId('loading-screen')).not.toBeInTheDocument();
    });

    const { canvas, table } = getTablePaletteElements();

    expect(getComputedStyle(canvas).backgroundColor).toBe('rgba(244, 246, 248, 0.72)');
    expect(getComputedStyle(table).backgroundColor).toBe('rgba(25, 118, 210, 0.12)');
  });
});
