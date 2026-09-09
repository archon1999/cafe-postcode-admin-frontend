// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, bulkMock, adminScope } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  bulkMock: vi.fn(),
  adminScope: { selectedRestaurantId: null as string | null },
}));

vi.mock('app/providers/locales', () => ({
  getDataGridLocaleText: () => ({}),
  useTranslate: () => ({
    t: (key: string) => key,
    currentLang: { value: 'uz', numberFormat: { code: 'uz-UZ' } },
  }),
}));

vi.mock('shared/ui/Iconify', () => ({ Iconify: () => null }));
vi.mock('modules/auth', () => ({
  useAdminScopeStore: (selector: (state: { selectedRestaurantId: string | null }) => unknown) => selector(adminScope),
}));

vi.mock('shared/ui/CustomDataGrid', () => ({
  DataGrid: ({
    slots,
    onRowSelectionModelChange,
  }: {
    slots: { toolbar: () => ReactNode };
    onRowSelectionModelChange: (value: { type: 'include'; ids: Set<string> }) => void;
  }) => (
    <div>
      <button onClick={() => onRowSelectionModelChange({ type: 'include', ids: new Set(['first', 'second']) })}>
        Select two
      </button>
      {slots.toolbar()}
    </div>
  ),
  DataGridEmptyState: () => null,
  DataGridFiltersToolbar: ({ rightActions }: { rightActions?: ReactNode }) => <div>{rightActions}</div>,
}));

vi.mock('../../../../application', () => ({
  useSecurityEventsQuery: queryMock,
  useAcknowledgeSecurityEventsMutation: () => ({ isPending: false, mutateAsync: bulkMock }),
  useAcknowledgeSecurityEventMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock('../../../shared', () => ({ SecurityStatusChip: () => null }));

import { SecurityEventsPanel } from './SecurityEventsPanel';

beforeEach(() => {
  queryMock.mockReset();
  bulkMock.mockReset();
  adminScope.selectedRestaurantId = null;
  queryMock.mockReturnValue({
    data: { items: [], total: 0 },
    isError: false,
    isLoading: false,
    isFetching: false,
    refetch: vi.fn(),
  });
});

afterEach(cleanup);

describe('SecurityEventsPanel date range integration', () => {
  it('applies a controlled calendar range to the server query', () => {
    render(
      <SecurityEventsPanel
        businessPartnerId="partner-1"
        dateRange={{ startDate: '2026-08-22', endDate: '2026-08-22' }}
      />,
    );

    expect(queryMock).toHaveBeenCalledWith(
      expect.objectContaining({
        businessPartnerId: 'partner-1',
        from: '2026-08-21T19:00:00.000Z',
        to: '2026-08-22T18:59:59.999Z',
      }),
    );
    expect(screen.getByTestId('security-events-date-range-filter')).toBeVisible();
  });

  it('defaults to a rolling last 24 hours', () => {
    render(<SecurityEventsPanel />);

    expect(queryMock).toHaveBeenCalledWith(expect.objectContaining({ last24Hours: true }));
    expect(queryMock).toHaveBeenCalledWith(
      expect.not.objectContaining({
        from: expect.anything(),
        to: expect.anything(),
      }),
    );
  });

  it('filters server-side by the branch selected in the grid header', () => {
    adminScope.selectedRestaurantId = 'restaurant-2';

    render(<SecurityEventsPanel />);

    expect(queryMock).toHaveBeenCalledWith(expect.objectContaining({ restaurantId: 'restaurant-2' }));
  });
  it('acknowledges selected IDs and clears the selection after success', async () => {
    bulkMock.mockResolvedValue({ updated: 2, ids: ['first', 'second'] });
    render(<SecurityEventsPanel />);
    fireEvent.click(screen.getByRole('button', { name: 'Select two' }));
    fireEvent.click(screen.getByRole('button', { name: 'events.bulkAcknowledge' }));
    await waitFor(() => expect(bulkMock).toHaveBeenCalledWith(['first', 'second']));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'events.bulkAcknowledge' })).not.toBeInTheDocument(),
    );
  });
});
