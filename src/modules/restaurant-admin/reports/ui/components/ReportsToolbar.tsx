import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { usePopover } from 'minimal-shared/hooks';

import { useTranslate } from 'app/providers/locales';
import { DataGridColumnsDialogButton } from 'shared/ui/CustomDataGrid';
import { CustomPopover } from 'shared/ui/CustomPopover';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { TableSearchInput } from 'shared/ui/TableSearchInput';

import type { ReportsDatePreset, ReportsFixedDatePreset } from './reportsDateRange';
import { ReportsDateRangePicker } from './ReportsDateRangePicker';

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
  const { t } = useTranslate('reports');
  const menu = usePopover();
  const activeFilters = filters.flatMap((filter) =>
    filter.value.map((value) => ({
      filter,
      value,
      label: filter.options.find((option) => String(option.value) === value)?.label ?? value,
    })),
  );

  return (
    <>
      <Box
        sx={{
          p: 2.5,
          gap: 2,
          display: 'flex',
          pr: { xs: 2.5, md: 1 },
          flexWrap: 'wrap',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-end', md: 'center' },
        }}>
        <ReportsDateRangePicker
          activePreset={activePreset}
          startDate={startDate}
          endDate={endDate}
          onPresetChange={onPresetChange}
          onRangeChange={onRangeChange}
          renderTrigger={({ displayValue, open, onClick }) => (
            <TextField
              label={t('filters.dateRange')}
              value={displayValue}
              onClick={onClick}
              inputProps={{ 'aria-haspopup': 'dialog', 'aria-expanded': open }}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <Iconify icon="solar:calendar-mark-bold" width={20} />
                  </InputAdornment>
                ),
              }}
              sx={{ flexShrink: 0, width: { xs: 1, md: 280 } }}
            />
          )}
        />
        {filters.map((filter) => (
          <FormControl key={filter.testId} sx={{ flexShrink: 0, width: { xs: 1, md: 180 } }}>
            <InputLabel id={`${filter.testId}-label`}>{filter.label}</InputLabel>
            <Select
              labelId={`${filter.testId}-label`}
              label={filter.label}
              value={filter.value[0] ?? ''}
              data-testid={filter.testId}
              onChange={(event) => filter.onApply(event.target.value ? [event.target.value] : [])}>
              <MenuItem value="">{filter.emptyLabel}</MenuItem>
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={String(option.value)}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ))}
        <Box
          sx={{
            gap: 1,
            width: { xs: 1, md: 'auto' },
            minWidth: 0,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
          }}>
          {showSearch && onSearchChange ? (
            <TableSearchInput
              fullWidth
              placeholder={searchPlaceholder ?? t('filters.searchPlaceholder')}
              inputProps={{ 'aria-label': t('filters.search') }}
              value={search}
              onChange={onSearchChange}
              onClear={onClearSearch}
              clearAriaLabel={t('filters.clearSearch')}
              sx={{ minWidth: { md: 180 } }}
            />
          ) : (
            <Box sx={{ flexGrow: 1 }} />
          )}
          {showColumns && onSaveColumns && (
            <DataGridColumnsDialogButton
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={defaultColumnVisibilityModel}
              onSave={onSaveColumns}
              showLabel={false}
            />
          )}
          <Tooltip title={t('actions.more')}>
            <IconButton
              onClick={menu.onOpen}
              aria-label={t('actions.more')}
              aria-haspopup="menu"
              aria-expanded={menu.open}
              color={menu.open ? 'inherit' : 'default'}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      {(activeFilters.length > 0 || search) && (
        <Stack direction="row" spacing={1} useFlexGap sx={{ px: 2.5, pb: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
          {search && <Chip size="small" label={search} onDelete={onClearSearch} />}
          {activeFilters.map(({ filter, value, label }) => (
            <Chip
              key={`${filter.testId}-${value}`}
              size="small"
              variant="soft"
              label={`${filter.label}: ${label}`}
              onDelete={() => filter.onApply(filter.value.filter((item) => item !== value))}
            />
          ))}
          <Button
            size="small"
            color="error"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => {
              onClearSearch?.();
              filters.filter((filter) => filter.value.length).forEach((filter) => filter.onApply([]));
            }}>
            {t('actions.clearFilters')}
          </Button>
        </Stack>
      )}
      <CustomPopover
        open={menu.open}
        anchorEl={menu.anchorEl}
        onClose={menu.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}>
        <MenuList>
          <MenuItem
            disabled={exportLoading}
            onClick={() => {
              menu.onClose();
              onExport();
            }}>
            <Iconify icon="solar:export-bold" />
            {t('actions.exportExcel')}
          </MenuItem>
          <MenuItem
            disabled={refreshLoading}
            onClick={() => {
              menu.onClose();
              onRefresh();
            }}>
            <Iconify icon="solar:refresh-bold" />
            {t('actions.refresh')}
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </>
  );
}
