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
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminPermission } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
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

import {
  DEFAULT_PERMISSIONS_GRID_FILTERS,
  type PermissionsGridFilters,
  PermissionsGridToolbar,
} from './PermissionsGridToolbar';

export const PermissionsGrid = () => {
  const { t, currentLang } = useTranslate('users');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<PermissionsGridFilters>(DEFAULT_PERMISSIONS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const permissionsQuery = useGetPermissionsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    scopeIn: filters.scopes.length ? filters.scopes.join(',') : undefined,
    actionIn: filters.actions.length ? filters.actions.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const permissionsOptionsQuery = useGetPermissionsQuery();
  const hasActiveFilters = Boolean(filters.search || filters.scopes.length || filters.actions.length);
  const handleFiltersChange = useCallback((next: PermissionsGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

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
          const badge = USER_PERMISSION_SCOPE_BADGE_CONFIG[
            scope as keyof typeof USER_PERMISSION_SCOPE_BADGE_CONFIG
          ] ?? {
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
          const badge = USER_PERMISSION_ACTION_BADGE_CONFIG[
            action as keyof typeof USER_PERMISSION_ACTION_BADGE_CONFIG
          ] ?? {
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
              permissions={permissionsOptionsQuery.data ?? []}
              value={filters}
              onChange={handleFiltersChange}
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
};
