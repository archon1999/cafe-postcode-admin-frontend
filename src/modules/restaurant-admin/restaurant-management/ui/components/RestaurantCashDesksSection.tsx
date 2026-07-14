import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { z } from 'zod';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminCashDesk, AdminCashDeskPayload } from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Form, RHFSelect, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useCreateCashDeskMutation,
  useDeleteCashDeskMutation,
  useGetCashDesksListQuery,
  useGetIntegrationConfigsListQuery,
  useUpdateCashDeskMutation,
} from '../../application';

import { OrganizationsGridToolbar } from './OrganizationsGridToolbar';
import { RestaurantManagementAccordion } from './RestaurantManagementAccordion';

const schema = z.object({
  name: z.string().min(1),
  fiscalIntegration: z.string().min(1),
  paymentIntegration: z.string(),
  printerIntegration: z.string(),
});

type Values = z.infer<typeof schema>;

function getPrinterIntegrationLabel(integration: {
  id?: string;
  provider: string;
  displayName?: string;
  display_name?: string;
  settings: Record<string, unknown>;
}) {
  if (integration.displayName || integration.display_name) {
    return integration.displayName ?? integration.display_name;
  }

  const connectionType = integration.settings.connection_type ?? integration.settings.connectionType;
  const printerName = integration.settings.printer_name ?? integration.settings.printerName;
  const host = integration.settings.host;
  const port = integration.settings.port;

  if (host) {
    return `${integration.provider} (LAN TCP/IP: ${String(host)}${port ? `:${String(port)}` : ''})`;
  }

  if (printerName) {
    return `${integration.provider} (Windows/USB: ${String(printerName)})`;
  }

  if (connectionType) {
    return `${integration.provider} (${String(connectionType)})`;
  }

  return integration.id ? `${integration.provider} (${integration.id.slice(-6)})` : integration.provider;
}

function getIntegrationLabel(integration: {
  id?: string;
  provider: string;
  displayName?: string;
  display_name?: string;
  settings: Record<string, unknown>;
  kind?: string;
}) {
  if (integration.displayName || integration.display_name) {
    return integration.displayName ?? integration.display_name;
  }

  if (integration.kind === 'printer') {
    return getPrinterIntegrationLabel(integration);
  }

  const terminalId = integration.settings.terminal_id ?? integration.settings.terminalId ?? integration.settings.fiscal;
  const endpointUrl = integration.settings.endpoint_url ?? integration.settings.endpointUrl;
  const suffix = terminalId ?? endpointUrl;
  return suffix ? `${integration.provider} (${String(suffix)})` : integration.provider;
}

