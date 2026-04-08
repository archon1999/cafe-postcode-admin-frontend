import type { Dayjs } from 'dayjs';

import { getCurrentTashkentTime, toTashkentCalendarDayjs } from 'shared/utils/dayjs';

export type ReportsDatePreset = 'today' | 'month' | 'year' | 'custom';

export type ReportsDateRangeState = {
  startDate: string;
  endDate: string;
  activePreset: ReportsDatePreset;
};

type PresetDateRange = Omit<ReportsDateRangeState, 'activePreset'>;
const DATE_VALUE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function formatRangeDate(value: Dayjs) {
  return value.format('YYYY-MM-DD');
}

export function getPresetDateRange(
  preset: Exclude<ReportsDatePreset, 'custom'>,
  baseDate: Dayjs = getCurrentTashkentTime(),
): PresetDateRange {
  const currentDate = baseDate.startOf('day');

  if (preset === 'month') {
    return {
      startDate: formatRangeDate(currentDate.startOf('month')),
      endDate: formatRangeDate(currentDate.endOf('month')),
    };
  }

  if (preset === 'year') {
    return {
      startDate: formatRangeDate(currentDate.startOf('year')),
      endDate: formatRangeDate(currentDate.endOf('year')),
    };
  }

  const today = formatRangeDate(currentDate);

  return {
    startDate: today,
    endDate: today,
  };
}

export function createPresetRangeState(
  preset: Exclude<ReportsDatePreset, 'custom'>,
  baseDate?: Dayjs,
): ReportsDateRangeState {
  return {
    ...getPresetDateRange(preset, baseDate),
    activePreset: preset,
  };
}

export function createCustomRangeState(startDate: string, endDate: string): ReportsDateRangeState {
  if (startDate <= endDate) {
    return {
      startDate,
      endDate,
      activePreset: 'custom',
    };
  }

  return {
    startDate: endDate,
    endDate: startDate,
    activePreset: 'custom',
  };
}

export function updateRangeStart(
  state: ReportsDateRangeState,
  nextStartDate: string,
): ReportsDateRangeState {
  const startDate = nextStartDate || state.startDate;

  return {
    startDate,
    endDate: startDate > state.endDate ? startDate : state.endDate,
    activePreset: 'custom',
  };
}

export function updateRangeEnd(
  state: ReportsDateRangeState,
  nextEndDate: string,
): ReportsDateRangeState {
  const endDate = nextEndDate || state.endDate;

  return {
    startDate: endDate < state.startDate ? endDate : state.startDate,
    endDate,
    activePreset: 'custom',
  };
}

export function isValidReportsDate(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    DATE_VALUE_PATTERN.test(value) &&
    toTashkentCalendarDayjs(value, 'YYYY-MM-DD').isValid()
  );
}

export function isReportsDatePreset(value: unknown): value is ReportsDatePreset {
  return value === 'today' || value === 'month' || value === 'year' || value === 'custom';
}
