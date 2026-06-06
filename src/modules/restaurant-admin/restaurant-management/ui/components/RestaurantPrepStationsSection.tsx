import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
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
import { useAdminRestaurantScopeId } from 'modules/auth';
import type { AdminPrepStation, AdminPrepStationPayload } from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Form, RHFMultiSelect, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useCreatePrepStationMutation,
  useDeletePrepStationMutation,
  useGetPrepStationsListQuery,
  useUpdatePrepStationMutation,
} from '../../application';
import { ORGANIZATION_PREP_STATION_KIND_VALUES } from '../../domain';

import { OrganizationsGridToolbar } from './OrganizationsGridToolbar';
import { RestaurantManagementAccordion } from './RestaurantManagementAccordion';

const schema = z.object({
  name: z.string().min(1),
  kind: z.enum(ORGANIZATION_PREP_STATION_KIND_VALUES),
  printerIntegration: z.string().optional(),
  cookIds: z.array(z.string()).default([]),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;
const KITCHEN_COOK_ROLE_CODES = new Set(['chef', 'barman', 'head_chef']);

function getPrinterIntegrationLabel(integration: { provider: string; settings: Record<string, unknown> }) {
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

  return connectionType ? `${integration.provider} (${String(connectionType)})` : integration.provider;
}

function RestaurantPrepStationDialog({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: AdminPrepStation | null;
  onClose: () => void;
}) {
  const { t } = useTranslate('organizations');
  const isEditMode = Boolean(item);
  const restaurantId = useAdminRestaurantScopeId();
  const createMutation = useCreatePrepStationMutation();
  const updateMutation = useUpdatePrepStationMutation(item?.id ?? '');
  const printerIntegrationsQuery = useQuery({
    queryKey: ['prep-station-printer-integrations', restaurantId],
    queryFn: () => apiClient.getAdminIntegrationConfigs({ page: 1, pageSize: 100, kindIn: 'printer', isEnabled: true }),
    enabled: Boolean(restaurantId),
  });
  const cooksQuery = useQuery({
    queryKey: ['prep-station-cooks', restaurantId],
    queryFn: () => apiClient.getAdminEmployees({ page: 1, pageSize: 500 }),
    enabled: Boolean(restaurantId),
  });
  const cookOptions = useMemo(
    () =>
      (cooksQuery.data?.data ?? [])
        .filter((cook) => cook.role?.code && KITCHEN_COOK_ROLE_CODES.has(cook.role.code))
        .map((cook) => ({
          value: cook.id,
          label: cook.fullName || cook.username,
        })),
    [cooksQuery.data?.data],
  );

  const methods = useForm<Values>({
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues: { name: '', kind: 'kitchen', printerIntegration: '', cookIds: [], isActive: true },
  });

  useEffect(() => {
    methods.reset({
      name: item?.name ?? '',
      kind: item?.kind ?? 'kitchen',
      printerIntegration: item?.printerIntegration ?? '',
      cookIds: item?.cooks?.map((cook) => cook.id) ?? [],
      isActive: item?.isActive ?? true,
    });
  }, [item, methods, open]);

  useEffect(() => {
    if (!open || cooksQuery.isLoading) {
      return;
    }

    const allowedCookIds = new Set(cookOptions.map((option) => option.value));
    const currentCookIds = methods.getValues('cookIds');
    const nextCookIds = currentCookIds.filter((cookId) => allowedCookIds.has(cookId));

    if (nextCookIds.length !== currentCookIds.length) {
      methods.setValue('cookIds', nextCookIds, { shouldDirty: true });
    }
  }, [cookOptions, cooksQuery.isLoading, methods, open]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const allowedCookIds = new Set(cookOptions.map((option) => option.value));
    const payload: AdminPrepStationPayload = {
      name: values.name.trim(),
      kind: values.kind,
      printerIntegration: values.printerIntegration || null,
      cookIds: values.cookIds.filter((cookId: string) => allowedCookIds.has(cookId)),
      isActive: values.isActive,
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
        <DialogTitle>{isEditMode ? t('pages.prepStationEdit.title') : t('pages.prepStationCreate.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField<Values> name="name" label={t('fields.name')} />
            <RHFSelect<Values> name="kind" label={t('fields.kind')}>
              {ORGANIZATION_PREP_STATION_KIND_VALUES.map((kind) => (
                <MenuItem key={kind} value={kind}>
                  {t(`prepStationKinds.${kind}`)}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect<Values> name="printerIntegration" label={t('fields.printerIntegration')}>
              <MenuItem value="">{t('labels.notSelected')}</MenuItem>
              {(printerIntegrationsQuery.data?.data ?? [])
                .filter((integration) => integration.kind === 'printer' && integration.isEnabled)
                .map((integration) => (
                <MenuItem key={integration.id} value={integration.id}>
                  {getPrinterIntegrationLabel(integration)}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFMultiSelect<Values>
              name="cookIds"
              label={t('fields.cooks')}
              options={cookOptions}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <RHFSwitch<Values> name="isActive" label={t('fields.status')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button color="inherit" variant="outlined" onClick={onClose} disabled={methods.formState.isSubmitting}>
            {t('actions.cancel', { ns: 'common'})}
          </Button>
          <Button type="submit" variant="contained" color="black" loading={methods.formState.isSubmitting}>
            {isEditMode ? t('actions.save') : t('actions.create')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export function RestaurantPrepStationsSection({
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

  const deleteMutation = useDeletePrepStationMutation();
  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToDelete, setRowToDelete] = useState<AdminPrepStation | null>(null);
  const [editingRow, setEditingRow] = useState<AdminPrepStation | null>(null);
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

  const query = useGetPrepStationsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    kindIn: kinds.length ? kinds.join(',') : undefined,
    isActive: statuses.length === 1 ? statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const kindOptions = useMemo<FilterOption[]>(
    () => ORGANIZATION_PREP_STATION_KIND_VALUES.map((kind) => ({ value: kind, label: t(`prepStationKinds.${kind}`) })),
    [t],
  );
  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'active', label: tCommon('status.active') },
      { value: 'inactive', label: tCommon('status.inactive') },
    ],
    [tCommon],
  );

  const columns = useMemo<GridColDef<AdminPrepStation>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 1 },
      {
        field: 'kind',
        headerName: t('fields.kind'),
        minWidth: 140,
        flex: 0.6,
        renderCell: ({ row }) => <Chip size="small" label={t(`prepStationKinds.${row.kind}`)} variant="soft" />,
      },
      {
        field: 'printerIntegrationName',
        headerName: 'Printer',
        minWidth: 160,
        flex: 0.7,
        valueGetter: (_value, row) => row.printerIntegrationName || '-',
      },
      {
        field: 'cooks',
        headerName: 'Oshpazlar',
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_value, row) =>
          row.cooks?.map((cook) => cook.fullName || cook.username).filter(Boolean).join(', ') || '-',
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
                title: t('empty.prepStations.noData.title'),
                description: t('empty.prepStations.noData.description'),
              }}
              noResults={{
                title: t('empty.prepStations.noResults.title'),
                description: t('empty.prepStations.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{
                title: t('empty.prepStations.noData.title'),
                description: t('empty.prepStations.noData.description'),
              }}
              noResults={{
                title: t('empty.prepStations.noResults.title'),
                description: t('empty.prepStations.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <OrganizationsGridToolbar
              searchLabel={t('filters.search')}
              searchPlaceholder={searchPlaceholder ?? t('filters.searchPrepStationsPlaceholder')}
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
                  label: t('filters.kind'),
                  value: kinds,
                  options: kindOptions,
                  onApply: (values) => {
                    setKinds(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  },
                  testId: 'restaurant-prepstations-kind-filter',
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
                  testId: 'restaurant-prepstations-status-filter',
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
          icon="solar:chef-hat-heart-bold-duotone"
          title={title ?? t('pages.prepStations.title')}
          description={description ?? t('restaurantManagement.sections.prepStations.description')}
          total={query.data?.total ?? 0}
          actionLabel={actionLabel ?? t('actions.createPrepStation')}
          onActionClick={openCreateDialog}
          defaultExpanded={defaultExpanded}>
          {grid}
        </RestaurantManagementAccordion>
      )}

      <RestaurantPrepStationDialog open={isDialogOpen} item={editingRow} onClose={closeDialog} />

      <ConfirmDialog
        open={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        title={t('dialogs.deletePrepStation.title')}
        content={t('dialogs.deletePrepStation.description', { name: rowToDelete?.name ?? '' })}
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
