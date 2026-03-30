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

type RolesGridToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  types: string[];
  onTypesChange: (values: string[]) => void;
  onTypesApply: (values: string[]) => void;
  permissionCodes: string[];
  onPermissionCodesChange: (values: string[]) => void;
  onPermissionCodesApply: (values: string[]) => void;
  permissionOptions: FilterOption[];
  typeOptions: FilterOption[];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function RolesGridToolbar({
  search,
  onSearchChange,
  onClearSearch,
  types,
  onTypesChange,
  onTypesApply,
  permissionCodes,
  onPermissionCodesChange,
  onPermissionCodesApply,
  permissionOptions,
  typeOptions,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: RolesGridToolbarProps) {
  const { t } = useTranslate('users');

  return (
    <Toolbar>
      <ToolbarContainer>
        <ToolbarLeftPanel>
          <TableSearchInput
            size="small"
            label={t('filters.search')}
            placeholder={t('filters.searchRolesPlaceholder')}
            value={search}
            onChange={onSearchChange}
            onClear={onClearSearch}
            fullWidth
            clearAriaLabel={t('filters.clearSearch')}
            sx={{ minWidth: { xs: 1, md: 260 }, maxWidth: { md: 320 } }}
          />

          <FilterSelect
            label={t('filters.type')}
            value={types}
            options={typeOptions}
            onChange={onTypesChange}
            onApply={onTypesApply}
            emptyLabel={t('filters.all')}
            testId="roles-list-filter-type"
          />

          <FilterSelect
            label={t('filters.permission')}
            value={permissionCodes}
            options={permissionOptions}
            onChange={onPermissionCodesChange}
            onApply={onPermissionCodesApply}
            emptyLabel={t('filters.all')}
            testId="roles-list-filter-permission"
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
