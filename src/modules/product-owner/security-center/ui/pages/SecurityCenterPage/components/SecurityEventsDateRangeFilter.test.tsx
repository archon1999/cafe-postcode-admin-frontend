// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('app/providers/locales', () => ({
  useTranslate: () => ({ t: (key: string) => key }),
}));

vi.mock('shared/ui/Iconify', () => ({ Iconify: () => null }));

vi.mock('modules/restaurant-admin/reports/ui/components/ReportsDateRangePicker', () => ({
  ReportsDateRangePicker: ({
    empty,
    onPresetChange,
    onRangeChange,
  }: {
    empty?: boolean;
    onPresetChange: (preset: 'today') => void;
    onRangeChange: (startDate: string, endDate: string) => void;
  }) => (
    <div data-testid="reports-date-range-picker" data-empty={String(empty)}>
      <button type="button" onClick={() => onPresetChange('today')}>
        preset
      </button>
      <button type="button" onClick={() => onRangeChange('2026-08-23', '2026-08-22')}>
        custom
      </button>
    </div>
  ),
}));

import { getPresetDateRange } from 'modules/restaurant-admin/reports/ui/components/reportsDateRange';

import { SecurityEventsDateRangeFilter } from './SecurityEventsDateRangeFilter';

afterEach(cleanup);

describe('SecurityEventsDateRangeFilter', () => {
  it('reuses the reports range picker without applying its fallback range', () => {
    const onChange = vi.fn();

    render(<SecurityEventsDateRangeFilter value={null} onChange={onChange} />);

    expect(screen.getByTestId('reports-date-range-picker')).toHaveAttribute('data-empty', 'true');
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'custom' }));
    expect(onChange).toHaveBeenLastCalledWith({ startDate: '2026-08-22', endDate: '2026-08-23' });

    fireEvent.click(screen.getByRole('button', { name: 'preset' }));
    expect(onChange).toHaveBeenLastCalledWith(getPresetDateRange('today'));
  });

  it('clears an active range', () => {
    const onChange = vi.fn();

    render(
      <SecurityEventsDateRangeFilter value={{ startDate: '2026-08-22', endDate: '2026-08-23' }} onChange={onChange} />,
    );

    expect(screen.getByTestId('reports-date-range-picker')).toHaveAttribute('data-empty', 'false');

    fireEvent.click(screen.getByRole('button', { name: 'events.dateRange.clear' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
