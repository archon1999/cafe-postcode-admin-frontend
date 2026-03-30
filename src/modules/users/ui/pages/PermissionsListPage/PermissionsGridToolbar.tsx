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
  scopes: string[];
  onScopesChange: (values: string[]) => void;
  onScopesApply: (values: string[]) => void;
  actions: string[];
  onActionsChange: (values: string[]) => void;
  onActionsApply: (values: string[]) => void;
  scopeOptions: FilterOption[];
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
  scopes,
  onScopesChange,
  onScopesApply,
  actions,
  onActionsChange,
  onActionsApply,
  scopeOptions,
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
            label={t('filters.scope')}
            value={scopes}
            options={scopeOptions}
            onChange={onScopesChange}
            onApply={onScopesApply}
            emptyLabel={t('filters.all')}
            testId="permissions-list-filter-scope"
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
