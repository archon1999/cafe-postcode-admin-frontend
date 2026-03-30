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
import type { ReactNode } from 'react';

import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';

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
  localeText: Partial<GridLocaleText>;
  paginationModel: GridPaginationModel;
  onPaginationModelChange: (model: GridPaginationModel) => void;
  sortModel: GridSortModel;
  onSortModelChange: (model: GridSortModel) => void;
  columnVisibilityModel: GridColumnVisibilityModel;
  onColumnVisibilityModelChange: (model: GridColumnVisibilityModel) => void;
  getRowId?: GridRowIdGetter<RowModel>;
  toolbar: ReactNode;
  hasActiveFilters: boolean;
  emptyState: EmptyStateMessages;
};

export function ReportTableCard<RowModel extends GridValidRowModel>({
  rows,
  columns,
  rowCount,
  loading,
  localeText,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  columnVisibilityModel,
  onColumnVisibilityModelChange,
  getRowId,
  toolbar,
  hasActiveFilters,
  emptyState,
}: ReportTableCardProps<RowModel>) {
  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', borderRadius: 3 }}>
      <DataGrid
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        loading={loading}
        localeText={localeText}
        rowHeight={64}
        pageSizeOptions={[10, 20, 50]}
        paginationMode="server"
        sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        getRowId={getRowId}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={onColumnVisibilityModelChange}
        disableRowSelectionOnClick
        disableColumnFilter
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
          toolbar: () => toolbar,
        }}
        sx={{
          flex: 1,
          minHeight: 0,
          border: 'none',
          [`& .${gridClasses.cell}`]: { display: 'flex', alignItems: 'center' },
          '& .MuiDataGrid-toolbarContainer': { px: 2.5, py: 2 },
          '& .MuiDataGrid-columnHeaders': {
            borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        }}
      />
    </Card>
  );
}
