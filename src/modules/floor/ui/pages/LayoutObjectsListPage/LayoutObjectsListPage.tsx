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
import type { AdminLayoutObject } from 'shared/api/admin-types';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';

import {
  useDeleteLayoutObjectMutation,
  useGetFloorHallsQuery,
  useGetLayoutObjectsListQuery,
} from '../../../application';
import { FloorGridToolbar } from '../../components/FloorGridToolbar';
import { getLayoutObjectKindTranslationKey } from '../../lib/presenters';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

const LAYOUT_OBJECT_KINDS = ['table', 'bar', 'cash_desk', 'door', 'wall', 'decor', 'label'] as const;

const LayoutObjectsListPage = () => {
  const { t, currentLang } = useTranslate('floor');
  const { t: tCommon } = useTranslate('common');
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.floorLayoutObjectCreate);
  const hallsQuery = useGetFloorHallsQuery();
  const deleteMutation = useDeleteLayoutObjectMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [halls, setHalls] = useState<string[]>([]);
  const [kinds, setKinds] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [objectToDelete, setObjectToDelete] = useState<AdminLayoutObject | null>(null);
  const query = useGetLayoutObjectsListQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    hallIdIn: halls.length ? halls.join(',') : undefined,
    kindIn: kinds.length ? kinds.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });

  const hallOptions = useMemo<FilterOption[]>(
    () =>
      (hallsQuery.data ?? []).map((hall) => ({
        value: hall.id,
        label: formatHallDisplayName(hall.name),
      })),
    [hallsQuery.data, tCommon],
  );
  const kindOptions = useMemo<FilterOption[]>(
    () => LAYOUT_OBJECT_KINDS.map((kind) => ({ value: kind, label: t(getLayoutObjectKindTranslationKey(kind)) })),
    [t],
  );

  const hasActiveFilters = Boolean(search || halls.length || kinds.length);

  const columns = useMemo<GridColDef<AdminLayoutObject>[]>(
    () => [
      {
        field: 'label',
        headerName: t('fields.label'),
        minWidth: 220,
        flex: 1,
        valueGetter: (_v, row) => row.label || '-',
      },
      {
        field: 'hallName',
        headerName: t('fields.hall'),
        minWidth: 160,
        flex: 0.7,
        valueGetter: (_v, row) => formatHallDisplayName(row.hallName),
      },
      {
        field: 'zoneName',
        headerName: t('fields.zone'),
        minWidth: 160,
        flex: 0.7,
        valueGetter: (_v, row) => row.zoneName || '-',
      },
      {
        field: 'tableName',
        headerName: t('fields.table'),
        minWidth: 160,
        flex: 0.7,
        valueGetter: (_v, row) => row.tableName || '-',
      },
      {
        field: 'kind',
        headerName: t('fields.kind'),
        minWidth: 160,
        flex: 0.7,
        renderCell: ({ row }) => (
          <Chip size="small" label={t(getLayoutObjectKindTranslationKey(row.kind))} variant="soft" />
        ),
      },
      { field: 'sortOrder', headerName: t('fields.sortOrder'), minWidth: 120, flex: 0.4 },
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
            href={RouterPathHelper.floorLayoutObjectEdit(params.row.id)}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete')}
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setObjectToDelete(params.row)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.layoutObjects.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.floorLayoutObjectCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createLayoutObject')}
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
                    title: t('empty.layoutObjects.noData.title'),
                    description: t('empty.layoutObjects.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.layoutObjects.noResults.title'),
                    description: t('empty.layoutObjects.noResults.description'),
                  }}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={{
                    title: t('empty.layoutObjects.noData.title'),
                    description: t('empty.layoutObjects.noData.description'),
                  }}
                  noResults={{
                    title: t('empty.layoutObjects.noResults.title'),
                    description: t('empty.layoutObjects.noResults.description'),
                  }}
                />
              ),
              toolbar: () => (
                <FloorGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchLayoutObjectsPlaceholder')}
                  clearSearchLabel={t('filters.clearSearch')}
                  search={search}
                  onSearchChange={setSearch}
                  onClearSearch={() => setSearch('')}
                  filters={[
                    {
                      label: t('filters.hall'),
                      value: halls,
                      options: hallOptions,
                      onChange: setHalls,
                      onApply: (values) => {
                        setHalls(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'layout-objects-hall-filter',
                      emptyLabel: t('filters.all'),
                    },
                    {
                      label: t('filters.kind'),
                      value: kinds,
                      options: kindOptions,
                      onChange: setKinds,
                      onApply: (values) => {
                        setKinds(values);
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                      },
                      testId: 'layout-objects-kind-filter',
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
        open={Boolean(objectToDelete)}
        onClose={() => setObjectToDelete(null)}
        title={t('dialogs.deleteLayoutObject.title')}
        content={t('dialogs.deleteLayoutObject.description', {
          name: objectToDelete?.label || objectToDelete?.id || '',
        })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteMutation.isPending}
            onClick={async () => {
              if (!objectToDelete) return;
              await deleteMutation.mutateAsync(objectToDelete.id);
              setObjectToDelete(null);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />
    </ListPageContent>
  );
};

export default LayoutObjectsListPage;
