import Card from '@mui/material/Card';
import type {
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { useRouter } from 'shared/hooks/router';
import { DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useEmployeeUpdateAccess,
  useGetEmployeesQuery,
  useGetRolesQuery,
  useGetUsersQuery,
} from '../../../application';
import type { UserManagementSurface } from '../../../domain';

import { ChangeEmployeePinDialog } from './ChangeEmployeePinDialog';
import { DEFAULT_USERS_GRID_FILTERS, type UsersGridFilters, UsersGridToolbar } from './UsersGridToolbar';
import { useUsersGridColumns } from './useUsersGridColumns';

type UsersGridProps = { surface?: UserManagementSurface };

export function UsersGrid({ surface = 'user' }: UsersGridProps) {
  const { t, currentLang } = useTranslate('users');
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
  const hasActiveFilters = Boolean(filters.search || filters.roleIds.length || filters.statuses.length);
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const handleFiltersChange = useCallback((next: UsersGridFilters) => {
    setFilters(next);
    setPaginationModel((previous) => ({ ...previous, page: 0 }));
  }, []);
  const handleChangePin = useCallback((employeeId: string) => setPinChangeEmployeeId(employeeId), []);
  const { columns, viewHref } = useUsersGridColumns(surface, canEditEmployee, handleChangePin);

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
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <DataGrid
        checkboxSelection
        rows={usersQuery.data?.data ?? []}
        columns={columns}
        rowCount={usersQuery.data?.total ?? 0}
        loading={usersQuery.isLoading}
        onRefresh={() => void usersQuery.refetch()}
        refreshing={usersQuery.isFetching}
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
