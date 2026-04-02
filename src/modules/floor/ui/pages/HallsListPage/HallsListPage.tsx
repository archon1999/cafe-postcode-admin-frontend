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
import { useMatch } from 'react-router';

import { useAdminCreateAccess } from 'app/layouts/components/admin-scope-access';
import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RoutePath, RouterPathHelper } from 'app/routes';
import type { AdminHall } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState } from 'shared/ui/CustomDataGrid';
import { ConfirmDialog } from 'shared/ui/CustomDialog';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { RouterLink } from 'shared/ui/RouterLink';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';

import { useDeleteHallMutation, useGetFloorHallsListQuery } from '../../../application';
import { FloorGridToolbar } from '../../components/FloorGridToolbar';
import { HallDialog } from '../../components/HallDialog/HallDialog';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };
const DEFAULT_SORT_MODEL: GridSortModel = [{ field: 'sortOrder', sort: 'asc' }];

const HallsListPage = () => {
  const { t, currentLang } = useTranslate('floor');
  const { t: tCommon } = useTranslate('common');
  const { replace } = useRouter();
  const { disabled: isCreateDisabled } = useAdminCreateAccess(RoutePath.floorHallCreate);
  const deleteMutation = useDeleteHallMutation();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const createMatch = useMatch(RoutePath.floorHallCreate);
  const editMatch = useMatch(RoutePath.floorHallEdit);

  const [paginationModel, setPaginationModel] = useState(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(DEFAULT_COLUMN_VISIBILITY_MODEL);
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>(DEFAULT_SORT_MODEL);
  const [hallToDelete, setHallToDelete] = useState<AdminHall | null>(null);
  const query = useGetFloorHallsListQuery({
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

  const hasActiveFilters = Boolean(search || statuses.length);

  const columns = useMemo<GridColDef<AdminHall>[]>(
    () => [
      { field: 'name', headerName: t('fields.name'), minWidth: 220, flex: 1 },
      { field: 'description', headerName: t('fields.description'), minWidth: 220, flex: 1 },
      {
        field: 'zoneOrCabin',
        headerName: t('fields.zone'),
        minWidth: 220,
        flex: 1,
        sortable: false,
        valueGetter: (_value, row) => row.zoneOrCabin?.name ?? t('labels.notSelected'),
        renderCell: ({ row }) => (
          <Chip size="small" variant="soft" label={row.zoneOrCabin?.name ?? t('labels.notSelected')} />
        ),
      },
      {
        field: 'sortOrder',
        headerName: t('fields.sortOrder'),
        minWidth: 120,
        flex: 0.4,
        valueGetter: (_v, row) => row.sortOrder ?? 0,
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
            href={RouterPathHelper.floorHallEdit(params.row.id)}
          />,
          <CustomGridActionsCellItem
            actionKind="constructor"
            key="constructor"
            label={t('actions.constructor')}
            icon={<Iconify icon="solar:ruler-pen-bold" />}
            href={RouterPathHelper.floorHallConstructor(params.row.id)}
          />,
          <CustomGridActionsCellItem
            actionKind="delete"
            key="delete"
            label={t('actions.delete')}
            icon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={() => setHallToDelete(params.row)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  const activeHallId = editMatch?.params.id ?? null;
  const isDialogOpen = Boolean(createMatch || editMatch);

  return (
    <ListPageContent>
      <CustomBreadcrumbs
        heading={t('pages.halls.title')}
        action={
          <Button
            component={RouterLink}
            href={RoutePath.floorHallCreate}
            variant="contained"
            color="black"
            startIcon={<Iconify icon="mingcute:add-line" />}
            disabled={isCreateDisabled}>
            {t('actions.createHall')}
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
                  noData={{ title: t('empty.halls.noData.title'), description: t('empty.halls.noData.description') }}
                  noResults={{
                    title: t('empty.halls.noResults.title'),
                    description: t('empty.halls.noResults.description'),
                  }}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={{ title: t('empty.halls.noData.title'), description: t('empty.halls.noData.description') }}
                  noResults={{
                    title: t('empty.halls.noResults.title'),
                    description: t('empty.halls.noResults.description'),
                  }}
                />
              ),
              toolbar: () => (
                <FloorGridToolbar
                  searchLabel={t('filters.search')}
                  searchPlaceholder={t('filters.searchHallsPlaceholder')}
                  clearSearchLabel={t('filters.clearSearch')}
                  search={search}
                  onSearchChange={setSearch}
                  onClearSearch={() => setSearch('')}
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
                      testId: 'halls-status-filter',
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
        open={Boolean(hallToDelete)}
        onClose={() => setHallToDelete(null)}
        title={t('dialogs.deleteHall.title')}
        content={t('dialogs.deleteHall.description', { name: hallToDelete?.name ?? '' })}
        action={
          <Button
            color="error"
            variant="contained"
            loading={deleteMutation.isPending}
            onClick={async () => {
              if (!hallToDelete) return;
              await deleteMutation.mutateAsync(hallToDelete.id);
              setHallToDelete(null);
            }}>
            {t('actions.delete')}
          </Button>
        }
      />
      <HallDialog open={isDialogOpen} hallId={activeHallId} onClose={() => replace(RoutePath.floorHallList)} />
    </ListPageContent>
  );
};

export default HallsListPage;
