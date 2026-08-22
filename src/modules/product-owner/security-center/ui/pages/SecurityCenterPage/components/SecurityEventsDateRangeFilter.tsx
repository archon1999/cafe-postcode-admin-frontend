import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import {
  getPresetDateRange,
  REPORTS_DATE_QUICK_PRESETS,
  type ReportsDatePreset,
  type ReportsFixedDatePreset,
} from 'modules/restaurant-admin/reports/ui/components/reportsDateRange';
import { ReportsDateRangePicker } from 'modules/restaurant-admin/reports/ui/components/ReportsDateRangePicker';
import { Iconify } from 'shared/ui/Iconify';
import { formatDate } from 'shared/utils/format-time';

import { normalizeSecurityEventsDateRange, type SecurityEventsDateRange } from './security-events-date-range';

type SecurityEventsDateRangeFilterProps = {
  value: SecurityEventsDateRange | null;
  onChange: (value: SecurityEventsDateRange | null) => void;
};

export function SecurityEventsDateRangeFilter({ value, onChange }: SecurityEventsDateRangeFilterProps) {
  const { t } = useTranslate('security-center');
  const fallbackRange = useMemo(() => getPresetDateRange('last7Days'), []);
  const displayedRange = value ?? fallbackRange;
  const buttonLabel = value
    ? `${formatDate(value.startDate)} – ${formatDate(value.endDate)}`
    : t('events.dateRange.filter');
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
      sx={{ minWidth: 0 }}>
      <ReportsDateRangePicker
        activePreset={activePreset}
        startDate={displayedRange.startDate}
        endDate={displayedRange.endDate}
        empty={!value}
        onPresetChange={applyPreset}
        onRangeChange={applyRange}
        renderTrigger={({ open, onClick }) => (
          <Button
            size="small"
            variant={value ? 'soft' : 'outlined'}
            color={value ? 'primary' : 'inherit'}
            startIcon={<Iconify icon="solar:calendar-date-bold-duotone" />}
            onClick={onClick}
            aria-label={buttonLabel}
            aria-expanded={open || undefined}
            sx={{
              minWidth: { xs: 40, sm: 'auto' },
              px: { xs: 1, sm: 1.5 },
              '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 }, ml: { xs: 0, sm: -0.5 } },
            }}>
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              {buttonLabel}
            </Box>
          </Button>
        )}
      />

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
