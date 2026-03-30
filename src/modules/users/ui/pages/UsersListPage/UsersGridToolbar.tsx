import Box from '@mui/material/Box';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
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

type UsersGridToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  roleCodes: string[];
  onRoleCodesChange: (values: string[]) => void;
  onRoleCodesApply: (values: string[]) => void;
  uiModes: string[];
  onUiModesChange: (values: string[]) => void;
  onUiModesApply: (values: string[]) => void;
  statuses: string[];
  onStatusesChange: (values: string[]) => void;
  onStatusesApply: (values: string[]) => void;
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
  roleOptions: FilterOption[];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

const UI_MODE_OPTIONS: FilterOption[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'pos', label: 'POS' },
];

const STATUS_OPTIONS: FilterOption[] = [
  { value: 'active', label: 'active' },
  { value: 'inactive', label: 'inactive' },
];

export function UsersGridToolbar({
  search,
  onSearchChange,
  onClearSearch,
  roleCodes,
  onRoleCodesChange,
  onRoleCodesApply,
  uiModes,
  onUiModesChange,
  onUiModesApply,
  statuses,
  onStatusesChange,
  onStatusesApply,
  showArchived,
  onShowArchivedChange,
  roleOptions,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: UsersGridToolbarProps) {
  const { t } = useTranslate('users');
  const [statusOptions, setStatusOptions] = useState(STATUS_OPTIONS);
  const [uiModeOptions, setUiModeOptions] = useState(UI_MODE_OPTIONS);

  useEffect(() => {
    setStatusOptions([
      { value: 'active', label: t('status.active') },
      { value: 'inactive', label: t('status.inactive') },
    ]);
    setUiModeOptions([
      { value: 'admin', label: t('uiMode.admin') },
      { value: 'pos', label: t('uiMode.pos') },
    ]);
  }, [t]);

  return (
    <Toolbar>
      <ToolbarContainer>
        <ToolbarLeftPanel>
          <TableSearchInput
            size="small"
            label={t('filters.search')}
            placeholder={t('filters.searchPlaceholder')}
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
            value={roleCodes}
            options={roleOptions}
            onChange={onRoleCodesChange}
            onApply={onRoleCodesApply}
            emptyLabel={t('filters.all')}
            testId="users-list-filter-role"
          />

          <FilterSelect
            label={t('filters.uiMode')}
            value={uiModes}
            options={uiModeOptions}
            onChange={onUiModesChange}
            onApply={onUiModesApply}
            emptyLabel={t('filters.all')}
            testId="users-list-filter-ui-mode"
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
            <FormControlLabel
              control={<Switch checked={showArchived} onChange={(_, checked) => onShowArchivedChange(checked)} />}
              label={t('filters.showArchived')}
              sx={{ mr: 0 }}
            />
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
