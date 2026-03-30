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
import { useEffect, useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper, canAccessTariffs } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { OrganizationsGridToolbar } from 'modules/organizations/ui/components/OrganizationsGridToolbar/OrganizationsGridToolbar';
import type { AdminTariff } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatMoney } from 'shared/utils/format-money';

import { useGetTariffsListQuery } from '../../../application';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const TariffsListPage = () => {
  const { t, currentLang } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const canManagePlatform = canAccessTariffs(profile);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const query = useGetTariffsListQuery(
    {
      page: paginationModel.page + 1,
      pageSize: paginationModel.pageSize,
      search: search || undefined,
      isActive: statuses.length === 1 ? statuses[0] === 'active' : undefined,
      ordering: getOrderingFromSortModel(sortModel),
    },
    { enabled: canManagePlatform },
  );

  useEffect(() => {
    if (profile && !canManagePlatform) {
      replace(RoutePath.main);
    }
  }, [canManagePlatform, profile, replace]);

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'active', label: tCommon('status.active') },
      { value: 'inactive', label: tCommon('status.inactive') },
    ],
    [tCommon],
  );

  const hasActiveFilters = Boolean(search || statuses.length);

  const columns = useMemo<GridColDef<AdminTariff>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 200, flex: 1 },
      { field: 'classification', headerName: t('fields.classification'), minWidth: 160, flex: 0.7 },
      {
        field: 'monthlyPrice',
        headerName: t('fields.monthlyPrice'),
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ row }) => formatMoney(row.monthlyPrice),
      },
      {
        field: 'yearlyPrice',
        headerName: t('fields.yearlyPrice'),
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ row }) => formatMoney(row.yearlyPrice),
      },
      {
        field: 'isActive',
        headerName: t('fields.status'),
        minWidth: 130,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isActive ? tCommon('status.active') : tCommon('status.inactive')}
            color={row.isActive ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        field: 'permissionsCount',
        headerName: t('fields.permissions'),
        minWidth: 160,
        flex: 0.5,
        sortable: false,
        valueGetter: (_value, row) => row.permissions.length,
      },
      {
        field: 'allowedRolesCount',
        headerName: t('fields.allowedRoles'),
        minWidth: 160,
        flex: 0.5,
        sortable: false,
        valueGetter: (_value, row) => row.allowedRoles.length,
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
            href={RouterPathHelper.platformTariffEdit(params.row.id)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  if (profile && !canManagePlatform) {
    return null;
  }

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.tariffs.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.platformTariffCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}>
            {t('actions.createTariff')}
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
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
                    title: t('empty.tariffs.noData.title'),
                    description: t('empty.tariffs.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.tariffs.noResults.title'),
                    description: t('empty.tariffs.noResults.description'),
                  }}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={{
                    title: t('empty.tariffs.noData.title'),
                    description: t('empty.tariffs.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.tariffs.noResults.title'),
                    description: t('empty.tariffs.noResults.description'),
                  }}
                />
              ),
              toolbar: () => (
                <OrganizationsGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchTariffsPlaceholder')}
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
                      label: t('filters.status'),
                      value: statuses,
                      options: statusOptions,
                      onChange: setStatuses,
                      onApply: (values) => {
                        setStatuses(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'tariffs-status-filter',
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
    </ListPageContent>
  );
};

export default TariffsListPage;
