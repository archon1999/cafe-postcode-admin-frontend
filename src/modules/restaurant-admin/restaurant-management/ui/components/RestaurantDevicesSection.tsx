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
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminDevice, AdminDevicePayload } from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Form, RHFMultiSelect, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import {
  useCreateDeviceMutation,
  useDeleteDeviceMutation,
  useGetDevicesListQuery,
  useGetOrganizationsHallsQuery,
  useUpdateDeviceMutation,
} from '../../application';
import { ORGANIZATION_DEVICE_MODE_VALUES } from '../../domain';
import { getDeviceModeTranslationKey } from '../helpers/presenters';

import { OrganizationsGridToolbar } from './OrganizationsGridToolbar';
import { RestaurantManagementAccordion } from './RestaurantManagementAccordion';

const schema = z.object({
  name: z.string().min(1),
  mode: z.enum(ORGANIZATION_DEVICE_MODE_VALUES),
  primaryHallId: z.string().optional(),
  allowedHallIds: z.array(z.string()).default([]),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;

function RestaurantDeviceDialog({
  open,
  item,
  onClose,
}: {
  open: boolean;
  item: AdminDevice | null;
  onClose: () => void;
}) {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const isEditMode = Boolean(item);
  const hallsQuery = useGetOrganizationsHallsQuery();
  const createMutation = useCreateDeviceMutation();
  const updateMutation = useUpdateDeviceMutation(item?.id ?? '');

  const hallOptions = useMemo(() => hallsQuery.data ?? [], [hallsQuery.data]);

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', mode: 'admin', primaryHallId: '', allowedHallIds: [], isActive: true },
  });
  const selectedPrimaryHallId = methods.watch('primaryHallId');

  useEffect(() => {
    methods.reset({
      name: item?.name ?? '',
      mode: item?.mode ?? 'admin',
      primaryHallId: item?.primaryHallId ?? '',
      allowedHallIds: item?.allowedHallIds ?? [],
      isActive: item?.isActive ?? true,
    });
  }, [item, methods, open]);

  useEffect(() => {
    if (selectedPrimaryHallId && !methods.getValues('allowedHallIds').includes(selectedPrimaryHallId)) {
      methods.setValue('allowedHallIds', [...methods.getValues('allowedHallIds'), selectedPrimaryHallId]);
    }
  }, [methods, selectedPrimaryHallId]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload: AdminDevicePayload = {
      name: values.name.trim(),
      mode: values.mode,
      primaryHallId: values.primaryHallId || null,
      allowedHallIds: values.allowedHallIds,
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
        <DialogTitle>{isEditMode ? t('pages.deviceEdit.title') : t('pages.deviceCreate.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField<Values> name="name" label={t('fields.name')} />
            <RHFSelect<Values> name="mode" label={t('fields.mode')}>
              {ORGANIZATION_DEVICE_MODE_VALUES.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  {t(getDeviceModeTranslationKey(mode))}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFSelect<Values>
              name="primaryHallId"
              label={t('fields.primaryHall')}
              helperText={hallsQuery.isLoading ? tCommon('labels.loading') : t('fields.primaryHallHint')}>
              <MenuItem value="">{t('labels.notSelected')}</MenuItem>
              {hallOptions.map((hall) => (
                <MenuItem key={hall.id} value={hall.id}>
                  {formatHallDisplayName(hall.name, undefined, tCommon)}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFMultiSelect<Values>
              name="allowedHallIds"
              label={t('fields.allowedHalls')}
              options={hallOptions.map((hall) => ({
                value: hall.id,
                label: formatHallDisplayName(hall.name, undefined, tCommon),
              }))}
              checkbox
              chip
              placeholder={t('labels.notSelected')}
              helperText={hallsQuery.isLoading ? tCommon('labels.loading') : t('fields.allowedHallsHint')}
            />
            <RHFSwitch<Values> name="isActive" label={t('fields.status')} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button color="inherit" variant="outlined" onClick={onClose} disabled={methods.formState.isSubmitting}>
            {t('actions.cancel', { ns: 'common', defaultValue: 'Bekor qilish' })}
          </Button>
          <Button type="submit" variant="contained" color="black" loading={methods.formState.isSubmitting}>
            {isEditMode ? t('actions.save') : t('actions.create')}
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
}

export function RestaurantDevicesSection({
  defaultExpanded = false,
  title,
  description,
  actionLabel,
  searchPlaceholder,
}: {
  defaultExpanded?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  searchPlaceholder?: string;
}) {
  const { t, currentLang } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const deleteMutation = useDeleteDeviceMutation();
  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [modes, setModes] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToDelete, setRowToDelete] = useState<AdminDevice | null>(null);
  const [editingRow, setEditingRow] = useState<AdminDevice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const query = useGetDevicesListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    modeIn: modes.length ? modes.join(',') : undefined,
    isActive: statuses.length === 1 ? statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const modeOptions = useMemo<FilterOption[]>(
    () => ORGANIZATION_DEVICE_MODE_VALUES.map((mode) => ({ value: mode, label: t(getDeviceModeTranslationKey(mode)) })),
    [t],
  );
  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'active', label: tCommon('status.active') },
      { value: 'inactive', label: tCommon('status.inactive') },
    ],
    [tCommon],
  );

  const columns = useMemo<GridColDef<AdminDevice>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 1 },
      {
        field: 'mode',
        headerName: t('fields.mode'),
        minWidth: 180,
        flex: 0.7,
        renderCell: ({ row }) => <Chip size="small" label={t(getDeviceModeTranslationKey(row.mode))} variant="soft" />,
      },
      {
        field: 'primaryHallName',
        headerName: t('fields.primaryHall'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (_value, row) => formatHallDisplayName(row.primaryHallName, undefined, tCommon),
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
    [t, tCommon],
  );

  const hasActiveFilters = Boolean(search || modes.length || statuses.length);

  return (
    <>
      <RestaurantManagementAccordion
        icon="solar:smartphone-bold-duotone"
        title={title ?? t('pages.devices.title')}
        description={description ?? t('restaurantManagement.sections.devices.description')}
        total={query.data?.total ?? 0}
        actionLabel={actionLabel ?? t('actions.createDevice')}
        onActionClick={() => {
          setEditingRow(null);
          setDialogOpen(true);
        }}
        defaultExpanded={defaultExpanded}>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: { xs: 520, md: 600 },
            minHeight: 0,
            overflow: 'hidden',
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
                    title: t('empty.devices.noData.title'),
                    description: t('empty.devices.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.devices.noResults.title'),
                    description: t('empty.devices.noResults.description'),
                  }}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={{
                    title: t('empty.devices.noData.title'),
                    description: t('empty.devices.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.devices.noResults.title'),
                    description: t('empty.devices.noResults.description'),
                  }}
                />
              ),
              toolbar: () => (
                <OrganizationsGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={searchPlaceholder ?? t('filters.searchDevicesPlaceholder')}
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
                      id: 'modes',
                      label: t('filters.mode'),
                      value: modes,
                      options: modeOptions,
                      onApply: (values) => {
                        setModes(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'restaurant-devices-mode-filter',
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
                      testId: 'restaurant-devices-status-filter',
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
      </RestaurantManagementAccordion>

      <RestaurantDeviceDialog
        open={dialogOpen}
        item={editingRow}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        title={t('dialogs.deleteDevice.title')}
        content={t('dialogs.deleteDevice.description', { name: rowToDelete?.name ?? '' })}
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
