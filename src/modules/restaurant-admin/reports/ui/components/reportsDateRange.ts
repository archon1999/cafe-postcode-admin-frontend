import type { Dayjs } from 'dayjs';

import { getCurrentTashkentTime, toTashkentCalendarDayjs } from 'shared/utils/dayjs';

export const REPORTS_DATE_QUICK_PRESETS = [
  'today',
  'weekToDate',
  'quarterToDate',
  'monthToDate',
  'yearToDate',
  'last7Days',
  'lastWeek',
  'lastMonth',
  'lastQuarter',
  'lastYear',
] as const;

const REPORTS_DATE_PRESETS = [...REPORTS_DATE_QUICK_PRESETS, 'month', 'year', 'custom'] as const;

export type ReportsDateQuickPreset = (typeof REPORTS_DATE_QUICK_PRESETS)[number];
export type ReportsDatePreset = (typeof REPORTS_DATE_PRESETS)[number];
export type ReportsFixedDatePreset = Exclude<ReportsDatePreset, 'custom'>;

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

function getQuarterStart(value: Dayjs) {
  return value.month(Math.floor(value.month() / 3) * 3).startOf('month');
}

export function getPresetDateRange(
  preset: ReportsFixedDatePreset,
  baseDate: Dayjs = getCurrentTashkentTime(),
): PresetDateRange {
  const currentDate = baseDate.startOf('day');

  if (preset === 'weekToDate') {
    return {
      startDate: formatRangeDate(currentDate.startOf('week')),
      endDate: formatRangeDate(currentDate),
    };
  }

  if (preset === 'quarterToDate') {
    return {
      startDate: formatRangeDate(getQuarterStart(currentDate)),
      endDate: formatRangeDate(currentDate),
    };
  }

  if (preset === 'monthToDate') {
    return {
      startDate: formatRangeDate(currentDate.startOf('month')),
      endDate: formatRangeDate(currentDate),
    };
  }

  if (preset === 'yearToDate') {
    return {
      startDate: formatRangeDate(currentDate.startOf('year')),
      endDate: formatRangeDate(currentDate),
    };
  }

  if (preset === 'last7Days') {
    return {
      startDate: formatRangeDate(currentDate.subtract(7, 'day')),
      endDate: formatRangeDate(currentDate),
    };
  }

  if (preset === 'lastWeek') {
    const previousWeekStart = currentDate.startOf('week').subtract(1, 'week');

    return {
      startDate: formatRangeDate(previousWeekStart),
      endDate: formatRangeDate(previousWeekStart.endOf('week')),
    };
  }

  if (preset === 'month') {
    return {
      startDate: formatRangeDate(currentDate.startOf('month')),
      endDate: formatRangeDate(currentDate.endOf('month')),
    };
  }

  if (preset === 'lastMonth') {
    const previousMonthStart = currentDate.startOf('month').subtract(1, 'month');

    return {
      startDate: formatRangeDate(previousMonthStart),
      endDate: formatRangeDate(previousMonthStart.endOf('month')),
    };
  }

  if (preset === 'lastQuarter') {
    const currentQuarterStart = getQuarterStart(currentDate);
    const previousQuarterStart = currentQuarterStart.subtract(3, 'month');

    return {
      startDate: formatRangeDate(previousQuarterStart),
      endDate: formatRangeDate(currentQuarterStart.subtract(1, 'day')),
    };
  }

  if (preset === 'year') {
    return {
      startDate: formatRangeDate(currentDate.startOf('year')),
      endDate: formatRangeDate(currentDate.endOf('year')),
    };
  }

  if (preset === 'lastYear') {
    const previousYearStart = currentDate.startOf('year').subtract(1, 'year');

    return {
      startDate: formatRangeDate(previousYearStart),
      endDate: formatRangeDate(previousYearStart.endOf('year')),
    };
  }

  const today = formatRangeDate(currentDate);

  return {
    startDate: today,
    endDate: today,
  };
}

export function createPresetRangeState(preset: ReportsFixedDatePreset, baseDate?: Dayjs): ReportsDateRangeState {
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

export function updateRangeStart(state: ReportsDateRangeState, nextStartDate: string): ReportsDateRangeState {
  const startDate = nextStartDate || state.startDate;

  return {
    startDate,
    endDate: startDate > state.endDate ? startDate : state.endDate,
    activePreset: 'custom',
  };
}

export function updateRangeEnd(state: ReportsDateRangeState, nextEndDate: string): ReportsDateRangeState {
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
  return typeof value === 'string' && REPORTS_DATE_PRESETS.includes(value as ReportsDatePreset);
}
