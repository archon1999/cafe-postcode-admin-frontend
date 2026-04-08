import type { Dayjs } from 'dayjs';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { useEffect, useMemo, useState } from 'react';

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

import { createCustomRangeState, type ReportsDatePreset, updateRangeStart } from './reportsDateRange';

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

type SelectionStep = 'start' | 'end';

function formatDisplayDate(value: string) {
  return toTashkentCalendarDayjs(value, 'YYYY-MM-DD').format('DD.MM.YYYY');
}

export function ReportsToolbar({
  activePreset,
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
  const { t } = useTranslate('reports');
  const { t: tCommon } = useTranslate('common');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [draftStartDate, setDraftStartDate] = useState(startDate);
  const [draftEndDate, setDraftEndDate] = useState(endDate);
  const [selectionStep, setSelectionStep] = useState<SelectionStep>('start');

  const open = Boolean(anchorEl);
  const dateRangeLabel = t('filters.dateRange', { defaultValue: 'Sana oralig‘i' });
  const startDateLabel = t('filters.startDate', { defaultValue: 'Boshlanish sanasi' });
  const endDateLabel = t('filters.endDate', { defaultValue: 'Tugash sanasi' });
  const applyLabel = t('actions.applyRange', { defaultValue: "Qo'llash" });
  const helperText =
    selectionStep === 'start'
      ? t('filters.selectStartDate', { defaultValue: 'Boshlanish sanasini tanlang' })
      : t('filters.selectEndDate', { defaultValue: 'Tugash sanasini tanlang' });

  const displayValue = useMemo(
    () => `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`,
    [endDate, startDate],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setSelectionStep(activePreset === 'custom' ? 'end' : 'start');
  }, [activePreset, endDate, open, startDate]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCalendarChange = (value: Dayjs | null) => {
    if (!value) {
      return;
    }

    const selectedDate = value.format('YYYY-MM-DD');

    if (selectionStep === 'start') {
      const nextState = updateRangeStart(
        {
          startDate: draftStartDate,
          endDate: draftEndDate,
          activePreset: 'custom',
        },
        selectedDate,
      );

      setDraftStartDate(nextState.startDate);
      setDraftEndDate(nextState.endDate);
      setSelectionStep('end');
      return;
    }

    const nextState = createCustomRangeState(draftStartDate, selectedDate);
    setDraftStartDate(nextState.startDate);
    setDraftEndDate(nextState.endDate);
  };

  const handleApply = () => {
    onRangeChange(draftStartDate, draftEndDate);
    handleClose();
  };

  return (
    <ToolbarContainer>
      <ToolbarLeftPanel>
        <TextField
          size="small"
          label={dateRangeLabel}
          value={displayValue}
          onClick={(event) => setAnchorEl(event.currentTarget)}
          slotProps={{
            input: {
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Iconify icon="solar:calendar-mark-bold" width={18} />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { xs: '100%', md: 280 } }}
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
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}>
        <Box sx={{ p: 2, width: 360, maxWidth: '100%' }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <Button
                size="small"
                variant={selectionStep === 'start' ? 'contained' : 'outlined'}
                color={selectionStep === 'start' ? 'black' : 'inherit'}
                onClick={() => setSelectionStep('start')}
                sx={{ justifyContent: 'flex-start', whiteSpace: 'nowrap' }}>
                {`${startDateLabel}: ${formatDisplayDate(draftStartDate)}`}
              </Button>

              <Button
                size="small"
                variant={selectionStep === 'end' ? 'contained' : 'outlined'}
                color={selectionStep === 'end' ? 'black' : 'inherit'}
                onClick={() => setSelectionStep('end')}
                sx={{ justifyContent: 'flex-start', whiteSpace: 'nowrap' }}>
                {`${endDateLabel}: ${formatDisplayDate(draftEndDate)}`}
              </Button>
            </Stack>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {helperText}
            </Typography>

            <DateCalendar
              value={toTashkentCalendarDayjs(
                selectionStep === 'start' ? draftStartDate : draftEndDate,
                'YYYY-MM-DD',
              )}
              onChange={handleCalendarChange}
              timezone={TASHKENT_TIMEZONE}
              sx={{ alignSelf: 'center' }}
            />

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button size="small" color="inherit" onClick={handleClose}>
                {tCommon('actions.cancel')}
              </Button>

              <Button size="small" variant="contained" color="black" onClick={handleApply}>
                {applyLabel}
              </Button>
            </Stack>
          </Stack>
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
