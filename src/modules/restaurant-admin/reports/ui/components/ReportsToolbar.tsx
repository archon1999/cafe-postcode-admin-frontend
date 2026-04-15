import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import { alpha, useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { enUS } from 'date-fns/locale/en-US';
import { ru } from 'date-fns/locale/ru';
import { uz } from 'date-fns/locale/uz';
import { uzCyrl } from 'date-fns/locale/uz-Cyrl';
import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import { DayPicker, TZDate, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

import { useTranslate } from 'app/providers/locales';
import {
  DataGridColumnsDialogButton,
  ToolbarContainer,
  ToolbarLeftPanel,
  ToolbarRightPanel,
} from 'shared/ui/CustomDataGrid';
import { FilterSelect, type FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { TableSearchInput } from 'shared/ui/TableSearchInput';
import { TASHKENT_TIMEZONE, toTashkentCalendarDayjs } from 'shared/utils/dayjs';

import {
  createCustomRangeState,
  getPresetDateRange,
  isValidReportsDate,
  REPORTS_DATE_QUICK_PRESETS,
  updateRangeEnd,
  updateRangeStart,
  type ReportsDatePreset,
  type ReportsDateQuickPreset,
  type ReportsFixedDatePreset,
} from './reportsDateRange';

type ToolbarFilter = {
  label: string;
  value: string[];
  options: FilterOption[];
  onChange: (values: string[]) => void;
  onApply: (values: string[]) => void;
  testId: string;
  emptyLabel: string;
};

export type ReportsToolbarFilter = ToolbarFilter;

type ReportsToolbarProps = {
  activePreset: ReportsDatePreset;
  startDate: string;
  endDate: string;
  onPresetChange: (value: ReportsFixedDatePreset) => void;
  onRangeChange: (startDate: string, endDate: string) => void;
  search?: string;
  onSearchChange?: (value: string) => void;
  onClearSearch?: () => void;
  searchPlaceholder?: string;
  filters?: ToolbarFilter[];
  columns?: GridColDef[];
  columnVisibilityModel?: GridColumnVisibilityModel;
  defaultColumnVisibilityModel?: GridColumnVisibilityModel;
  onSaveColumns?: (nextModel: GridColumnVisibilityModel) => void;
  onRefresh: () => void;
  refreshLoading?: boolean;
  onExport: () => void;
  exportLoading?: boolean;
  showSearch?: boolean;
  showColumns?: boolean;
};

const MIN_MONTH = new TZDate(2020, 0, 1, TASHKENT_TIMEZONE);
const MAX_MONTH = new TZDate(2100, 11, 31, TASHKENT_TIMEZONE);
const MIN_DATE_VALUE = '2020-01-01';
const MAX_DATE_VALUE = '2100-12-31';

function formatDisplayDate(value: string) {
  return toTashkentCalendarDayjs(value, 'YYYY-MM-DD').format('DD.MM.YYYY');
}

function toRangePickerDate(value: string) {
  const date = toTashkentCalendarDayjs(value, 'YYYY-MM-DD');

  return new TZDate(date.year(), date.month(), date.date(), TASHKENT_TIMEZONE);
}

function fromRangePickerDate(value: Date) {
  return toTashkentCalendarDayjs(value).format('YYYY-MM-DD');
}

export function ReportsToolbar({
  activePreset,
  startDate,
  endDate,
  onPresetChange,
  onRangeChange,
  search = '',
  onSearchChange,
  onClearSearch,
  searchPlaceholder,
  filters = [],
  columns = [],
  columnVisibilityModel = {},
  defaultColumnVisibilityModel = {},
  onSaveColumns,
  onRefresh,
  refreshLoading = false,
  onExport,
  exportLoading = false,
  showSearch = false,
  showColumns = false,
}: ReportsToolbarProps) {
  const { t, currentLang } = useTranslate('reports');
  const theme = useTheme();

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(() => ({
    from: toRangePickerDate(startDate),
    to: toRangePickerDate(endDate),
  }));
  const [draftPreset, setDraftPreset] = useState<ReportsDatePreset>(activePreset);
  const [displayMonth, setDisplayMonth] = useState<Date>(() => toRangePickerDate(startDate));

  const open = Boolean(anchorEl);
  const dateRangeLabel = t('filters.dateRange');
  const quickSelectLabel = t('dateRangePicker.quickSelect');
  const fromLabel = t('dateRangePicker.from');
  const toLabel = t('dateRangePicker.to');

  const displayValue = useMemo(
    () => `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`,
    [endDate, startDate],
  );

  const draftStartDate = useMemo(() => (draftRange?.from ? fromRangePickerDate(draftRange.from) : ''), [draftRange]);
  const draftEndDate = useMemo(() => (draftRange?.to ? fromRangePickerDate(draftRange.to) : ''), [draftRange]);

  const dayPickerLocale = useMemo(() => {
    if (currentLang.value === 'ru') {
      return ru;
    }

    if (currentLang.value === 'uz-Cyrl') {
      return uzCyrl;
    }

    if (currentLang.value === 'uz') {
      return uz;
    }

    return enUS;
  }, [currentLang.value]);

  const quickPresetOptions = useMemo(
    () =>
      REPORTS_DATE_QUICK_PRESETS.map((preset) => ({
        value: preset,
        label:
          preset === 'today'
            ? t('dateRangePicker.presets.today')
            : preset === 'weekToDate'
              ? t('dateRangePicker.presets.weekToDate')
              : preset === 'quarterToDate'
                ? t('dateRangePicker.presets.quarterToDate')
                : preset === 'monthToDate'
                  ? t('dateRangePicker.presets.monthToDate')
                  : preset === 'yearToDate'
                    ? t('dateRangePicker.presets.yearToDate')
                    : preset === 'last7Days'
                      ? t('dateRangePicker.presets.last7Days')
                      : preset === 'lastWeek'
                        ? t('dateRangePicker.presets.lastWeek')
                        : preset === 'lastMonth'
                          ? t('dateRangePicker.presets.lastMonth')
                          : preset === 'lastQuarter'
                            ? t('dateRangePicker.presets.lastQuarter')
                            : t('dateRangePicker.presets.lastYear'),
      })),
    [t],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextFrom = toRangePickerDate(startDate);
    const nextTo = toRangePickerDate(endDate);

    setDraftRange({ from: nextFrom, to: nextTo });
    setDraftPreset(activePreset);
    setDisplayMonth(nextFrom);
  }, [activePreset, endDate, open, startDate]);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const syncDraftRange = (nextStartDate: string, nextEndDate: string, nextPreset: ReportsDatePreset) => {
    const nextFrom = toRangePickerDate(nextStartDate);
    const nextTo = toRangePickerDate(nextEndDate);

    setDraftRange({ from: nextFrom, to: nextTo });
    setDraftPreset(nextPreset);
    setDisplayMonth(nextFrom);
  };

  const commitCustomRange = (from: Date, to: Date) => {
    const nextRangeState = createCustomRangeState(fromRangePickerDate(from), fromRangePickerDate(to));

    syncDraftRange(nextRangeState.startDate, nextRangeState.endDate, nextRangeState.activePreset);
    onRangeChange(nextRangeState.startDate, nextRangeState.endDate);
  };

  const handleQuickPresetSelect = (preset: ReportsDateQuickPreset) => {
    const nextRange = getPresetDateRange(preset);

    syncDraftRange(nextRange.startDate, nextRange.endDate, preset);
    onPresetChange(preset);
  };

  const handleRangeSelect = (nextRange: DateRange | undefined) => {
    setDraftRange(nextRange);
    setDraftPreset('custom');

    if (!nextRange?.from) {
      return;
    }

    setDisplayMonth(nextRange.from);

    if (nextRange.to) {
      commitCustomRange(nextRange.from, nextRange.to);
    }
  };

  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextStartDate = event.target.value;

    if (!isValidReportsDate(nextStartDate)) {
      return;
    }

    const currentRangeState = createCustomRangeState(draftStartDate || startDate, draftEndDate || endDate);
    const nextRangeState = updateRangeStart(currentRangeState, nextStartDate);

    syncDraftRange(nextRangeState.startDate, nextRangeState.endDate, nextRangeState.activePreset);
    onRangeChange(nextRangeState.startDate, nextRangeState.endDate);
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextEndDate = event.target.value;

    if (!isValidReportsDate(nextEndDate)) {
      return;
    }

    const currentRangeState = createCustomRangeState(draftStartDate || startDate, draftEndDate || endDate);
    const nextRangeState = updateRangeEnd(currentRangeState, nextEndDate);

    syncDraftRange(nextRangeState.startDate, nextRangeState.endDate, nextRangeState.activePreset);
    onRangeChange(nextRangeState.startDate, nextRangeState.endDate);
  };

  return (
    <ToolbarContainer>
      <ToolbarLeftPanel>
        <TextField
          size="small"
          label={dateRangeLabel}
          value={displayValue}
          onClick={handleOpen}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="solar:calendar-mark-bold" width={18} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: { xs: '100%', md: 320 } }}
        />

        {showSearch && onSearchChange ? (
          <TableSearchInput
            size="small"
            label={t('filters.search')}
            placeholder={searchPlaceholder ?? t('filters.searchPlaceholder')}
            value={search}
            onChange={onSearchChange}
            onClear={onClearSearch}
            clearAriaLabel={t('filters.clearSearch')}
            fullWidth
            sx={{ minWidth: { xs: 1, md: 260 }, maxWidth: { md: 320 } }}
          />
        ) : null}

        {filters.map((filter) => (
          <FilterSelect
            key={filter.testId}
            label={filter.label}
            value={filter.value}
            options={filter.options}
            onChange={filter.onChange}
            onApply={filter.onApply}
            testId={filter.testId}
            emptyLabel={filter.emptyLabel}
          />
        ))}
      </ToolbarLeftPanel>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: 'fit-content',
              maxWidth: 'calc(100vw - 32px)',
            },
          },
        }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            width: { xs: 'calc(100vw - 32px)', md: 820 },
            maxWidth: 'calc(100vw - 32px)',
            '& .rdp-root': {
              '--rdp-accent-color': theme.palette.grey[900],
              '--rdp-accent-background-color': alpha(theme.palette.grey[700], 0.18),
              margin: 0,
            },
            '& .rdp-months': {
              justifyContent: 'center',
            },
            '& .rdp-month_caption': {
              justifyContent: 'center',
              fontSize: 20,
              fontWeight: 700,
              color: 'text.primary',
            },
            '& .rdp-weekday': {
              color: 'text.secondary',
              fontWeight: 600,
            },
            '& .rdp-day_button': {
              width: 40,
              height: 40,
              borderRadius: '50%',
            },
            '& .rdp-dropdown_root': {
              borderRadius: 1,
            },
          }}>
          <Box
            sx={{
              width: { xs: 1, md: 260 },
              flexShrink: 0,
              p: 2.5,
              borderRight: { md: (nextTheme) => `1px solid ${nextTheme.vars.palette.divider}` },
              borderBottom: { xs: (nextTheme) => `1px solid ${nextTheme.vars.palette.divider}`, md: 'none' },
            }}>
            <Typography variant="subtitle1" sx={{ mb: 1.5, color: 'text.secondary' }}>
              {quickSelectLabel}
            </Typography>

            <Box sx={{ display: 'grid', gap: 0.5 }}>
              {quickPresetOptions.map((option) => {
                const selected = draftPreset === option.value;

                return (
                  <Button
                    key={option.value}
                    color="inherit"
                    fullWidth
                    startIcon={<Iconify icon="solar:calendar-linear" width={20} />}
                    onClick={() => handleQuickPresetSelect(option.value)}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 1,
                      py: 1,
                      borderRadius: 1,
                      color: selected ? 'text.primary' : 'text.secondary',
                      bgcolor: selected ? alpha(theme.palette.grey[900], 0.08) : 'transparent',
                      '&:hover': {
                        bgcolor: selected ? alpha(theme.palette.grey[900], 0.12) : 'action.hover',
                      },
                    }}>
                    {option.label}
                  </Button>
                );
              })}
            </Box>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0, p: 2.5 }}>
            <DayPicker
              mode="range"
              selected={draftRange}
              onSelect={handleRangeSelect}
              month={displayMonth}
              onMonthChange={setDisplayMonth}
              locale={dayPickerLocale}
              timeZone={TASHKENT_TIMEZONE}
              numberOfMonths={1}
              defaultMonth={toRangePickerDate(startDate)}
              startMonth={MIN_MONTH}
              endMonth={MAX_MONTH}
              showOutsideDays
              pagedNavigation
              fixedWeeks
              resetOnSelect
              navLayout="around"
              captionLayout="label"
            />

            <Box
              sx={{
                mt: 2,
                pt: 2,
                borderTop: (nextTheme) => `1px solid ${nextTheme.vars.palette.divider}`,
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}>
              <TextField
                size="small"
                type="date"
                label={fromLabel}
                value={draftStartDate}
                onChange={handleStartDateChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: MIN_DATE_VALUE, max: MAX_DATE_VALUE }}
              />

              <TextField
                size="small"
                type="date"
                label={toLabel}
                value={draftEndDate}
                onChange={handleEndDateChange}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: MIN_DATE_VALUE, max: MAX_DATE_VALUE }}
              />
            </Box>
          </Box>
        </Box>
      </Popover>

      <ToolbarRightPanel>
        <Button
          variant="outlined"
          color="inherit"
          startIcon={<Iconify icon="solar:refresh-bold" />}
          onClick={onRefresh}
          loading={refreshLoading}>
          {t('actions.refresh')}
        </Button>

        {showColumns && onSaveColumns ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DataGridColumnsDialogButton
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={defaultColumnVisibilityModel}
              onSave={onSaveColumns}
              showLabel
            />
          </Box>
        ) : null}

        <Button
          variant="contained"
          color="black"
          startIcon={<Iconify icon="solar:download-minimalistic-bold" />}
          onClick={onExport}
          loading={exportLoading}>
          {t('actions.exportExcel')}
        </Button>
      </ToolbarRightPanel>
    </ToolbarContainer>
  );
}
