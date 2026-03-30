import Box from '@mui/material/Box';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { Toolbar } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import {
  DataGridColumnsDialogButton,
  ToolbarContainer,
  ToolbarLeftPanel,
  ToolbarRightPanel,
} from 'shared/ui/CustomDataGrid';
import { FilterSelect, type FilterOption } from 'shared/ui/Filters';
import { TableSearchInput } from 'shared/ui/TableSearchInput';

type KitchenGridToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  statuses: string[];
  onStatusesChange: (values: string[]) => void;
  onStatusesApply: (values: string[]) => void;
  prepStationIds: string[];
  onPrepStationIdsChange: (values: string[]) => void;
  onPrepStationIdsApply: (values: string[]) => void;
  routedViaValues: string[];
  onRoutedViaValuesChange: (values: string[]) => void;
  onRoutedViaValuesApply: (values: string[]) => void;
  printedValues: string[];
  onPrintedValuesChange: (values: string[]) => void;
  onPrintedValuesApply: (values: string[]) => void;
  statusOptions: FilterOption[];
  prepStationOptions: FilterOption[];
  routedViaOptions: FilterOption[];
  printedOptions: FilterOption[];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function KitchenGridToolbar({
  search,
  onSearchChange,
  onClearSearch,
  statuses,
  onStatusesChange,
  onStatusesApply,
  prepStationIds,
  onPrepStationIdsChange,
  onPrepStationIdsApply,
  routedViaValues,
  onRoutedViaValuesChange,
  onRoutedViaValuesApply,
  printedValues,
  onPrintedValuesChange,
  onPrintedValuesApply,
  statusOptions,
  prepStationOptions,
  routedViaOptions,
  printedOptions,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: KitchenGridToolbarProps) {
  const { t } = useTranslate('kitchen');

  return (
    <Toolbar>
      <ToolbarContainer>
        <ToolbarLeftPanel>
          <TableSearchInput
            size="small"
            label={t('filters.search')}
            placeholder={t('filters.searchPlaceholder')}
            value={search}
            onChange={onSearchChange}
            onClear={onClearSearch}
            fullWidth
            clearAriaLabel={t('filters.clearSearch')}
            sx={{ minWidth: { xs: 1, md: 260 }, maxWidth: { md: 320 } }}
            inputProps={{ 'data-testid': 'kitchen-tickets-search' }}
          />

          <FilterSelect
            label={t('filters.status')}
            value={statuses}
            options={statusOptions}
            onChange={onStatusesChange}
            onApply={onStatusesApply}
            emptyLabel={t('filters.all')}
            testId="kitchen-tickets-status-filter"
          />

          <FilterSelect
            label={t('filters.prepStation')}
            value={prepStationIds}
            options={prepStationOptions}
            onChange={onPrepStationIdsChange}
            onApply={onPrepStationIdsApply}
            emptyLabel={t('filters.all')}
            testId="kitchen-tickets-prep-station-filter"
          />

          <FilterSelect
            label={t('filters.routedVia')}
            value={routedViaValues}
            options={routedViaOptions}
            onChange={onRoutedViaValuesChange}
            onApply={onRoutedViaValuesApply}
            emptyLabel={t('filters.all')}
            testId="kitchen-tickets-routed-via-filter"
          />

          <FilterSelect
            label={t('filters.printed')}
            value={printedValues}
            options={printedOptions}
            onChange={onPrintedValuesChange}
            onApply={onPrintedValuesApply}
            emptyLabel={t('filters.all')}
            testId="kitchen-tickets-printed-filter"
          />
        </ToolbarLeftPanel>

        <ToolbarRightPanel>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DataGridColumnsDialogButton
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={defaultColumnVisibilityModel}
              onSave={onSaveColumns}
              showLabel
            />
          </Box>
        </ToolbarRightPanel>
      </ToolbarContainer>
    </Toolbar>
  );
}
