import Box from '@mui/material/Box';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { Toolbar } from '@mui/x-data-grid';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { FilterSelect, type FilterOption } from 'shared/ui/Filters';
import { TableSearchInput } from 'shared/ui/TableSearchInput';

import { DataGridColumnsDialogButton } from './DataGridColumnsDialogButton';
import { ToolbarContainer, ToolbarLeftPanel, ToolbarRightPanel } from './ToolbarCore';

export type DataGridToolbarFilter = {
  id: string;
  label: string;
  value: string[];
  options: FilterOption[];
  onApply: (values: string[]) => void;
  testId: string;
  emptyLabel: string;
};

type DataGridFiltersToolbarProps = {
  searchLabel: string;
  searchPlaceholder: string;
  clearSearchLabel: string;
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  searchInputTestId?: string;
  filters?: DataGridToolbarFilter[];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
  rightActions?: ReactNode;
};

function buildDraftMap(filters: DataGridToolbarFilter[]) {
  return Object.fromEntries(filters.map((filter) => [filter.id, filter.value]));
}

export function DataGridFiltersToolbar({
  searchLabel,
  searchPlaceholder,
  clearSearchLabel,
  search,
  onSearchChange,
  onClearSearch,
  searchInputTestId,
  filters = [],
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
  rightActions,
}: DataGridFiltersToolbarProps) {
  const normalizedFilters = useMemo(() => filters, [filters]);
  const [draftValues, setDraftValues] = useState<Record<string, string[]>>(() => buildDraftMap(normalizedFilters));

  useEffect(() => {
    setDraftValues(buildDraftMap(normalizedFilters));
  }, [normalizedFilters]);

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
            inputProps={searchInputTestId ? { 'data-testid': searchInputTestId } : undefined}
          />

          {normalizedFilters.map((filter) => (
            <FilterSelect
              key={filter.id}
              label={filter.label}
              value={draftValues[filter.id] ?? filter.value}
              options={filter.options}
              onChange={(values) => {
                setDraftValues((prev) => ({
                  ...prev,
                  [filter.id]: values,
                }));
              }}
              onApply={(values) => {
                setDraftValues((prev) => ({
                  ...prev,
                  [filter.id]: values,
                }));
                filter.onApply(values);
              }}
              emptyLabel={filter.emptyLabel}
              testId={filter.testId}
            />
          ))}
        </ToolbarLeftPanel>

        <ToolbarRightPanel>
          {rightActions}
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
