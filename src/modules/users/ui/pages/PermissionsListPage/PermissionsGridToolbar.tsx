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

type PermissionsGridToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  categories: string[];
  onCategoriesChange: (values: string[]) => void;
  onCategoriesApply: (values: string[]) => void;
  actions: string[];
  onActionsChange: (values: string[]) => void;
  onActionsApply: (values: string[]) => void;
  categoryOptions: FilterOption[];
  actionOptions: FilterOption[];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function PermissionsGridToolbar({
  search,
  onSearchChange,
  onClearSearch,
  categories,
  onCategoriesChange,
  onCategoriesApply,
  actions,
  onActionsChange,
  onActionsApply,
  categoryOptions,
  actionOptions,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: PermissionsGridToolbarProps) {
  const { t } = useTranslate('users');

  return (
    <Toolbar>
      <ToolbarContainer>
        <ToolbarLeftPanel>
          <TableSearchInput
            size="small"
            label={t('filters.search')}
            placeholder={t('filters.searchPermissionsPlaceholder')}
            value={search}
            onChange={onSearchChange}
            onClear={onClearSearch}
            fullWidth
            clearAriaLabel={t('filters.clearSearch')}
            sx={{ minWidth: { xs: 1, md: 260 }, maxWidth: { md: 320 } }}
          />

          <FilterSelect
            label={t('filters.category')}
            value={categories}
            options={categoryOptions}
            onChange={onCategoriesChange}
            onApply={onCategoriesApply}
            emptyLabel={t('filters.all')}
            testId="permissions-list-filter-category"
          />

          <FilterSelect
            label={t('filters.action')}
            value={actions}
            options={actionOptions}
            onChange={onActionsChange}
            onApply={onActionsApply}
            emptyLabel={t('filters.all')}
            testId="permissions-list-filter-action"
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
