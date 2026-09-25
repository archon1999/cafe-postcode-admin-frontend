import Card from '@mui/material/Card';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridLocaleText,
  GridPaginationModel,
  GridRowIdGetter,
  GridSortModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { createContext, useContext, type ReactNode } from 'react';

import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';

const ReportToolbarContext = createContext<ReactNode>(null);

function ReportToolbarSlot() {
  return useContext(ReportToolbarContext);
}

type EmptyStateMessages = {
  noData: {
    title: string;
    description: string;
  };
  noResults: {
    title: string;
    description: string;
  };
};

type ReportTableCardProps<RowModel extends GridValidRowModel> = {
  rows: RowModel[];
  columns: GridColDef<RowModel>[];
  rowCount: number;
  loading: boolean;
  onRefresh: () => void;
  refreshing: boolean;
  localeText: Partial<GridLocaleText>;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  columnVisibilityModel: GridColumnVisibilityModel;
  onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
  getRowId?: GridRowIdGetter<RowModel>;
  autoRowHeight?: boolean;
  navigation?: ReactNode;
  toolbar: ReactNode;
  hasActiveFilters: boolean;
  emptyState: EmptyStateMessages;
};

export function ReportTableCard<RowModel extends GridValidRowModel>({
  rows,
  columns,
  rowCount,
  loading,
  onRefresh,
  refreshing,
  localeText,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  getRowId,
  autoRowHeight = false,
  navigation,
  toolbar,
  hasActiveFilters,
  emptyState,
}: ReportTableCardProps<RowModel>) {
  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 540,
        overflow: 'hidden',
      }}>
      {navigation}
      <ReportToolbarContext.Provider value={toolbar}>
        <DataGrid
          rows={rows}
          columns={columns}
          getRowHeight={autoRowHeight ? () => 'auto' : undefined}
          getEstimatedRowHeight={autoRowHeight ? () => 72 : undefined}
          rowCount={rowCount}
          loading={loading}
          onRefresh={onRefresh}
          refreshing={refreshing}
          localeText={localeText}
          paginationMode="server"
          sortingMode="server"
          paginationModel={paginationModel}
          onPaginationModelChange={onPaginationModelChange}
          sortModel={sortModel}
          onSortModelChange={onSortModelChange}
          getRowId={getRowId}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={onColumnVisibilityModelChange}
          disableColumnMenu
          slots={{
            noRowsOverlay: () => (
              <DataGridEmptyState
                hasActiveFilters={hasActiveFilters}
                noData={emptyState.noData}
                noResults={emptyState.noResults}
              />
            ),
            noResultsOverlay: () => (
              <DataGridEmptyState forceFiltered noData={emptyState.noData} noResults={emptyState.noResults} />
            ),
            toolbar: ReportToolbarSlot,
          }}
          sx={{
            flex: 1,
            minHeight: 0,
            border: 'none',
            [`& .${gridClasses.cell}`]: { display: 'flex', alignItems: 'center' },
          }}
        />
      </ReportToolbarContext.Provider>
    </Card>
  );
}
