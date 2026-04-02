import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import type { GridColDef, GridRowSelectionModel, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminCashDesk, AdminCashDeskPayload } from 'shared/api/admin-types';
import { DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_PAGINATION_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Form, RHFMultiCheckbox, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import {
  useCreateCashDeskMutation,
  useDeleteCashDeskMutation,
  useGetCashDesksListQuery,
  useUpdateCashDeskMutation,
} from '../../application';

import { OrganizationsGridToolbar } from './OrganizationsGridToolbar';
import { RestaurantManagementAccordion } from './RestaurantManagementAccordion';

const schema = z.object({
  name: z.string().min(1),
  location: z.string(),
  enabledPaymentMethods: z.array(z.enum(['cash', 'card', 'qr'])).min(1),
  fiscalProvider: z.string().min(1),
  receiptPrinterEnabled: z.boolean(),
  terminalId: z.string(),
  externalCashboxId: z.string(),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;

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
  const { t: tOrders } = useTranslate('orders');
  const isEditMode = Boolean(item);
  const createMutation = useCreateCashDeskMutation();
  const updateMutation = useUpdateCashDeskMutation(item?.id ?? '');
  const paymentMethodOptions = useMemo(
    () => [
      { value: 'cash', label: tOrders('paymentMethods.cash') },
      { value: 'card', label: tOrders('paymentMethods.card') },
      { value: 'qr', label: t('paymentMethods.qr') },
    ],
    [t, tOrders],
  );

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      location: '',
      enabledPaymentMethods: ['cash', 'card', 'qr'],
      fiscalProvider: 'mock',
      receiptPrinterEnabled: true,
      terminalId: '',
      externalCashboxId: '',
      isActive: true,
    },
  });

  useEffect(() => {
    methods.reset({
      name: item?.name ?? '',
      location: item?.location ?? '',
      enabledPaymentMethods: item?.enabledPaymentMethods ?? ['cash', 'card', 'qr'],
      fiscalProvider: item?.fiscalProvider ?? 'mock',
      receiptPrinterEnabled: item?.receiptPrinterEnabled ?? true,
      terminalId: item?.terminalId ?? '',
      externalCashboxId: item?.externalCashboxId ?? '',
      isActive: item?.isActive ?? true,
    });
  }, [item, methods, open]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload: AdminCashDeskPayload = {
      name: values.name.trim(),
      location: values.location.trim(),
      enabledPaymentMethods: values.enabledPaymentMethods,
      fiscalProvider: values.fiscalProvider.trim(),
      receiptPrinterEnabled: values.receiptPrinterEnabled,
      terminalId: values.terminalId.trim(),
      externalCashboxId: values.externalCashboxId.trim(),
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
        <DialogTitle>{isEditMode ? t('pages.cashDeskEdit.title') : t('pages.cashDeskCreate.title')}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField<Values> name="name" label={t('fields.name')} />
            <RHFTextField<Values> name="location" label={t('fields.location')} />
            <RHFMultiCheckbox<Values>
              name="enabledPaymentMethods"
              label={t('fields.enabledPaymentMethods')}
              options={paymentMethodOptions}
              row
            />
            <RHFTextField<Values> name="fiscalProvider" label={t('fields.fiscalProvider')} />
            <RHFTextField<Values> name="terminalId" label={t('fields.terminalId')} />
            <RHFTextField<Values> name="externalCashboxId" label={t('fields.externalCashboxId')} />
            <Divider />
            <RHFSwitch<Values> name="receiptPrinterEnabled" label={t('fields.receiptPrinterEnabled')} />
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

export function RestaurantCashDesksSection({
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
  const { t: tOrders } = useTranslate('orders');
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
  const [dialogOpen, setDialogOpen] = useState(false);

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
      { field: 'location', headerName: t('fields.location'), minWidth: 220, flex: 1 },
      {
        field: 'enabledPaymentMethods',
        headerName: t('fields.enabledPaymentMethods'),
        minWidth: 180,
        flex: 0.8,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5} useFlexGap flexWrap="wrap">
            {row.enabledPaymentMethods.map((method) => (
              <Chip
                key={method}
                size="small"
                label={method === 'qr' ? t('paymentMethods.qr') : tOrders(`paymentMethods.${method}`)}
                variant="soft"
              />
            ))}
          </Stack>
        ),
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
    [t, tCommon, tOrders],
  );

  const hasActiveFilters = Boolean(search || statuses.length);

  return (
    <>
      <RestaurantManagementAccordion
        icon="solar:wallet-money-bold-duotone"
        title={title ?? t('pages.cashDesks.title')}
        description={description ?? t('restaurantManagement.sections.cashDesks.description')}
        total={query.data?.total ?? 0}
        actionLabel={actionLabel ?? t('actions.createCashDesk')}
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
      </RestaurantManagementAccordion>

      <RestaurantCashDeskDialog
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
