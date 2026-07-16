import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

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

  return (
    <ToolbarContainer>
      <ToolbarLeftPanel>
        <ReportsDateRangePicker
          activePreset={activePreset}
          startDate={startDate}
          endDate={endDate}
          onPresetChange={onPresetChange}
          onRangeChange={onRangeChange}
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
