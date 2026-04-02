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
import { RoutePath, RouterPathHelper, canAccessBusinessPartners } from 'app/routes';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';
import { OrganizationsGridToolbar } from 'modules/organizations/ui/components/OrganizationsGridToolbar/OrganizationsGridToolbar';
import type { AdminBusinessPartner, AdminGeneratedCredentials } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useActivateBusinessPartnerMutation,
  useDeactivateBusinessPartnerMutation,
  useGetBusinessPartnersListQuery,
  useResetBusinessPartnerPasswordMutation,
} from '../../../application';
import { CredentialsRevealDialog } from '../../components/CredentialsRevealDialog';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const BusinessPartnersListPage = () => {
  const { t, currentLang } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const { profile } = useCurrentUser();
  const { replace } = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const canManagePlatform = canAccessBusinessPartners(profile);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToDeactivate, setRowToDeactivate] = useState<AdminBusinessPartner | null>(null);
  const [credentials, setCredentials] = useState<AdminGeneratedCredentials | null>(null);
  const [credentialsDialogTitle, setCredentialsDialogTitle] = useState('');
  const [credentialsDialogDescription, setCredentialsDialogDescription] = useState('');

  const activateMutation = useActivateBusinessPartnerMutation();
  const deactivateMutation = useDeactivateBusinessPartnerMutation();
  const resetPasswordMutation = useResetBusinessPartnerPasswordMutation();

  const query = useGetBusinessPartnersListQuery(
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

  const columns = useMemo<GridColDef<AdminBusinessPartner>[]>(
    () => [
      { field: 'companyName', headerName: t('fields.companyName'), minWidth: 240, flex: 1 },
      { field: 'inn', headerName: t('fields.inn'), minWidth: 160, flex: 0.6 },
      { field: 'directorName', headerName: t('fields.directorName'), minWidth: 200, flex: 0.8 },
      { field: 'phone', headerName: t('fields.phone'), minWidth: 160, flex: 0.6 },
      {
        field: 'status',
        headerName: t('fields.status'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.status === 'active' ? tCommon('status.active') : tCommon('status.inactive')}
            color={row.status === 'active' ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        getActions: (params) => {
          const isActive = params.row.status === 'active';

          return [
            <CustomGridActionsCellItem
              actionKind="edit"
              key="edit"
              label={t('actions.edit')}
              icon={<Iconify icon="solar:pen-bold" />}
              href={RouterPathHelper.platformBusinessPartnerEdit(params.row.id)}
            />,
            <CustomGridActionsCellItem
              actionKind={isActive ? 'delete' : 'view'}
              key="activate"
              label={isActive ? t('actions.deactivate') : t('actions.activate')}
              icon={<Iconify icon={isActive ? 'solar:lock-keyhole-bold' : 'solar:play-bold'} />}
              onClick={async () => {
                if (isActive) {
                  setRowToDeactivate(params.row);
                  return;
                }

                const result = await activateMutation.mutateAsync(params.row.id);
                setCredentials({ username: result.username, password: result.password });
                setCredentialsDialogTitle(t('dialogs.partnerCredentials.title'));
                setCredentialsDialogDescription(t('dialogs.partnerCredentials.description'));
              }}
            />,
            <CustomGridActionsCellItem
              actionKind="view"
              key="reset-password"
              label={t('actions.resetPassword')}
              icon={<Iconify icon="solar:refresh-bold" />}
              showInMenu
              onClick={async () => {
                const result = await resetPasswordMutation.mutateAsync(params.row.id);
                setCredentials({ username: result.username, password: result.password });
                setCredentialsDialogTitle(t('dialogs.partnerCredentials.title'));
                setCredentialsDialogDescription(t('dialogs.partnerCredentials.resetDescription'));
              }}
            />,
          ];
        },
      },
    ],
    [activateMutation, resetPasswordMutation, t, tCommon],
  );

  if (profile && !canManagePlatform) {
    return null;
  }

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.businessPartners.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.platformBusinessPartnerCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}>
            {t('actions.createBusinessPartner')}
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
            loading={query.isLoading || activateMutation.isPending || resetPasswordMutation.isPending}
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
                    title: t('empty.businessPartners.noData.title'),
                    description: t('empty.businessPartners.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.businessPartners.noResults.title'),
                    description: t('empty.businessPartners.noResults.description'),
                  }}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={{
                    title: t('empty.businessPartners.noData.title'),
                    description: t('empty.businessPartners.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.businessPartners.noResults.title'),
                    description: t('empty.businessPartners.noResults.description'),
                  }}
                />
              ),
              toolbar: () => (
                <OrganizationsGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchBusinessPartnersPlaceholder')}
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
                      id: 'statuses',
                      label: t('filters.status'),
                      value: statuses,
                      options: statusOptions,
                      onApply: (values) => {
                        setStatuses(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'business-partners-status-filter',
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
        open={Boolean(rowToDeactivate)}
        onClose={() => setRowToDeactivate(null)}
        title={t('dialogs.deactivatePartner.title')}
        content={t('dialogs.deactivatePartner.description', { name: rowToDeactivate?.companyName ?? '' })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deactivateMutation.isPending}
            onClick={async () => {
              if (!rowToDeactivate) return;
              await deactivateMutation.mutateAsync(rowToDeactivate.id);
              setRowToDeactivate(null);
            }}>
            {t('actions.deactivate')}
          </Button>
        }
      />

      <CredentialsRevealDialog
        open={Boolean(credentials)}
        title={credentialsDialogTitle}
        description={credentialsDialogDescription}
        credentials={credentials}
        onClose={() => {
          setCredentials(null);
          setCredentialsDialogTitle('');
          setCredentialsDialogDescription('');
        }}
      />
    </ListPageContent>
  );
};

export default BusinessPartnersListPage;
