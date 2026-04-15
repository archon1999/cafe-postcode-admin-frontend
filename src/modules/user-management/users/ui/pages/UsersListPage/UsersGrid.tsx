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
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminUser } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { useRouter } from 'shared/hooks/router';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useArchiveEmployeeMutation,
  useArchiveUserMutation,
  useEmployeeUpdateAccess,
  useGetEmployeesQuery,
  useGetRolesQuery,
  useGetUsersQuery,
  useToggleEmployeeActiveMutation,
  useToggleUserActiveMutation,
} from '../../../application';
import type { UserManagementSurface } from '../../../domain';

import { ChangeEmployeePinDialog } from './ChangeEmployeePinDialog';
import { getUsersGridActionKeys } from './users-grid.actions';
import { DEFAULT_USERS_GRID_FILTERS, type UsersGridFilters, UsersGridToolbar } from './UsersGridToolbar';

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
  const [filters, setFilters] = useState<UsersGridFilters>(DEFAULT_USERS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [pinChangeEmployeeId, setPinChangeEmployeeId] = useState<string | null>(null);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const canEditEmployee = useEmployeeUpdateAccess();

  const rolesQuery = useGetRolesQuery(surface);
  const queryParams = {
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    roleIdIn: filters.roleIds.length ? filters.roleIds.join(',') : undefined,
    employmentStatusIn: filters.statuses.length ? filters.statuses.join(',') : undefined,
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
  const hasActiveFilters = Boolean(filters.search || filters.roleIds.length || filters.statuses.length);

  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const handleFiltersChange = useCallback((next: UsersGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const viewHref = useCallback(
    (id: string) => (surface === 'employee' ? RouterPathHelper.employeeView(id) : RouterPathHelper.userView(id)),
    [surface],
  );
  const editHref = useCallback(
    (id: string) => (surface === 'employee' ? RouterPathHelper.employeeEdit(id) : RouterPathHelper.userEdit(id)),
    [surface],
  );

  const columns = useMemo<GridColDef<AdminUser>[]>(() => {
    const nextColumns: GridColDef<AdminUser>[] = [];

    if (surface !== 'employee') {
      nextColumns.push(
        withDetailLink<AdminUser>(
          {
            field: 'username',
            headerName: t('fields.username'),
            minWidth: 180,
            flex: 0.95,
          },
          (row) => viewHref(row.id),
        ),
      );
    }

    if (surface === 'employee') {
      nextColumns.push(
        withDetailLink<AdminUser>(
          {
            field: 'fullName',
            headerName: t('fields.fullName'),
            minWidth: 220,
            flex: 1.2,
          },
          (row) => viewHref(row.id),
        ),
      );
    } else {
      nextColumns.push({
        field: 'fullName',
        headerName: t('fields.fullName'),
        minWidth: 220,
        flex: 1.2,
      });
    }

    nextColumns.push(
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
          const actionKeys = getUsersGridActionKeys({
            surface,
            canEditEmployee,
            employmentStatus: params.row.employmentStatus,
          });

          return actionKeys.map((actionKey) => {
            if (actionKey === 'view') {
              return (
                <CustomGridActionsCellItem
                  actionKind="view"
                  key="view"
                  label={tCommon('labels.details')}
                  icon={<Iconify icon="solar:eye-bold" />}
                  href={viewHref(params.row.id)}
                />
              );
            }

            if (actionKey === 'edit') {
              return (
                <CustomGridActionsCellItem
                  actionKind="edit"
                  key="edit"
                  label={t('actions.edit')}
                  icon={<Iconify icon="solar:pen-bold" />}
                  href={editHref(params.row.id)}
                />
              );
            }

            if (actionKey === 'change-pin') {
              return (
                <CustomGridActionsCellItem
                  actionKind="edit"
                  key="change-pin"
                  label={t('actions.changePin')}
                  icon={<Iconify icon="solar:key-bold" />}
                  onClick={() => setPinChangeEmployeeId(params.row.id)}
                />
              );
            }

            return (
              <CustomGridActionsCellItem
                actionKind="delete"
                key="archive"
                label={t('actions.archive')}
                icon={<Iconify icon="solar:archive-bold" />}
                onClick={() => archiveMutation.mutate(params.row)}
              />
            );
          });
        },
      },
    );

    return nextColumns;
  }, [archiveMutation, canEditEmployee, editHref, surface, t, tCommon, toggleStatusMutation, viewHref]);

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
              roles={rolesQuery.data ?? []}
              value={filters}
              onChange={handleFiltersChange}
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
              onSaveColumns={setColumnVisibilityModel}
            />
          ),
        }}
      />

      <ChangeEmployeePinDialog
        open={Boolean(pinChangeEmployeeId)}
        employeeId={pinChangeEmployeeId}
        onClose={() => setPinChangeEmployeeId(null)}
      />
    </Card>
  );
}
