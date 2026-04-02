import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
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
import { RouterPathHelper } from 'app/routes';
import { PermissionPreview } from 'modules/user-management/permissions/ui/components/PermissionPreview/PermissionPreview';
import type { AdminRole } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteRoleMutation, useGetRolesListQuery } from '../../../application';

import { DEFAULT_ROLES_GRID_FILTERS, type RolesGridFilters, RolesGridToolbar } from './RolesGridToolbar';

export const RolesGrid = () => {
  const { t, currentLang } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const deleteRoleMutation = useDeleteRoleMutation();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<RolesGridFilters>(DEFAULT_ROLES_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [roleToDelete, setRoleToDelete] = useState<AdminRole | null>(null);

  const rolesQuery = useGetRolesListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    typeIn: filters.types.length ? filters.types.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const hasActiveFilters = Boolean(filters.search || filters.types.length);
  const handleFiltersChange = useCallback((next: RolesGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<AdminRole>[]>(
    () => [
      {
        field: 'name',
        headerName: t('fields.role'),
        minWidth: 220,
        flex: 1,
        valueGetter: (_value, row) => row.name,
      },
      {
        field: 'isSystem',
        headerName: t('fields.type'),
        minWidth: 150,
        flex: 0.6,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isSystem ? t('labels.system') : t('labels.custom')}
            color={row.isSystem ? 'info' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        field: 'permissionsCount',
        headerName: t('fields.permissionsCount'),
        minWidth: 160,
        flex: 0.5,
        sortable: false,
        valueGetter: (_value, row) => row.permissions.length,
      },
      {
        field: 'permissions',
        headerName: t('fields.permissions'),
        minWidth: 420,
        flex: 1.5,
        sortable: false,
        renderCell: ({ row }) => <PermissionPreview permissions={row.permissions} t={t} />,
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        getActions: (params) => {
          const actions = [
            <CustomGridActionsCellItem
              actionKind="edit"
              key="edit"
              label={t('actions.edit')}
              icon={<Iconify icon="solar:pen-bold" />}
              href={RouterPathHelper.roleEdit(params.row.id)}
            />,
          ];

          if (!params.row.isSystem) {
            actions.push(
              <CustomGridActionsCellItem
                actionKind="delete"
                key="delete"
                label={t('actions.delete', { defaultValue: "O'chirish" })}
                icon={<Iconify icon="solar:trash-bin-trash-bold" />}
                onClick={() => setRoleToDelete(params.row)}
              />,
            );
          }

          return actions;
        },
      },
    ],
    [t, tCommon],
  );

  const emptyStateMessages = useMemo(
    () => ({
      noData: {
        title: t('empty.roles.noData.title'),
        description: t('empty.roles.noData.description'),
      },
      noResults: {
        title: t('empty.roles.noResults.title'),
        description: t('empty.roles.noResults.description'),
      },
    }),
    [t],
  );

  return (
    <>
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
          rows={rolesQuery.data?.data ?? []}
          columns={columns}
          rowCount={rolesQuery.data?.total ?? 0}
          loading={rolesQuery.isLoading}
          localeText={localeText}
          rowHeight={72}
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
              <RolesGridToolbar
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

      <ConfirmDialog
        open={Boolean(roleToDelete)}
        onClose={() => setRoleToDelete(null)}
        title={t('dialogs.deleteRole.title', { defaultValue: "Rolni o'chirish" })}
        content={t('dialogs.deleteRole.description', {
          defaultValue: `"{{name}}" roli o'chiriladi. Davom etilsinmi?`,
          name: roleToDelete?.name ?? '',
        })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteRoleMutation.isPending}
            onClick={async () => {
              if (!roleToDelete) return;
              await deleteRoleMutation.mutateAsync(roleToDelete.id);
              setRoleToDelete(null);
            }}>
            {t('actions.delete', { defaultValue: "O'chirish" })}
          </Button>
        }
      />
    </>
  );
};
