import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridLocaleText,
  GridPaginationModel,
  GridRowIdGetter,
  GridSortModel,
  GridValidRowModel,
} from '@mui/x-data-grid';
import { GridFooter, gridClasses } from '@mui/x-data-grid';
import { createContext, useContext, type ReactNode } from 'react';

import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';

import type { ReportFooterMetric } from './reportTableTotals';

const ReportToolbarContext = createContext<ReactNode>(null);
const ReportFooterContext = createContext<ReportFooterMetric[]>([]);

function ReportToolbarSlot() {
  return useContext(ReportToolbarContext);
}

function ReportFooterSlot() {
  const metrics = useContext(ReportFooterContext);
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, borderTop: 1, borderColor: 'divider' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, md: 2 },
          flex: 1,
          minWidth: 0,
          px: { xs: 1, md: 2 },
          overflowX: 'auto',
        }}>
        {metrics.map((metric) => (
          <Box
            key={metric.label}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'flex-start', md: 'baseline' },
              gap: { xs: 0, md: 0.5 },
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.65rem', md: undefined }, lineHeight: 1.1 }}>
              {metric.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, fontSize: { xs: '0.75rem', md: undefined }, lineHeight: 1.2 }}>
              {metric.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <GridFooter sx={{ flexShrink: 0, borderTop: 0, minHeight: 52, justifyContent: 'flex-end' }} />
    </Box>
  );
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
  footerMetrics: ReportFooterMetric[];
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
  footerMetrics,
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
        <ReportFooterContext.Provider value={footerMetrics}>
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
            showToolbar
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
              footer: ReportFooterSlot,
            }}
            sx={{
              flex: 1,
              minHeight: 0,
              border: 'none',
              [`& .${gridClasses.cell}`]: { display: 'flex', alignItems: 'center' },
            }}
          />
        </ReportFooterContext.Provider>
      </ReportToolbarContext.Provider>
    </Card>
  );
}
