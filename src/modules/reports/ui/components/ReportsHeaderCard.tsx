import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import type { AdminReportPeriodType } from 'shared/api/admin-types';
import { Iconify } from 'shared/ui/Iconify';

import type { ReportDefinition } from '../../domain';

import { ReportsToolbar, type ReportsToolbarFilter } from './ReportsToolbar';

type ReportsHeaderCardProps = {
  report: ReportDefinition;
  title: string;
  lastUpdatedLabel: string;
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
  filters?: ReportsToolbarFilter[];
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

export function ReportsHeaderCard({
  title,
  lastUpdatedLabel,
  periodType,
  date,
  month,
  year,
  onPeriodTypeChange,
  onDateChange,
  onMonthChange,
  onYearChange,
  search,
  onSearchChange,
  onClearSearch,
  searchPlaceholder,
  filters,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
  onRefresh,
  refreshLoading,
  onExport,
  exportLoading,
  showSearch,
  showColumns,
}: ReportsHeaderCardProps) {
  return (
    <Card sx={{ flexShrink: 0, p: 3, borderRadius: 3, boxShadow: (theme) => theme.customShadows.z8 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          flexDirection: { xs: 'column', md: 'row' },
        }}>
        <Typography variant="h4">{title}</Typography>

        <Chip
          icon={<Iconify icon="solar:clock-circle-bold-duotone" width={18} />}
          label={lastUpdatedLabel}
          variant="soft"
          color="default"
        />
      </Box>

      <Box sx={{ mt: 1, pt: 3, borderTop: (theme) => `1px solid ${theme.vars.palette.divider}` }}>
        <ReportsToolbar
          periodType={periodType}
          date={date}
          month={month}
          year={year}
          onPeriodTypeChange={onPeriodTypeChange}
          onDateChange={onDateChange}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
          search={search}
          onSearchChange={showSearch ? onSearchChange : undefined}
          onClearSearch={showSearch ? onClearSearch : undefined}
          searchPlaceholder={searchPlaceholder}
          filters={filters}
          columns={columns}
          columnVisibilityModel={columnVisibilityModel}
          defaultColumnVisibilityModel={defaultColumnVisibilityModel}
          onSaveColumns={onSaveColumns}
          onRefresh={onRefresh}
          refreshLoading={refreshLoading}
          onExport={onExport}
          exportLoading={exportLoading}
          showSearch={showSearch}
          showColumns={showColumns}
        />
      </Box>
    </Card>
  );
}
