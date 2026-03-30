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
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import type { AdminDistributionPoint, AdminDistributionPointPayload } from 'shared/api/admin-types';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Form, RHFSelect, RHFSwitch, RHFTextField } from 'shared/ui/HookForm';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import {
  useCreateDistributionPointMutation,
  useDeleteDistributionPointMutation,
  useGetDistributionPointsListQuery,
  useGetOrganizationsHallsQuery,
  useUpdateDistributionPointMutation,
} from '../../application';
import { getDistributionPointKindTranslationKey } from '../lib/presenters';

import { BranchManagementAccordion } from './BranchManagementAccordion';
import { OrganizationsGridToolbar } from './OrganizationsGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };
const DISTRIBUTION_POINT_KINDS = ['hall', 'online', 'takeaway', 'delivery'] as const;

const schema = z.object({
  name: z.string().min(1),
  kind: z.enum(DISTRIBUTION_POINT_KINDS),
  integrationChannel: z.string(),
  assignedHall: z.string().optional(),
  isActive: z.boolean(),
});

type Values = z.infer<typeof schema>;

function BranchDistributionPointDialog({
  open,
  branchId,
  item,
  onClose,
}: {
  open: boolean;
  branchId?: string | null;
  item: AdminDistributionPoint | null;
  onClose: () => void;
}) {
  const { t } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const isEditMode = Boolean(item);
  const hallsQuery = useGetOrganizationsHallsQuery();
  const createMutation = useCreateDistributionPointMutation();
  const updateMutation = useUpdateDistributionPointMutation(item?.id ?? '');

  const hallOptions = useMemo(
    () => (hallsQuery.data ?? []).filter((hall) => !branchId || hall.branch === branchId),
    [branchId, hallsQuery.data],
  );

  const methods = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', kind: 'hall', integrationChannel: '', assignedHall: '', isActive: true },
  });

  useEffect(() => {
    methods.reset({
      name: item?.name ?? '',
      kind: item?.kind ?? 'hall',
      integrationChannel: item?.integrationChannel ?? '',
      assignedHall: item?.assignedHall ?? '',
      isActive: item?.isActive ?? true,
    });
  }, [item, methods, open]);

  const onSubmit = methods.handleSubmit(async (values) => {
    const payload: AdminDistributionPointPayload = {
      name: values.name.trim(),
      kind: values.kind,
      integrationChannel: values.integrationChannel.trim(),
      branch: branchId ?? null,
      assignedHall: values.assignedHall || null,
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
        <DialogTitle>
          {isEditMode ? t('pages.distributionPointEdit.title') : t('pages.distributionPointCreate.title')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <RHFTextField<Values> name="name" label={t('fields.name')} />
            <RHFSelect<Values> name="kind" label={t('fields.kind')}>
              {DISTRIBUTION_POINT_KINDS.map((kind) => (
                <MenuItem key={kind} value={kind}>
                  {t(getDistributionPointKindTranslationKey(kind))}
                </MenuItem>
              ))}
            </RHFSelect>
            <RHFTextField<Values> name="integrationChannel" label={t('fields.integrationChannel')} />
            <RHFSelect<Values>
              name="assignedHall"
              label={t('fields.assignedHall')}
              helperText={hallsQuery.isLoading ? tCommon('labels.loading') : t('fields.assignedHallHint')}>
              <MenuItem value="">{t('labels.notSelected')}</MenuItem>
              {hallOptions.map((hall) => (
                <MenuItem key={hall.id} value={hall.id}>
                  {formatHallDisplayName(hall.name, hall.level, tCommon)}
                </MenuItem>
              ))}
            </RHFSelect>
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

export function BranchDistributionPointsSection({
  branchId,
  defaultExpanded = false,
  title,
  description,
  actionLabel,
  searchPlaceholder,
}: {
  branchId?: string | null;
  defaultExpanded?: boolean;
  title?: string;
  description?: string;
  actionLabel?: string;
  searchPlaceholder?: string;
}) {
  const { t, currentLang } = useTranslate('organizations');
  const { t: tCommon } = useTranslate('common');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const deleteMutation = useDeleteDistributionPointMutation();
  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [rowToDelete, setRowToDelete] = useState<AdminDistributionPoint | null>(null);
  const [editingRow, setEditingRow] = useState<AdminDistributionPoint | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const query = useGetDistributionPointsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    branchIdIn: branchId || undefined,
    kindIn: kinds.length ? kinds.join(',') : undefined,
    isActive: statuses.length === 1 ? statuses[0] === 'active' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const kindOptions = useMemo<FilterOption[]>(
    () =>
      DISTRIBUTION_POINT_KINDS.map((kind) => ({ value: kind, label: t(getDistributionPointKindTranslationKey(kind)) })),
    [t],
  );
  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'active', label: tCommon('status.active') },
      { value: 'inactive', label: tCommon('status.inactive') },
    ],
    [tCommon],
  );

  const columns = useMemo<GridColDef<AdminDistributionPoint>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 1 },
      {
        field: 'kind',
        headerName: t('fields.kind'),
        minWidth: 160,
        flex: 0.7,
        renderCell: ({ row }) => (
          <Chip size="small" label={t(getDistributionPointKindTranslationKey(row.kind))} variant="soft" />
        ),
      },
      {
        field: 'assignedHallName',
        headerName: t('fields.assignedHall'),
        minWidth: 180,
        flex: 0.7,
        valueGetter: (_value, row) => formatHallDisplayName(row.assignedHallName, row.assignedHallLevel, tCommon),
      },
      { field: 'integrationChannel', headerName: t('fields.integrationChannel'), minWidth: 180, flex: 0.8 },
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

  const hasActiveFilters = Boolean(search || kinds.length || statuses.length);

  return (
    <>
      <BranchManagementAccordion
        icon="solar:shop-bold-duotone"
        title={title ?? t('pages.distributionPoints.title')}
        description={description ?? t('branchManagement.sections.distributionPoints.description')}
        total={query.data?.total ?? 0}
        actionLabel={actionLabel ?? t('actions.createDistributionPoint')}
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
                    title: t('empty.distributionPoints.noData.title'),
                    description: t('empty.distributionPoints.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.distributionPoints.noResults.title'),
                    description: t('empty.distributionPoints.noResults.description'),
                  }}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={{
                    title: t('empty.distributionPoints.noData.title'),
                    description: t('empty.distributionPoints.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.distributionPoints.noResults.title'),
                    description: t('empty.distributionPoints.noResults.description'),
                  }}
                />
              ),
              toolbar: () => (
                <OrganizationsGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={searchPlaceholder ?? t('filters.searchDistributionPointsPlaceholder')}
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
                      label: t('filters.kind'),
                      value: kinds,
                      options: kindOptions,
                      onChange: setKinds,
                      onApply: (values) => {
                        setKinds(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'branch-distribution-points-kind-filter',
                      emptyLabel: t('filters.all'),
                    },
                    {
                      label: t('filters.status'),
                      value: statuses,
                      options: statusOptions,
                      onChange: setStatuses,
                      onApply: (values) => {
                        setStatuses(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'branch-distribution-points-status-filter',
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
      </BranchManagementAccordion>

      <BranchDistributionPointDialog
        open={dialogOpen}
        branchId={branchId}
        item={editingRow}
        onClose={() => {
          setDialogOpen(false);
          setEditingRow(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        title={t('dialogs.deleteDistributionPoint.title')}
        content={t('dialogs.deleteDistributionPoint.description', { name: rowToDelete?.name ?? '' })}
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
