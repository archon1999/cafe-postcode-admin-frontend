/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import { act, cleanup, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: () => <div data-testid="data-grid" />,
  useGridApiRef: () => ({ current: { unstable_setColumnVirtualization: vi.fn() } }),
}));

import { DataGrid, DEFAULT_DATA_GRID_AUTO_REFRESH_INTERVAL_MS } from './DataGrid';

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('DataGrid auto refresh', () => {
  it('refreshes a visible list every 15 seconds', () => {
    const onRefresh = vi.fn();

    render(<DataGrid rows={[]} columns={[]} onRefresh={onRefresh} />);

    act(() => {
      vi.advanceTimersByTime(DEFAULT_DATA_GRID_AUTO_REFRESH_INTERVAL_MS);
    });

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('does not overlap an active refresh', () => {
    const onRefresh = vi.fn();

    render(<DataGrid rows={[]} columns={[]} onRefresh={onRefresh} refreshing />);

    act(() => {
      vi.advanceTimersByTime(DEFAULT_DATA_GRID_AUTO_REFRESH_INTERVAL_MS);
    });

    expect(onRefresh).not.toHaveBeenCalled();
  });
});
