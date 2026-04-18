import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminBusinessPartner, AdminGeneratedCredentials } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useDeactivateBusinessPartnerMutation,
  useGetBusinessPartnersListQuery,
  useResetBusinessPartnerPasswordMutation,
} from '../../../application';
import { BusinessPartnerActivationDialog } from '../../components/BusinessPartnerActivationDialog';
import { BusinessPartnerClientsCell } from '../../components/BusinessPartnerClientsCell';
import { CredentialsRevealDialog } from '../../components/CredentialsRevealDialog';

import {
  BusinessPartnersGridToolbar,
  type BusinessPartnersGridFilters,
  DEFAULT_BUSINESS_PARTNERS_GRID_FILTERS,
} from './BusinessPartnersGridToolbar';

export function BusinessPartnersGrid() {
  const { t, currentLang } = useTranslate('platform');
  const { t: tCommon } = useTranslate('common');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<BusinessPartnersGridFilters>(DEFAULT_BUSINESS_PARTNERS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToActivate, setRowToActivate] = useState<AdminBusinessPartner | null>(null);
  const [rowToDeactivate, setRowToDeactivate] = useState<AdminBusinessPartner | null>(null);
  const [credentials, setCredentials] = useState<AdminGeneratedCredentials | null>(null);
  const [credentialsDialogTitle, setCredentialsDialogTitle] = useState('');
  const [credentialsDialogDescription, setCredentialsDialogDescription] = useState('');

  const deactivateMutation = useDeactivateBusinessPartnerMutation();
  const resetPasswordMutation = useResetBusinessPartnerPasswordMutation();

  const query = useGetBusinessPartnersListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    isActive: filters.statuses.length === 1 ? filters.statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const handleFiltersChange = useCallback((next: BusinessPartnersGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<AdminBusinessPartner>[]>(
    () => [
      { field: 'companyName', headerName: t('fields.companyName'), minWidth: 240, flex: 1 },
      { field: 'inn', headerName: t('fields.inn'), minWidth: 160, flex: 0.6 },
      { field: 'directorName', headerName: t('fields.directorName'), minWidth: 200, flex: 0.8 },
      { field: 'phone', headerName: t('fields.phone'), minWidth: 160, flex: 0.6 },
      {
        field: 'clients',
        headerName: t('fields.clients'),
        minWidth: 240,
        flex: 1,
        sortable: false,
        renderCell: ({ row }) => (
          <BusinessPartnerClientsCell restaurants={row.restaurants} restaurantsCount={row.restaurantsCount} />
        ),
      },
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

                setRowToActivate(params.row);
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
    [resetPasswordMutation, t, tCommon],
  );

  return (
    <>
      <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <DataGrid
          checkboxSelection
          rows={query.data?.data ?? []}
          columns={columns}
          rowCount={query.data?.total ?? 0}
          loading={query.isLoading || resetPasswordMutation.isPending}
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
                hasActiveFilters={Boolean(filters.search || filters.statuses.length)}
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
              <BusinessPartnersGridToolbar
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
            [`& .${gridClasses.cell}`]: { display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-toolbarContainer': { px: 2.5, py: 2 },
          }}
        />
      </Card>

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

      <BusinessPartnerActivationDialog
        open={rowToActivate}
        onClose={() => setRowToActivate(null)}
        onSuccess={(result) => {
          setRowToActivate(null);
          setCredentials({ username: result.username, password: result.password });
          setCredentialsDialogTitle(t('dialogs.partnerCredentials.title'));
          setCredentialsDialogDescription(t('dialogs.partnerCredentials.description'));
        }}
      />

      <CredentialsRevealDialog
        open={Boolean(credentials)}
        title={credentialsDialogTitle}
        description={credentialsDialogDescription}
        fields={[
          { label: t('fields.username'), value: credentials?.username },
          { label: t('fields.password'), value: credentials?.password },
        ]}
        onClose={() => {
          setCredentials(null);
          setCredentialsDialogTitle('');
          setCredentialsDialogDescription('');
        }}
      />
    </>
  );
}
