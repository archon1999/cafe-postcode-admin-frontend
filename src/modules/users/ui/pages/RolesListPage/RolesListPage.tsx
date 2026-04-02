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
import { useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import type { AdminRole } from 'shared/api/admin-types';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteRoleMutation, useGetRolesListQuery } from '../../../application';
import { PermissionPreview } from '../../components/PermissionPreview/PermissionPreview';

import { RolesGridToolbar } from './RolesGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = {
  type: 'include',
  ids: new Set(),
};

const RolesListPage = () => {
  const { t, currentLang } = useTranslate('users');
  const { t: tCommon } = useTranslate('common');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const deleteRoleMutation = useDeleteRoleMutation();

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [roleToDelete, setRoleToDelete] = useState<AdminRole | null>(null);

  const rolesQuery = useGetRolesListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    typeIn: types.length ? types.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const typeOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'system', label: t('labels.system') },
      { value: 'custom', label: t('labels.custom') },
    ],
    [t],
  );

  const hasActiveFilters = Boolean(search || types.length);

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

  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleClearSearch = () => {
    setSearch('');
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleTypesApply = (values: string[]) => {
    setTypes(values);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.roles.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.roleCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}>
            {t('actions.roleCreate', { defaultValue: 'Yangi rol' })}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <ListPageBody>
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
                <RolesGridToolbar
                  search={search}
                  onSearchChange={handleSearchChange}
                  onClearSearch={handleClearSearch}
                  types={types}
                  onTypesChange={setTypes}
                  onTypesApply={handleTypesApply}
                  typeOptions={typeOptions}
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
      </ListPageBody>

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
    </ListPageContent>
  );
};

export default RolesListPage;
