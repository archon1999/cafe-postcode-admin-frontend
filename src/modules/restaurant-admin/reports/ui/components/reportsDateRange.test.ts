import { describe, expect, it } from 'vitest';

import { toTashkentCalendarDayjs } from 'shared/utils/dayjs';

import {
  createCustomRangeState,
  createPresetRangeState,
  updateRangeEnd,
  updateRangeStart,
} from './reportsDateRange';

describe('reportsDateRange', () => {
  it('builds today preset for the current Tashkent day', () => {
    const state = createPresetRangeState('today', toTashkentCalendarDayjs('2026-04-08'));

    expect(state).toEqual({
      startDate: '2026-04-08',
      endDate: '2026-04-08',
      activePreset: 'today',
    });
  });

  it('builds full current month for the monthly preset', () => {
    const state = createPresetRangeState('month', toTashkentCalendarDayjs('2026-04-08'));

    expect(state).toEqual({
      startDate: '2026-04-01',
      endDate: '2026-04-30',
      activePreset: 'month',
    });
  });

  it('builds full current year for the yearly preset', () => {
    const state = createPresetRangeState('year', toTashkentCalendarDayjs('2026-04-08'));

    expect(state).toEqual({
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      activePreset: 'year',
    });
  });

  it('switches to custom when the start date changes', () => {
    const state = updateRangeStart(
      createPresetRangeState('today', toTashkentCalendarDayjs('2026-04-08')),
      '2026-04-05',
    );

    expect(state).toEqual({
      startDate: '2026-04-05',
      endDate: '2026-04-08',
      activePreset: 'custom',
    });
  });

  it('keeps the range valid when the new start date is after the current end date', () => {
    const state = updateRangeStart(
      createPresetRangeState('month', toTashkentCalendarDayjs('2026-04-08')),
      '2026-05-10',
    );

    expect(state).toEqual({
      startDate: '2026-05-10',
      endDate: '2026-05-10',
      activePreset: 'custom',
    });
  });

  it('keeps the range valid when the new end date is before the current start date', () => {
    const state = updateRangeEnd(
      createPresetRangeState('month', toTashkentCalendarDayjs('2026-04-08')),
      '2026-03-15',
    );

    expect(state).toEqual({
      startDate: '2026-03-15',
      endDate: '2026-03-15',
      activePreset: 'custom',
    });
  });

  it('normalizes an explicitly selected range when the dates are reversed', () => {
    const state = createCustomRangeState('2026-04-20', '2026-04-10');

    expect(state).toEqual({
      startDate: '2026-04-10',
      endDate: '2026-04-20',
      activePreset: 'custom',
    });
  });
});
