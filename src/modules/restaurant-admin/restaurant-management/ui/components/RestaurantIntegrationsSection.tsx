import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminIntegrationConfig } from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteIntegrationConfigMutation, useGetIntegrationConfigsListQuery } from '../../application';

import { getIntegrationSettingsSummary } from './integration-config.mapper';
import { OrganizationsGridToolbar } from './OrganizationsGridToolbar';
import { getKindLabel, INTEGRATION_KIND_VALUES, RestaurantIntegrationDialog } from './RestaurantIntegrationDialog';
import { RestaurantManagementAccordion } from './RestaurantManagementAccordion';

export function RestaurantIntegrationsSection({
  defaultExpanded = false,
  title,
  description,
  actionLabel,
  searchPlaceholder,
  layoutMode = 'accordion',
  createDialogOpen,
  onCreateDialogOpenChange,
}: {
  defaultExpanded?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  searchPlaceholder?: string;
  layoutMode?: 'accordion' | 'page';
  createDialogOpen?: boolean;
  onCreateDialogOpenChange?: (open: boolean) => void;
}) {
  const { t, currentLang } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const deleteMutation = useDeleteIntegrationConfigMutation();

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [editingRow, setEditingRow] = useState<AdminIntegrationConfig | null>(null);
  const [rowToDelete, setRowToDelete] = useState<AdminIntegrationConfig | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const setDialogOpen = useCallback(
    (open: boolean) => {
      if (!open) {
        return;
      }
      if (onCreateDialogOpenChange) {
        onCreateDialogOpenChange(false);
      }
      setIsCreateDialogOpen(false);
    },
    [onCreateDialogOpenChange],
  );

  const query = useGetIntegrationConfigsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    kindIn: kinds.length ? kinds.join(',') : undefined,
    isEnabled: statuses.length === 1 ? statuses[0] === 'enabled' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const kindOptions = useMemo<FilterOption[]>(
    () => INTEGRATION_KIND_VALUES.map((kind) => ({ value: kind, label: getKindLabel(kind) })),
    [],
  );
  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'enabled', label: tCommon('status.active') },
      { value: 'disabled', label: tCommon('status.inactive') },
    ],
    [tCommon],
  );

  const columns = useMemo<GridColDef<AdminIntegrationConfig>[]>(
    () => [
      {
        field: 'kind',
        headerName: t('fields.kind'),
        minWidth: 130,
        flex: 0.5,
        renderCell: ({ row }) => <Chip size="small" label={getKindLabel(row.kind)} variant="soft" />,
      },
      {
        field: 'provider',
        headerName: t('integrations.fields.provider'),
        minWidth: 180,
        flex: 0.8,
      },
      {
        field: 'settings',
        headerName: t('integrations.fields.settings'),
        minWidth: 300,
        flex: 1.3,
        sortable: false,
        renderCell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" noWrap>
            {getIntegrationSettingsSummary(row)}
          </Typography>
        ),
      },
      {
        field: 'isEnabled',
        headerName: t('fields.status'),
        minWidth: 120,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isEnabled ? tCommon('status.active') : tCommon('status.inactive')}
            color={row.isEnabled ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        getActions: (params) => [
          <CustomGridActionsCellItem
            actionKind="edit"
            key="edit"
            label={t('actions.edit')}
            icon={<Iconify icon="solar:pen-bold" />}
            onClick={() => {
              setEditingRow(params.row);
              setDialogOpen(true);
            }}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete')}
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setRowToDelete(params.row)}
          />,
        ],
      },
    ],
    [setDialogOpen, t, tCommon],
  );

  const hasActiveFilters = Boolean(search || kinds.length || statuses.length);
  const isDialogOpen = Boolean(editingRow) || Boolean(createDialogOpen) || isCreateDialogOpen;

  const openCreateDialog = () => {
    setEditingRow(null);
    if (onCreateDialogOpenChange) {
      onCreateDialogOpenChange(true);
      return;
    }
    setIsCreateDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingRow(null);
    if (onCreateDialogOpenChange) {
      onCreateDialogOpenChange(false);
    }
    setIsCreateDialogOpen(false);
  };

  const grid = (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        ...(layoutMode === 'page' ? { flex: 1 } : { height: { xs: 520, md: 600 } }),
      }}>
      <DataGrid
        checkboxSelection
        rows={query.data?.data ?? []}
        columns={columns}
        rowCount={query.data?.total ?? 0}
        loading={query.isLoading}
        onRefresh={() => void query.refetch()}
        refreshing={query.isFetching}
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
        disableColumnMenu
        slots={{
          noRowsOverlay: () => (
            <DataGridEmptyState
              hasActiveFilters={hasActiveFilters}
              noData={{
                title: t('empty.integrations.noData.title'),
                description: t('empty.integrations.noData.description'),
              }}
              noResults={{
                title: t('empty.integrations.noResults.title'),
                description: t('empty.integrations.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{
                title: t('empty.integrations.noData.title'),
                description: t('empty.integrations.noData.description'),
              }}
              noResults={{
                title: t('empty.integrations.noResults.title'),
                description: t('empty.integrations.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <OrganizationsGridToolbar
              searchLabel={t('filters.search')}
              searchPlaceholder={searchPlaceholder ?? t('filters.searchIntegrationsPlaceholder')}
              clearSearchLabel={t('filters.clearSearch')}
              search={search}
              onSearchChange={(value) => {
                setSearch(value);
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              onClearSearch={() => {
                setSearch('');
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
              }}
              filters={[
                {
                  id: 'kinds',
                  label: t('fields.kind'),
                  value: kinds,
                  options: kindOptions,
                  onApply: (values) => {
                    setKinds(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  },
                  testId: 'restaurant-integrations-kind-filter',
                  emptyLabel: t('filters.all'),
                },
                {
                  id: 'statuses',
                  label: t('filters.status'),
                  value: statuses,
                  options: statusOptions,
                  onApply: (values) => {
                    setStatuses(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  },
                  testId: 'restaurant-integrations-status-filter',
                  emptyLabel: t('filters.all'),
                },
              ]}
              columns={columns}
              columnVisibilityModel={columnVisibilityModel}
              defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
              onSave={setColumnVisibilityModel}
            />
          ),
        }}
        sx={{
          border: 'none',
          [`& .${gridClasses.cell}`]: { display: 'flex', alignItems: 'center' },
          '& .MuiDataGrid-toolbarContainer': { px: 2.5, py: 2 },
        }}
      />
    </Card>
  );

  return (
    <>
      {layoutMode === 'page' ? (
        grid
      ) : (
        <RestaurantManagementAccordion
          icon="solar:plug-circle-bold-duotone"
          title={title ?? t('pages.integrations.title')}
          description={description ?? t('restaurantManagement.sections.integrations.description')}
          total={query.data?.total ?? 0}
          actionLabel={actionLabel ?? t('actions.createIntegration')}
          onActionClick={openCreateDialog}
          defaultExpanded={defaultExpanded}>
          {grid}
        </RestaurantManagementAccordion>
      )}

      <RestaurantIntegrationDialog open={isDialogOpen} item={editingRow} onClose={closeDialog} />
      <ConfirmDialog
        open={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        title={t('dialogs.deleteIntegration.title')}
        content={t('dialogs.deleteIntegration.description', {
          name: rowToDelete ? `${getKindLabel(rowToDelete.kind)}: ${rowToDelete.provider}` : '',
        })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteMutation.isPending}
            onClick={async () => {
              if (!rowToDelete) {
                return;
              }
              await deleteMutation.mutateAsync(rowToDelete.id);
              setRowToDelete(null);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />
    </>
  );
}
