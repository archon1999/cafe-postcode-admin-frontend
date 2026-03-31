import Box from '@mui/material/Box';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { Toolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';

import { useTranslate } from 'app/providers/locales';
import {
  DataGridColumnsDialogButton,
  ToolbarContainer,
  ToolbarLeftPanel,
  ToolbarRightPanel,
} from 'shared/ui/CustomDataGrid';
import { FilterSelect, type FilterOption } from 'shared/ui/Filters';
import { TableSearchInput } from 'shared/ui/TableSearchInput';

import type { UserManagementSurface } from '../../../domain';

type UsersGridToolbarProps = {
  surface?: UserManagementSurface;
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  roleIds: string[];
  onRoleIdsChange: (values: string[]) => void;
  onRoleIdsApply: (values: string[]) => void;
  statuses: string[];
  onStatusesChange: (values: string[]) => void;
  onStatusesApply: (values: string[]) => void;
  roleOptions: FilterOption[];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
  { value: 'archived', label: 'archived' },
];

export function UsersGridToolbar({
  surface = 'user',
  search,
  onSearchChange,
  onClearSearch,
  roleIds,
  onRoleIdsChange,
  onRoleIdsApply,
  statuses,
  onStatusesChange,
  onStatusesApply,
  roleOptions,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: UsersGridToolbarProps) {
  const { t } = useTranslate('users');
  const [statusOptions, setStatusOptions] = useState(STATUS_OPTIONS);

  useEffect(() => {
    setStatusOptions([
      { value: 'active', label: t('status.active') },
      { value: 'inactive', label: t('status.inactive') },
      { value: 'archived', label: t('status.archived') },
    ]);
  }, [t]);

  return (
    <Toolbar>
      <ToolbarContainer>
        <ToolbarLeftPanel>
          <TableSearchInput
            size="small"
            label={t('filters.search')}
            placeholder={surface === 'employee' ? t('filters.employeeSearchPlaceholder') : t('filters.searchPlaceholder')}
            value={search}
            onChange={onSearchChange}
            onClear={onClearSearch}
            fullWidth
            clearAriaLabel={t('filters.clearSearch')}
            sx={{ minWidth: { xs: 1, md: 260 }, maxWidth: { md: 320 } }}
            inputProps={{ 'data-testid': 'users-list-search' }}
          />

          <FilterSelect
            label={t('filters.role')}
            value={roleIds}
            options={roleOptions}
            onChange={onRoleIdsChange}
            onApply={onRoleIdsApply}
            emptyLabel={t('filters.all')}
            testId="users-list-filter-role"
          />

          <FilterSelect
            label={t('filters.status')}
            value={statuses}
            options={statusOptions}
            onChange={onStatusesChange}
            onApply={onStatusesApply}
            emptyLabel={t('filters.all')}
            testId="users-list-filter-status"
          />
        </ToolbarLeftPanel>

        <ToolbarRightPanel>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
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
