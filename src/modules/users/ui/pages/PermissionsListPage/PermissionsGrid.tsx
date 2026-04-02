import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminPermission } from 'shared/api/admin-types';
import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { Label } from 'shared/ui/Label';
import {
  getAdminPermissionAction,
  getAdminPermissionActionLabel,
  getAdminPermissionScope,
  getAdminPermissionScopeLabel,
} from 'shared/utils/admin-permission';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useGetPermissionsListQuery, useGetPermissionsQuery } from '../../../application';
import { USER_PERMISSION_ACTION_BADGE_CONFIG, USER_PERMISSION_SCOPE_BADGE_CONFIG } from '../../../domain';

import { PermissionsGridToolbar } from './PermissionsGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = {
  type: 'include',
  ids: new Set(),
};

export const PermissionsGrid = () => {
  const { t, currentLang } = useTranslate('users');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [scopes, setScopes] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const permissionsQuery = useGetPermissionsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    scopeIn: scopes.length ? scopes.join(',') : undefined,
    actionIn: actions.length ? actions.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const permissionsOptionsQuery = useGetPermissionsQuery();

  const scopeOptions = useMemo<FilterOption[]>(() => {
    const scopesSet = new Set(
      (permissionsOptionsQuery.data ?? []).map(
        (permission) => permission.scope ?? getAdminPermissionScope(permission.code),
      ),
    );

    return Array.from(scopesSet)
      .filter(Boolean)
      .map((scope) => ({
        value: scope,
        label: getAdminPermissionScopeLabel(scope, t),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [permissionsOptionsQuery.data, t]);

  const actionOptions = useMemo<FilterOption[]>(() => {
    const actionsSet = new Set(
      (permissionsOptionsQuery.data ?? []).map((permission) => getAdminPermissionAction(permission.code)),
    );

    return Array.from(actionsSet)
      .filter(Boolean)
      .map((action) => ({
        value: action,
        label: getAdminPermissionActionLabel(action, t),
      }))
      .sort((left, right) => left.label.localeCompare(right.label));
  }, [permissionsOptionsQuery.data, t]);
  const hasActiveFilters = Boolean(search || scopes.length || actions.length);

  const columns = useMemo<GridColDef<AdminPermission>[]>(
    () => [
      {
        field: 'description',
        headerName: t('fields.description'),
        minWidth: 320,
        flex: 1.2,
      },
      {
        field: 'code',
        headerName: t('fields.code'),
        minWidth: 220,
        flex: 0.9,
      },
      {
        field: 'scope',
        headerName: t('fields.scope'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_value, row) => getAdminPermissionScopeLabel(row.scope ?? getAdminPermissionScope(row.code), t),
        renderCell: (params) => {
          const scope = params.row.scope ?? getAdminPermissionScope(params.row.code);
          const badge = USER_PERMISSION_SCOPE_BADGE_CONFIG[scope as keyof typeof USER_PERMISSION_SCOPE_BADGE_CONFIG] ?? {
            color: 'default',
            icon: 'solar:key-bold-duotone',
          };

          return (
            <Label
              color={badge.color}
              startIcon={<Iconify icon={badge.icon} width={14} />}
              sx={{ textTransform: 'none' }}>
              {getAdminPermissionScopeLabel(scope, t)}
            </Label>
          );
        },
      },
      {
        field: 'action',
        headerName: t('fields.action'),
        minWidth: 140,
        flex: 0.5,
        valueGetter: (_value, row) => getAdminPermissionActionLabel(getAdminPermissionAction(row.code), t),
        renderCell: (params) => {
          const action = getAdminPermissionAction(params.row.code);
          const badge =
            USER_PERMISSION_ACTION_BADGE_CONFIG[action as keyof typeof USER_PERMISSION_ACTION_BADGE_CONFIG] ?? {
              color: 'default',
              icon: 'solar:key-bold-duotone',
            };

          return (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
              <Iconify icon={badge.icon} width={18} sx={{ color: `${badge.color}.main` }} />
              <Typography variant="body2">{getAdminPermissionActionLabel(action, t)}</Typography>
            </Box>
          );
        },
      },
    ],
    [t],
  );

  const emptyStateMessages = useMemo(
    () => ({
      noData: {
        title: t('empty.permissions.noData.title'),
        description: t('empty.permissions.noData.description'),
      },
      noResults: {
        title: t('empty.permissions.noResults.title'),
        description: t('empty.permissions.noResults.description'),
      },
    }),
    [t],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleClearSearch = () => {
    setSearch('');
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleScopesApply = (values: string[]) => {
    setScopes(values);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleActionsApply = (values: string[]) => {
    setActions(values);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
      }}>
      <DataGrid
        checkboxSelection
        rows={permissionsQuery.data?.data ?? []}
        columns={columns}
        rowCount={permissionsQuery.data?.total ?? 0}
        loading={permissionsQuery.isLoading}
        localeText={localeText}
        rowHeight={64}
        pageSizeOptions={[10, 20, 50]}
        paginationMode="server"
        sortingMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={setSelectedRows}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        slots={{
          noRowsOverlay: () => (
            <DataGridEmptyState
              hasActiveFilters={hasActiveFilters}
              noData={emptyStateMessages.noData}
              noResults={emptyStateMessages.noResults}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={emptyStateMessages.noData}
              noResults={emptyStateMessages.noResults}
            />
          ),
          toolbar: () => (
            <PermissionsGridToolbar
              search={search}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              scopes={scopes}
              onScopesApply={handleScopesApply}
              actions={actions}
              onActionsApply={handleActionsApply}
              scopeOptions={scopeOptions}
              actionOptions={actionOptions}
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
              onSaveColumns={setColumnVisibilityModel}
            />
          ),
        }}
        sx={{
          border: 'none',
          [`& .${gridClasses.cell}`]: {
            display: 'flex',
            alignItems: 'center',
          },
          '& .MuiDataGrid-toolbarContainer': {
            px: 2.5,
            py: 2,
          },
        }}
      />
    </Card>
  );
}
