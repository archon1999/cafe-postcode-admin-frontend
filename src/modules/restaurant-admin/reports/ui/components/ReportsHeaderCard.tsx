import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';

import type { ReportDefinition } from '../../domain';

import { ReportsToolbar, type ReportsToolbarFilter } from './ReportsToolbar';
import type { ReportsDatePreset } from './reportsDateRange';

type ReportsHeaderCardProps = {
  report: ReportDefinition;
  title: string;
  activePreset: ReportsDatePreset;
  startDate: string;
  endDate: string;
  onPresetChange: (value: Exclude<ReportsDatePreset, 'custom'>) => void;
  onRangeChange: (startDate: string, endDate: string) => void;
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
  activePreset,
  startDate,
  endDate,
  onPresetChange,
  onRangeChange,
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
  const { t } = useTranslate('reports');
  const presets = [
    { value: 'today', label: t('actions.today', { defaultValue: 'Today' }) },
    { value: 'month', label: t('actions.monthly', { defaultValue: 'Monthly' }) },
    { value: 'year', label: t('actions.yearly', { defaultValue: 'Yearly' }) },
  ] as const;

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

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            flexWrap: 'nowrap',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}>
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant={activePreset === preset.value ? 'contained' : 'outlined'}
              color={activePreset === preset.value ? 'black' : 'inherit'}
              onClick={() => onPresetChange(preset.value)}
              sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
              {preset.label}
            </Button>
          ))}
        </Box>
      </Box>

      <Box sx={{ mt: 1, pt: 3, borderTop: (theme) => `1px solid ${theme.vars.palette.divider}` }}>
        <ReportsToolbar
          activePreset={activePreset}
          startDate={startDate}
          endDate={endDate}
          onRangeChange={onRangeChange}
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
