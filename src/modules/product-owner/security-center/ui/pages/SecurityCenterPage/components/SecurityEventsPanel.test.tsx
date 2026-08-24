// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, adminScope } = vi.hoisted(() => ({
  queryMock: vi.fn(),
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
  DataGrid: ({ slots }: { slots: { toolbar: () => ReactNode } }) => <div>{slots.toolbar()}</div>,
  DataGridEmptyState: () => null,
  DataGridFiltersToolbar: ({ rightActions }: { rightActions?: ReactNode }) => <div>{rightActions}</div>,
}));

vi.mock('../../../../application', () => ({
  useSecurityEventsQuery: queryMock,
  useAcknowledgeSecurityEventMutation: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));

vi.mock('../../../shared', () => ({ SecurityStatusChip: () => null }));

import { SecurityEventsPanel } from './SecurityEventsPanel';

beforeEach(() => {
  queryMock.mockReset();
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

  it('keeps the server query unbounded until a range is selected', () => {
    render(<SecurityEventsPanel />);

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
});
