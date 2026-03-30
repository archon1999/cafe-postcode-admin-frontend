import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
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
import { RouterPathHelper } from 'app/routes';
import type { AdminUser } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import { type FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useArchiveUserMutation,
  useGetRolesQuery,
  useGetUsersQuery,
  useToggleUserActiveMutation,
} from '../../../application';

import { UsersGridToolbar } from './UsersGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = {
  type: 'include',
  ids: new Set(),
};

function getEmploymentStatusChipColor(status?: AdminUser['employmentStatus']) {
  if (status === 'inactive') return 'warning';
  if (status === 'archived') return 'default';
  return 'success';
}

export function UsersGrid() {
  const { t, currentLang } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const router = useRouter();
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const rolesQuery = useGetRolesQuery();
  const usersQuery = useGetUsersQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    roleIdIn: roleIds.length ? roleIds.join(',') : undefined,
    employmentStatusIn: statuses.length ? statuses.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const toggleUserStatusMutation = useToggleUserActiveMutation();
  const archiveUserMutation = useArchiveUserMutation();
  const hasActiveFilters = Boolean(search || roleIds.length || statuses.length);

  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const roleOptions = useMemo<FilterOption[]>(
    () =>
      (rolesQuery.data ?? []).map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [rolesQuery.data, t],
  );

  const columns = useMemo<GridColDef<AdminUser>[]>(
    () => [
      withDetailLink(
        {
          field: 'username',
          headerName: t('fields.username'),
          minWidth: 180,
          flex: 0.95,
        },
        (row) => RouterPathHelper.userView(row.id),
      ),
      {
        field: 'fullName',
        headerName: t('fields.fullName'),
        minWidth: 220,
        flex: 1.2,
      },
      {
        field: 'role',
        headerName: t('fields.role'),
        minWidth: 190,
        flex: 1,
        valueGetter: (_, row) => row.role?.name ?? t('labels.withoutRole'),
      },
      {
        field: 'employmentStatus',
        headerName: t('fields.status'),
        minWidth: 150,
        sortable: false,
        renderCell: ({ row }) => {
          const statusValue = row.employmentStatus ?? (row.isActive ? 'active' : 'inactive');
          return (
            <Chip
              size="small"
              label={t(`status.${statusValue}`)}
              color={getEmploymentStatusChipColor(statusValue)}
              variant="soft"
            />
          );
        },
      },
      {
        field: 'isActive',
        headerName: t('fields.statusToggle'),
        minWidth: 136,
        sortable: false,
        renderCell: ({ row }) => (
          <Switch
            checked={row.isActive}
            disabled={row.employmentStatus === 'archived'}
            onClick={(event) => event.stopPropagation()}
            onChange={(_, checked) => toggleUserStatusMutation.mutate({ user: row, isActive: checked })}
          />
        ),
      },
      {
        field: 'phone',
        headerName: t('fields.phone'),
        minWidth: 160,
        flex: 0.9,
        valueGetter: (_, row) => row.phone || '-',
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        flex: 0,
        getActions: (params) => {
          const actions = [
            <CustomGridActionsCellItem
              actionKind="view"
              key="view"
              label={tCommon('labels.details')}
              icon={<Iconify icon="solar:eye-bold" />}
              href={RouterPathHelper.userView(params.row.id)}
            />,
            <CustomGridActionsCellItem
              actionKind="edit"
              key="edit"
              label={t('actions.edit')}
              icon={<Iconify icon="solar:pen-bold" />}
              href={RouterPathHelper.userEdit(params.row.id)}
            />,
          ];

          if (params.row.employmentStatus !== 'archived') {
            actions.push(
              <CustomGridActionsCellItem
                actionKind="delete"
                key="archive"
                label={t('actions.archive')}
                icon={<Iconify icon="solar:archive-bold" />}
                onClick={() => archiveUserMutation.mutate(params.row)}
              />,
            );
          }

          return actions;
        },
      },
    ],
    [archiveUserMutation, t, tCommon, toggleUserStatusMutation],
  );

  const emptyStateMessages = useMemo(
    () => ({
      noData: {
        title: t('empty.users.noData.title'),
        description: t('empty.users.noData.description'),
      },
      noResults: {
        title: t('empty.users.noResults.title'),
        description: t('empty.users.noResults.description'),
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

  const handleRoleIdsApply = (values: string[]) => {
    setRoleIds(values);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleStatusesApply = (values: string[]) => {
    setStatuses(values);
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
        rows={usersQuery.data?.data ?? []}
        columns={columns}
        rowCount={usersQuery.data?.total ?? 0}
        loading={usersQuery.isLoading}
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
        onRowClick={(params) => router.push(RouterPathHelper.userView(params.row.id))}
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
            <UsersGridToolbar
              search={search}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              roleIds={roleIds}
              onRoleIdsChange={setRoleIds}
              onRoleIdsApply={handleRoleIdsApply}
              statuses={statuses}
              onStatusesChange={setStatuses}
              onStatusesApply={handleStatusesApply}
              roleOptions={roleOptions}
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
          [`& .${gridClasses.actionsCell}`]: {
            gap: 0.25,
          },
          '& .MuiDataGrid-toolbarContainer': {
            px: 2.5,
            py: 2,
          },
          '& .MuiDataGrid-columnHeaders': {
            borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
          },
        }}
      />
    </Card>
  );
}
