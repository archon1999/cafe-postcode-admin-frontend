import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import { alpha, useTheme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { enUS } from 'date-fns/locale/en-US';
import { ru } from 'date-fns/locale/ru';
import { uz } from 'date-fns/locale/uz';
import { uzCyrl } from 'date-fns/locale/uz-Cyrl';
import { useEffect, useMemo, useState, type MouseEvent } from 'react';
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

import { createCustomRangeState, type ReportsDatePreset } from './reportsDateRange';

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
  activePreset: _activePreset,
  startDate,
  endDate,
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
  const { t: tCommon } = useTranslate('common');
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up('md'));

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draftRange, setDraftRange] = useState<DateRange | undefined>(() => ({
    from: toRangePickerDate(startDate),
    to: toRangePickerDate(endDate),
  }));
  const [displayMonth, setDisplayMonth] = useState<Date>(() => toRangePickerDate(startDate));

  const open = Boolean(anchorEl);
  const dateRangeLabel = t('filters.dateRange', { defaultValue: 'Date range' });
  const applyLabel = t('actions.applyRange', { defaultValue: 'Apply' });

  const displayValue = useMemo(
    () => `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`,
    [endDate, startDate],
  );

  const draftDisplayValue = useMemo(() => {
    if (!draftRange?.from) {
      return displayValue;
    }

    const draftStartDate = fromRangePickerDate(draftRange.from);
    const draftEndDate = fromRangePickerDate(draftRange.to ?? draftRange.from);

    return `${formatDisplayDate(draftStartDate)} - ${formatDisplayDate(draftEndDate)}`;
  }, [displayValue, draftRange]);

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

  useEffect(() => {
    if (!open) {
      return;
    }

    const nextFrom = toRangePickerDate(startDate);
    const nextTo = toRangePickerDate(endDate);

    setDraftRange({ from: nextFrom, to: nextTo });
    setDisplayMonth(nextFrom);
  }, [endDate, open, startDate]);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleApply = () => {
    if (!draftRange?.from) {
      return;
    }

    const nextRangeState = createCustomRangeState(
      fromRangePickerDate(draftRange.from),
      fromRangePickerDate(draftRange.to ?? draftRange.from),
    );

    onRangeChange(nextRangeState.startDate, nextRangeState.endDate);
    handleClose();
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
            p: 2,
            '& .rdp-root': {
              '--rdp-accent-color': theme.palette.primary.main,
              '--rdp-accent-background-color': alpha(theme.palette.primary.main, 0.14),
              margin: 0,
            },
            '& .rdp-months': {
              justifyContent: 'center',
            },
            '& .rdp-day_button': {
              width: 40,
              height: 40,
              borderRadius: 1.5,
            },
            '& .rdp-dropdown_root': {
              borderRadius: 1,
            },
          }}>
          <DayPicker
            mode="range"
            selected={draftRange}
            onSelect={setDraftRange}
            month={displayMonth}
            onMonthChange={setDisplayMonth}
            locale={dayPickerLocale}
            timeZone={TASHKENT_TIMEZONE}
            numberOfMonths={mdUp ? 2 : 1}
            defaultMonth={toRangePickerDate(startDate)}
            startMonth={MIN_MONTH}
            endMonth={MAX_MONTH}
            showOutsideDays
            pagedNavigation
            fixedWeeks
            resetOnSelect
            navLayout="after"
            captionLayout="dropdown"
          />

          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: (nextTheme) => `1px solid ${nextTheme.vars.palette.divider}`,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
              gap: 1.5,
            }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', flex: 1, minWidth: 0 }}>
              {draftDisplayValue}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button size="small" color="inherit" onClick={handleClose}>
                {tCommon('actions.cancel')}
              </Button>

              <Button size="small" variant="contained" color="black" onClick={handleApply}>
                {applyLabel}
              </Button>
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
