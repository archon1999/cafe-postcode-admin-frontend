import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { useTranslate } from 'app/providers/locales';
import type { AdminReportPeriodType } from 'shared/api/admin-types';
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
  periodType: AdminReportPeriodType;
  date: string;
  month: string;
  year: string;
  onPeriodTypeChange: (value: AdminReportPeriodType) => void;
  onDateChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onYearChange: (value: string) => void;
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

export function ReportsToolbar({
  periodType,
  date,
  month,
  year,
  onPeriodTypeChange,
  onDateChange,
  onMonthChange,
  onYearChange,
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
  const { t } = useTranslate('reports');

  const datePickerTextFieldProps = {
    size: 'small' as const,
    sx: { minWidth: 180 },
  };

  return (
    <ToolbarContainer>
      <ToolbarLeftPanel>
        <TextField
          select
          size="small"
          label={t('filters.periodType')}
          value={periodType}
          onChange={(event) => onPeriodTypeChange(event.target.value as AdminReportPeriodType)}
          sx={{ minWidth: 160 }}>
          <MenuItem value="day">{t('period.day')}</MenuItem>
          <MenuItem value="month">{t('period.month')}</MenuItem>
          <MenuItem value="year">{t('period.year')}</MenuItem>
        </TextField>

        {periodType === 'day' ? (
          <DatePicker
            label={t('filters.date')}
            value={date ? toTashkentCalendarDayjs(date) : null}
            onChange={(value) => onDateChange(value ? value.format('YYYY-MM-DD') : '')}
            slotProps={{
              field: {
                clearable: true,
                onClear: () => onDateChange(''),
              },
              textField: datePickerTextFieldProps,
            }}
            timezone={TASHKENT_TIMEZONE}
          />
        ) : null}

        {periodType === 'month' ? (
          <DatePicker
            label={t('filters.month')}
            views={['year', 'month']}
            openTo="month"
            value={month ? toTashkentCalendarDayjs(month) : null}
            onChange={(value) => onMonthChange(value ? value.format('YYYY-MM') : '')}
            slotProps={{
              field: {
                clearable: true,
                onClear: () => onMonthChange(''),
              },
              textField: datePickerTextFieldProps,
            }}
            timezone={TASHKENT_TIMEZONE}
          />
        ) : null}

        {periodType === 'year' ? (
          <DatePicker
            label={t('filters.year')}
            views={['year']}
            openTo="year"
            value={year ? toTashkentCalendarDayjs(year) : null}
            onChange={(value) => onYearChange(value ? value.format('YYYY') : '')}
            minDate={toTashkentCalendarDayjs('2020-01-01')}
            maxDate={toTashkentCalendarDayjs('2100-12-31')}
            slotProps={{
              field: {
                clearable: true,
                onClear: () => onYearChange(''),
              },
              textField: {
                ...datePickerTextFieldProps,
                sx: { minWidth: 140 },
              },
            }}
            timezone={TASHKENT_TIMEZONE}
          />
        ) : null}

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
