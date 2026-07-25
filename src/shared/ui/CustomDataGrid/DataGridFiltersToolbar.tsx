import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { Toolbar } from '@mui/x-data-grid';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { useTranslate } from 'app/providers/locales';
import { FilterSelect, type FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { TableSearchInput } from 'shared/ui/TableSearchInput';

import { DataGridColumnsDialogButton } from './DataGridColumnsDialogButton';
import { useDataGridRefresh } from './DataGridRefreshContext';
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
  const { t } = useTranslate('common');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { onRefresh, refreshing } = useDataGridRefresh();
  const normalizedFilters = useMemo(() => filters, [filters]);
  const [draftValues, setDraftValues] = useState<Record<string, string[]>>(() => buildDraftMap(normalizedFilters));
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = normalizedFilters.reduce((count, filter) => count + filter.value.length, 0);

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

          {!isMobile
            ? normalizedFilters.map((filter) => (
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
              ))
            : null}

          {isMobile && normalizedFilters.length ? (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:filter-bold-duotone" />}
              onClick={() => setFiltersOpen(true)}
              aria-label={t('actions.filters', { defaultValue: 'Filtrlar' })}>
              {t('actions.filters', { defaultValue: 'Filtrlar' })}
              {activeFilterCount ? ` (${activeFilterCount})` : ''}
            </Button>
          ) : null}
        </ToolbarLeftPanel>

        <ToolbarRightPanel>
          {rightActions}
          {onRefresh ? (
            <Tooltip title={t('actions.refresh')}>
              <span>
                <IconButton color="primary" disabled={refreshing} onClick={onRefresh}>
                  <Iconify icon="solar:refresh-bold" />
                </IconButton>
              </span>
            </Tooltip>
          ) : null}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <DataGridColumnsDialogButton
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={defaultColumnVisibilityModel}
              onSave={onSaveColumns}
              showLabel={!isMobile}
            />
          </Box>
        </ToolbarRightPanel>
      </ToolbarContainer>

      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        slotProps={{
          paper: {
            sx: { borderRadius: '20px 20px 0 0', px: 2.5, pt: 2, pb: 3, maxHeight: '80dvh' },
          },
        }}>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h6">{t('actions.filters', { defaultValue: 'Filtrlar' })}</Typography>
            <IconButton
              aria-label={t('actions.close', { defaultValue: 'Yopish' })}
              onClick={() => setFiltersOpen(false)}>
              <Iconify icon="mingcute:close-line" />
            </IconButton>
          </Stack>

          {normalizedFilters.map((filter) => (
            <FilterSelect
              key={filter.id}
              label={filter.label}
              value={draftValues[filter.id] ?? filter.value}
              options={filter.options}
              onChange={(values) => {
                setDraftValues((prev) => ({ ...prev, [filter.id]: values }));
              }}
              onApply={(values) => {
                setDraftValues((prev) => ({ ...prev, [filter.id]: values }));
                filter.onApply(values);
              }}
              emptyLabel={filter.emptyLabel}
              testId={`${filter.testId}-mobile`}
            />
          ))}

          <Button variant="contained" onClick={() => setFiltersOpen(false)}>
            {t('actions.showResults', { defaultValue: "Natijalarni ko'rish" })}
          </Button>
        </Stack>
      </Drawer>
    </Toolbar>
  );
}
