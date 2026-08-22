import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { ReportsDateRangePicker } from 'modules/restaurant-admin/reports/ui/components/ReportsDateRangePicker';
import {
  getPresetDateRange,
  REPORTS_DATE_QUICK_PRESETS,
  type ReportsDatePreset,
  type ReportsFixedDatePreset,
} from 'modules/restaurant-admin/reports/ui/components/reportsDateRange';
import { Iconify } from 'shared/ui/Iconify';

import { normalizeSecurityEventsDateRange, type SecurityEventsDateRange } from './security-events-date-range';

type SecurityEventsDateRangeFilterProps = {
  value: SecurityEventsDateRange | null;
  onChange: (value: SecurityEventsDateRange | null) => void;
};

export function SecurityEventsDateRangeFilter({ value, onChange }: SecurityEventsDateRangeFilterProps) {
  const { t } = useTranslate('security-center');
  const fallbackRange = useMemo(() => getPresetDateRange('last7Days'), []);
  const displayedRange = value ?? fallbackRange;
  const activePreset = useMemo<ReportsDatePreset>(() => {
    if (!value) return 'custom';

    return (
      REPORTS_DATE_QUICK_PRESETS.find((preset) => {
        const presetRange = getPresetDateRange(preset);
        return presetRange.startDate === value.startDate && presetRange.endDate === value.endDate;
      }) ?? 'custom'
    );
  }, [value]);

  const applyPreset = (preset: ReportsFixedDatePreset) => {
    const nextRange = getPresetDateRange(preset);
    onChange({ startDate: nextRange.startDate, endDate: nextRange.endDate });
  };

  const applyRange = (startDate: string, endDate: string) => {
    onChange(normalizeSecurityEventsDateRange(startDate, endDate));
  };

  return (
    <Stack
      data-testid="security-events-date-range-filter"
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{ minWidth: 0, flex: { xs: 1, md: '0 1 auto' } }}>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <ReportsDateRangePicker
          activePreset={activePreset}
          startDate={displayedRange.startDate}
          endDate={displayedRange.endDate}
          empty={!value}
          onPresetChange={applyPreset}
          onRangeChange={applyRange}
        />
      </Box>

      {value && (
        <Tooltip title={t('events.dateRange.clear')}>
          <IconButton
            size="small"
            color="inherit"
            aria-label={t('events.dateRange.clear')}
            onClick={() => onChange(null)}>
            <Iconify icon="solar:close-circle-bold" width={20} />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  );
}