function RestaurantCashDeskDialog({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: AdminCashDesk | null;
  onClose: () => void;
}) {
  const { t } = useTranslate('organizations');
  const isEditMode = Boolean(item);
  const createMutation = useCreateCashDeskMutation();
  const updateMutation = useUpdateCashDeskMutation(item?.id ?? '');
  const fiscalIntegrationsQuery = useGetIntegrationConfigsListQuery({
    page: 1,
    pageSize: 100,
    kindIn: 'fiscal',
    isEnabled: true,
  });
  const fiscalIntegrations = (fiscalIntegrationsQuery.data?.data ?? []).filter(
    (integration) => integration.kind === 'fiscal' && integration.isEnabled,
  );
  const paymentIntegrationsQuery = useGetIntegrationConfigsListQuery({
    page: 1,
    pageSize: 100,
    kindIn: 'payment',
    isEnabled: true,
  });
  const paymentIntegrations = (paymentIntegrationsQuery.data?.data ?? []).filter(
    (integration) =>
      integration.kind === 'payment' && integration.provider === 'marta-softpos' && integration.isEnabled,
  );
  const printerIntegrationsQuery = useGetIntegrationConfigsListQuery({
    page: 1,
    pageSize: 100,
    kindIn: 'printer',
    isEnabled: true,
  });
  const printerIntegrations = (printerIntegrationsQuery.data?.data ?? []).filter(
    (integration) => integration.kind === 'printer' && integration.isEnabled,
  );

  const methods = useForm<Values>({
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues: {
      name: '',
      fiscalIntegration: '',
      paymentIntegration: '',
      printerIntegration: '',
    },
  });

  useEffect(() => {
    methods.reset({
      name: item?.name ?? '',
      fiscalIntegration: item?.fiscalIntegration ?? '',
      paymentIntegration: item?.paymentIntegration ?? '',
      printerIntegration: item?.printerIntegration ?? '',
    });
  }, [item, methods, open]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload: AdminCashDeskPayload = {
      name: values.name.trim(),
      fiscalIntegration: values.fiscalIntegration,
      paymentIntegration: values.paymentIntegration || null,
      printerIntegration: values.printerIntegration || null,
    };

    if (isEditMode && item) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync(payload);
    }

    onClose();
  });

  return (
    <Dialog open={open} onClose={methods.formState.isSubmitting ? undefined : onClose} fullWidth maxWidth="sm">
      <Form methods={methods} onSubmit={onSubmit}>
        <DialogTitle>{isEditMode ? t('pages.cashDeskEdit.title') : t('pages.cashDeskCreate.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField<Values> name="name" label={t('fields.name')} />
            <RHFSelect<Values>
              name="fiscalIntegration"
              label={t('fields.fiscalIntegration')}
              disabled={fiscalIntegrationsQuery.isLoading}>
              {fiscalIntegrations.map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {getIntegrationLabel(integration)}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect<Values>
              name="paymentIntegration"
              label={t('fields.paymentIntegration')}
              disabled={paymentIntegrationsQuery.isLoading}>
              <MenuItem value="">{t('labels.notConnected')}</MenuItem>
              {paymentIntegrations.map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {getIntegrationLabel(integration)}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect<Values>
              name="printerIntegration"
              label={t('fields.printerIntegration')}
              disabled={printerIntegrationsQuery.isLoading}>
              <MenuItem value="">{t('labels.notSelected')}</MenuItem>
              {printerIntegrations.map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {getIntegrationLabel(integration)}
                </MenuItem>
              ))}
            </RHFSelect>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button color="inherit" variant="outlined" onClick={onClose} disabled={methods.formState.isSubmitting}>
            {t('actions.cancel', { ns: 'common' })}
          </Button>
          <Button type="submit" variant="contained" color="black" loading={methods.formState.isSubmitting}>
            {isEditMode ? t('actions.save') : t('actions.create')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export function RestaurantCashDesksSection({
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

  const deleteMutation = useDeleteCashDeskMutation();
  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToDelete, setRowToDelete] = useState<AdminCashDesk | null>(null);
  const [editingRow, setEditingRow] = useState<AdminCashDesk | null>(null);
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

  const query = useGetCashDesksListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    isActive: statuses.length === 1 ? statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'active', label: tCommon('status.active') },
      { value: 'inactive', label: tCommon('status.inactive') },
    ],
    [tCommon],
  );

  const columns = useMemo<GridColDef<AdminCashDesk>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 1 },
      {
        field: 'fiscalIntegrationName',
        headerName: 'Fiscal integratsiya',
        minWidth: 220,
        flex: 1,
        renderCell: ({ row }) => row.fiscalIntegrationName || row.fiscalProvider || '-',
      },
      {
        field: 'paymentIntegrationName',
        headerName: 'MARTA terminal',
        minWidth: 240,
        flex: 1,
        renderCell: ({ row }) => row.paymentIntegrationName || '-',
      },
      {
        field: 'printerIntegrationName',
        headerName: 'Printer',
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ row }) => row.printerIntegrationName || '-',
      },
      {
        field: 'isActive',
        headerName: t('fields.status'),
        minWidth: 120,
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

  const hasActiveFilters = Boolean(search || statuses.length);
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
                title: t('empty.cashDesks.noData.title'),
                description: t('empty.cashDesks.noData.description'),
              }}
              noResults={{
                title: t('empty.cashDesks.noResults.title'),
                description: t('empty.cashDesks.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{
                title: t('empty.cashDesks.noData.title'),
                description: t('empty.cashDesks.noData.description'),
              }}
              noResults={{
                title: t('empty.cashDesks.noResults.title'),
                description: t('empty.cashDesks.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <OrganizationsGridToolbar
              searchLabel={t('filters.search')}
              searchPlaceholder={searchPlaceholder ?? t('filters.searchCashDesksPlaceholder')}
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
                  testId: 'restaurant-cashdesks-status-filter',
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
          icon="solar:wallet-money-bold-duotone"
          title={title ?? t('pages.cashDesks.title')}
          description={description ?? t('restaurantManagement.sections.cashDesks.description')}
          total={query.data?.total ?? 0}
          actionLabel={actionLabel ?? t('actions.createCashDesk')}
          onActionClick={openCreateDialog}
          defaultExpanded={defaultExpanded}>
          {grid}
        </RestaurantManagementAccordion>
      )}

      <RestaurantCashDeskDialog open={isDialogOpen} item={editingRow} onClose={closeDialog} />

      <ConfirmDialog
        open={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        title={t('dialogs.deleteCashDesk.title')}
        content={t('dialogs.deleteCashDesk.description', { name: rowToDelete?.name ?? '' })}
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
    </>
  );
}
