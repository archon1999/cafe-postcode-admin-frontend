import Box from '@mui/material/Box';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { Toolbar } from '@mui/x-data-grid';

import {
  DataGridColumnsDialogButton,
  ToolbarContainer,
  ToolbarLeftPanel,
  ToolbarRightPanel,
} from 'shared/ui/CustomDataGrid';
import { FilterSelect, type FilterOption } from 'shared/ui/Filters';
import { TableSearchInput } from 'shared/ui/TableSearchInput';

type OrganizationsGridToolbarProps = {
  searchLabel: string;
  searchPlaceholder: string;
  clearSearchLabel: string;
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  filters?: Array<{
    label: string;
    value: string[];
    options: FilterOption[];
    onChange: (values: string[]) => void;
    onApply: (values: string[]) => void;
    testId: string;
    emptyLabel: string;
  }>;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSave: (nextModel: GridColumnVisibilityModel) => void;
};

export function OrganizationsGridToolbar({
  searchLabel,
  searchPlaceholder,
  clearSearchLabel,
  search,
  onSearchChange,
  onClearSearch,
  filters = [],
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSave,
}: OrganizationsGridToolbarProps) {
  return (
    <Toolbar>
      <ToolbarContainer>
        <ToolbarLeftPanel>
          <TableSearchInput
            size="small"
            label={searchLabel}
            placeholder={searchPlaceholder}
            value={search}
            onChange={onSearchChange}
            onClear={onClearSearch}
            fullWidth
            clearAriaLabel={clearSearchLabel}
            sx={{ minWidth: { xs: 1, md: 260 }, maxWidth: { md: 320 } }}
          />

          {filters.map((filter) => (
            <FilterSelect
              key={filter.testId}
              label={filter.label}
              value={filter.value}
              options={filter.options}
              onChange={filter.onChange}
              onApply={filter.onApply}
              emptyLabel={filter.emptyLabel}
              testId={filter.testId}
            />
          ))}
        </ToolbarLeftPanel>

        <ToolbarRightPanel>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DataGridColumnsDialogButton
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={defaultColumnVisibilityModel}
              onSave={onSave}
              showLabel
            />
          </Box>
        </ToolbarRightPanel>
      </ToolbarContainer>
    </Toolbar>
  );
}
