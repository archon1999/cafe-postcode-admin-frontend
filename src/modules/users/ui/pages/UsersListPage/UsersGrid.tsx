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
  useArchiveEmployeeMutation,
  useArchiveUserMutation,
  useGetEmployeesQuery,
  useGetRolesQuery,
  useGetUsersQuery,
  useToggleEmployeeActiveMutation,
  useToggleUserActiveMutation,
} from '../../../application';
import type { UserManagementSurface } from '../../../domain';

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

type UsersGridProps = {
  surface?: UserManagementSurface;
};

export function UsersGrid({ surface = 'user' }: UsersGridProps) {
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

  const rolesQuery = useGetRolesQuery(surface);
  const queryParams = {
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    roleIdIn: roleIds.length ? roleIds.join(',') : undefined,
    employmentStatusIn: statuses.length ? statuses.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  };
  const usersListQuery = useGetUsersQuery(queryParams, { enabled: surface === 'user' });
  const employeesListQuery = useGetEmployeesQuery(queryParams, { enabled: surface === 'employee' });
  const usersQuery = surface === 'employee' ? employeesListQuery : usersListQuery;
  const toggleEmployeeStatusMutation = useToggleEmployeeActiveMutation();
  const toggleUserStatusMutation = useToggleUserActiveMutation();
  const toggleStatusMutation = surface === 'employee' ? toggleEmployeeStatusMutation : toggleUserStatusMutation;
  const archiveEmployeeMutation = useArchiveEmployeeMutation();
  const archiveUserMutation = useArchiveUserMutation();
  const archiveMutation = surface === 'employee' ? archiveEmployeeMutation : archiveUserMutation;
  const hasActiveFilters = Boolean(search || roleIds.length || statuses.length);

  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const roleOptions = useMemo<FilterOption[]>(
    () =>
      (rolesQuery.data ?? []).map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [rolesQuery.data],
  );

  const viewHref = (id: string) =>
    surface === 'employee' ? RouterPathHelper.employeeView(id) : RouterPathHelper.userView(id);
  const editHref = (id: string) =>
    surface === 'employee' ? RouterPathHelper.employeeEdit(id) : RouterPathHelper.userEdit(id);

  const columns = useMemo<GridColDef<AdminUser>[]>(
    () => [
      ...(surface === 'employee'
        ? []
        : [
            withDetailLink(
              {
                field: 'username',
                headerName: t('fields.username'),
                minWidth: 180,
                flex: 0.95,
              },
              (row) => viewHref(row.id),
            ),
          ]),
      ...(surface === 'employee'
        ? [
            withDetailLink(
              {
                field: 'fullName',
                headerName: t('fields.fullName'),
                minWidth: 220,
                flex: 1.2,
              },
              (row) => viewHref(row.id),
            ),
          ]
        : [
            {
              field: 'fullName',
              headerName: t('fields.fullName'),
              minWidth: 220,
              flex: 1.2,
            },
          ]),
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
            onChange={(_, checked) => toggleStatusMutation.mutate({ user: row, isActive: checked })}
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
              href={viewHref(params.row.id)}
            />,
            <CustomGridActionsCellItem
              actionKind="edit"
              key="edit"
              label={t('actions.edit')}
              icon={<Iconify icon="solar:pen-bold" />}
              href={editHref(params.row.id)}
            />,
          ];

          if (params.row.employmentStatus !== 'archived') {
            actions.push(
              <CustomGridActionsCellItem
                actionKind="delete"
                key="archive"
                label={t('actions.archive')}
                icon={<Iconify icon="solar:archive-bold" />}
                onClick={() => archiveMutation.mutate(params.row)}
              />,
            );
          }

          return actions;
        },
      },
    ],
    [archiveMutation, editHref, surface, t, tCommon, toggleStatusMutation, viewHref],
  );

  const emptyStateMessages = useMemo(
    () => ({
      noData: {
        title: t(surface === 'employee' ? 'empty.employees.noData.title' : 'empty.users.noData.title'),
        description: t(
          surface === 'employee' ? 'empty.employees.noData.description' : 'empty.users.noData.description',
        ),
      },
      noResults: {
        title: t(surface === 'employee' ? 'empty.employees.noResults.title' : 'empty.users.noResults.title'),
        description: t(
          surface === 'employee' ? 'empty.employees.noResults.description' : 'empty.users.noResults.description',
        ),
      },
    }),
    [surface, t],
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
        onRowClick={(params) => router.push(viewHref(params.row.id))}
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
              surface={surface}
              search={search}
              onSearchChange={handleSearchChange}
              onClearSearch={handleClearSearch}
              roleIds={roleIds}
              onRoleIdsApply={handleRoleIdsApply}
              statuses={statuses}
              onStatusesApply={handleStatusesApply}
              roleOptions={roleOptions}
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
              onSaveColumns={setColumnVisibilityModel}
            />
          ),
        }}
      />
    </Card>
  );
}
