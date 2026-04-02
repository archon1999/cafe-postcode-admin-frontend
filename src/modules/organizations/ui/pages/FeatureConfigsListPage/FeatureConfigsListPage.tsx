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

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import type { AdminFeatureConfig } from 'shared/api/admin-types';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteFeatureConfigMutation, useGetFeatureConfigsListQuery } from '../../../application';
import {
  ORGANIZATION_FEATURE_KITCHEN_MODE_VALUES,
  ORGANIZATION_FEATURE_ORDER_ENTRY_MODE_VALUES,
} from '../../../domain';
import { OrganizationsGridToolbar } from '../../components/OrganizationsGridToolbar';
import { getFeatureKitchenModeTranslationKey, getFeatureOrderEntryModeTranslationKey } from '../../lib/presenters';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const FeatureConfigsListPage = () => {
  const { t, currentLang } = useTranslate('organizations');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.organizationFeatureConfigCreate);
  const deleteMutation = useDeleteFeatureConfigMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [orderEntryModes, setOrderEntryModes] = useState<string[]>([]);
  const [kitchenModes, setKitchenModes] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToDelete, setRowToDelete] = useState<AdminFeatureConfig | null>(null);
  const query = useGetFeatureConfigsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    orderEntryModeIn: orderEntryModes.length ? orderEntryModes.join(',') : undefined,
    kitchenModeIn: kitchenModes.length ? kitchenModes.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const orderEntryModeOptions = useMemo<FilterOption[]>(
    () =>
      ORGANIZATION_FEATURE_ORDER_ENTRY_MODE_VALUES.map((mode) => ({
        value: mode,
        label: t(getFeatureOrderEntryModeTranslationKey(mode)),
      })),
    [t],
  );
  const kitchenModeOptions = useMemo<FilterOption[]>(
    () =>
      ORGANIZATION_FEATURE_KITCHEN_MODE_VALUES.map((mode) => ({
        value: mode,
        label: t(getFeatureKitchenModeTranslationKey(mode)),
      })),
    [t],
  );

  const hasActiveFilters = Boolean(search || orderEntryModes.length || kitchenModes.length);

  const columns = useMemo<GridColDef<AdminFeatureConfig>[]>(
    () => [
      {
        field: 'restaurantName',
        headerName: t('fields.restaurant'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (_value, row) => row.restaurantName || '-',
      },
      {
        field: 'orderEntryMode',
        headerName: t('fields.orderEntryMode'),
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ row }) => (
          <Chip size="small" label={t(getFeatureOrderEntryModeTranslationKey(row.orderEntryMode))} variant="soft" />
        ),
      },
      {
        field: 'kitchenMode',
        headerName: t('fields.kitchenMode'),
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ row }) => (
          <Chip size="small" label={t(getFeatureKitchenModeTranslationKey(row.kitchenMode))} variant="soft" />
        ),
      },
      {
        field: 'enabledModules',
        headerName: t('fields.enabledModules'),
        minWidth: 220,
        flex: 1,
        renderCell: ({ row }) =>
          row.enabledModules
            .slice(0, 3)
            .map((module) => t(`featureModules.${module}`))
            .join(', ') || '-',
      },
      {
        field: 'enabledRoles',
        headerName: t('fields.enabledRoles'),
        minWidth: 220,
        flex: 1,
        renderCell: ({ row }) =>
          (row.enabledRoleDetails?.length ? row.enabledRoleDetails.map((role) => role.name) : row.enabledRoles)
            .slice(0, 3)
            .join(', ') || '-',
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: t('actions.title'),
        minWidth: 90,
        getActions: (params) => [
          <CustomGridActionsCellItem
            actionKind="edit"
            key="edit"
            label={t('actions.edit')}
            icon={<Iconify icon="solar:pen-bold" />}
            href={RouterPathHelper.organizationFeatureConfigEdit(params.row.id)}
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
    [t],
  );

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.featureConfigs.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.organizationFeatureConfigCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createFeatureConfig')}
          </Button>
        }
      />
      <ListPageBody>
        <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            checkboxSelection
            rows={query.data?.data ?? []}
            columns={columns}
            rowCount={query.data?.total ?? 0}
            loading={query.isLoading}
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
                  noData={{
                    title: t('empty.featureConfigs.noData.title'),
                    description: t('empty.featureConfigs.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.featureConfigs.noResults.title'),
                    description: t('empty.featureConfigs.noResults.description'),
                  }}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={{
                    title: t('empty.featureConfigs.noData.title'),
                    description: t('empty.featureConfigs.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.featureConfigs.noResults.title'),
                    description: t('empty.featureConfigs.noResults.description'),
                  }}
                />
              ),
              toolbar: () => (
                <OrganizationsGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchFeatureConfigsPlaceholder')}
                  clearSearchLabel={t('filters.clearSearch')}
                  search={search}
                  onSearchChange={setSearch}
                  onClearSearch={() => setSearch('')}
                  filters={[
                    {
                      id: 'orderEntryModes',
                      label: t('filters.orderEntryMode'),
                      value: orderEntryModes,
                      options: orderEntryModeOptions,
                      onApply: (values) => {
                        setOrderEntryModes(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'feature-configs-order-entry-mode-filter',
                      emptyLabel: t('filters.all'),
                    },
                    {
                      id: 'kitchenModes',
                      label: t('filters.kitchenMode'),
                      value: kitchenModes,
                      options: kitchenModeOptions,
                      onApply: (values) => {
                        setKitchenModes(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'feature-configs-kitchen-mode-filter',
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
      </ListPageBody>
      <ConfirmDialog
        open={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        title={t('dialogs.deleteFeatureConfig.title')}
        content={t('dialogs.deleteFeatureConfig.description')}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteMutation.isPending}
            onClick={async () => {
              if (!rowToDelete) return;
              await deleteMutation.mutateAsync(rowToDelete.id);
              setRowToDelete(null);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />
    </ListPageContent>
  );
};

export default FeatureConfigsListPage;
