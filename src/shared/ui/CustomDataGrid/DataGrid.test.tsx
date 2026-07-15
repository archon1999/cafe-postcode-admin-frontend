/* @vitest-environment jsdom */

import '@testing-library/jest-dom/vitest';

import type { GridActionsCellItemProps, GridActionsColDef, GridColDef } from '@mui/x-data-grid';
import { act, cleanup, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const muiDataGridSpy = vi.hoisted(() => vi.fn());

vi.mock('@mui/x-data-grid', () => ({
  DataGrid: (props: unknown) => {
    muiDataGridSpy(props);
    return <div data-testid="data-grid" />;
  },
  useGridApiRef: () => ({ current: { unstable_setColumnVirtualization: vi.fn() } }),
}));

import { DataGrid, DEFAULT_DATA_GRID_AUTO_REFRESH_INTERVAL_MS } from './DataGrid';

beforeEach(() => {
  vi.useFakeTimers();
  muiDataGridSpy.mockClear();
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

describe('DataGrid action normalization', () => {
  it('preserves explicit menu placement and assigns defaults and stable keys to other actions', () => {
    const TestAction = (_props: GridActionsCellItemProps) => null;
    const icon = createElement('span');
    const columns: GridColDef[] = [
      {
        field: 'actions',
        type: 'actions',
        getActions: () => [
          createElement(TestAction, { key: 'existing-action', showInMenu: false, icon, label: 'Explicit action' }),
          createElement(TestAction, { icon, label: 'Default action' }),
        ],
      },
    ];

    render(<DataGrid rows={[{ id: 'row-1' }]} columns={columns} />);

    const muiProps = muiDataGridSpy.mock.lastCall?.[0] as { columns: GridColDef[] };
    const actionColumn = muiProps.columns[0] as GridActionsColDef;
    const actions = actionColumn.getActions({ id: 'row-1' } as never);
    const explicitAction = actions[0] as ReactElement<{ showInMenu?: boolean }>;
    const defaultAction = actions[1] as ReactElement<{ showInMenu?: boolean }>;

    expect(explicitAction.key).toBe('existing-action');
    expect(explicitAction.props.showInMenu).toBe(false);
    expect(defaultAction.key).toBe('row-1-action-1');
    expect(defaultAction.props.showInMenu).toBe(true);
    expect(actionColumn).toMatchObject({ width: 56, minWidth: 56, maxWidth: 56 });
  });
});
