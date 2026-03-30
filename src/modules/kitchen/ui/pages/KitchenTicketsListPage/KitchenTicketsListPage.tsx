import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import type {
  GridColDef,
  GridColumnVisibilityModel,
  GridPaginationModel,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridSortModel,
} from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';

import { ListPageBody, ListPageContent } from 'app/layouts/Dashboard';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminKitchenTicket, KitchenTicketRouteMode, KitchenTicketStatus } from 'shared/api/admin-types';
import { useRouter } from 'shared/hooks/router';
import { CustomBreadcrumbs } from 'shared/ui/CustomBreadcrumbs';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import type { FilterOption } from 'shared/ui/Filters';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatHallDisplayName } from 'shared/utils/format-hall-display';
import { formatDateTime as formatTashkentDateTime } from 'shared/utils/format-time';

import { useGetKitchenPrepStationsQuery, useGetKitchenTicketsQuery } from '../../../application';
import { KitchenGridToolbar } from '../../components/KitchenGridToolbar';

const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
const DEFAULT_SELECTION_MODEL: GridRowSelectionModel = { type: 'include', ids: new Set() };

function formatDateTime(value?: string | null) {
  if (!value) {
    return '-';
  }

  return formatTashkentDateTime(value, 'DD.MM.YYYY HH:mm');
}

function getStatusColor(status: KitchenTicketStatus) {
  switch (status) {
    case 'done':
      return 'success';
    case 'cooking':
      return 'info';
    default:
      return 'warning';
  }
}

function getRoutedViaColor(routedVia: KitchenTicketRouteMode) {
  switch (routedVia) {
    case 'both':
      return 'success';
    case 'printer':
      return 'secondary';
    default:
      return 'info';
  }
}

const KitchenTicketsListPage = () => {
  const { t, currentLang } = useTranslate('kitchen');
  const { t: tCommon } = useTranslate('common');
  const router = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [search, setSearch] = useState('');
  const [statuses, setStatuses] = useState<string[]>([]);
  const [prepStationIds, setPrepStationIds] = useState<string[]>([]);
  const [routedViaValues, setRoutedViaValues] = useState<string[]>([]);
  const [printedValues, setPrintedValues] = useState<string[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const ticketsQuery = useGetKitchenTicketsQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: search || undefined,
    statusIn: statuses.length ? statuses.join(',') : undefined,
    prepStationIdIn: prepStationIds.length ? prepStationIds.join(',') : undefined,
    routedViaIn: routedViaValues.length ? routedViaValues.join(',') : undefined,
    isPrinted: printedValues.length === 1 ? printedValues[0] === 'printed' : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const prepStationsQuery = useGetKitchenPrepStationsQuery();
  const hasActiveFilters = Boolean(
    search || statuses.length || prepStationIds.length || routedViaValues.length || printedValues.length,
  );

  const statusOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'new', label: t('status.new') },
      { value: 'cooking', label: t('status.cooking') },
      { value: 'done', label: t('status.done') },
    ],
    [t],
  );

  const prepStationOptions = useMemo<FilterOption[]>(
    () =>
      (prepStationsQuery.data ?? []).map((prepStation) => ({
        value: prepStation.id,
        label: prepStation.name,
      })),
    [prepStationsQuery.data],
  );

  const routedViaOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'display', label: t('routedVia.display') },
      { value: 'printer', label: t('routedVia.printer') },
      { value: 'both', label: t('routedVia.both') },
    ],
    [t],
  );

  const printedOptions = useMemo<FilterOption[]>(
    () => [
      { value: 'printed', label: t('printed.printed') },
      { value: 'notPrinted', label: t('printed.notPrinted') },
    ],
    [t],
  );

  const columns = useMemo<GridColDef<AdminKitchenTicket>[]>(
    () => [
      withDetailLink(
        {
        field: 'orderNumber',
        headerName: t('fields.orderNumber'),
        minWidth: 130,
        flex: 0.5,
        valueGetter: (_value, row) => `#${row.orderNumber}`,
        },
        (row) => RouterPathHelper.kitchenTicketView(row.id),
      ),
      {
        field: 'prepStationName',
        headerName: t('fields.prepStation'),
        minWidth: 180,
        flex: 0.8,
      },
      {
        field: 'status',
        headerName: t('fields.status'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip size="small" label={t(`status.${row.status}`)} color={getStatusColor(row.status)} variant="soft" />
        ),
      },
      {
        field: 'routedVia',
        headerName: t('fields.routedVia'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={t(`routedVia.${row.routedVia}`)}
            color={getRoutedViaColor(row.routedVia)}
            variant="soft"
          />
        ),
      },
      {
        field: 'isPrinted',
        headerName: t('fields.printed'),
        minWidth: 120,
        flex: 0.4,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={row.isPrinted ? t('printed.printed') : t('printed.notPrinted')}
            color={row.isPrinted ? 'success' : 'default'}
            variant="soft"
          />
        ),
      },
      {
        field: 'hallName',
        headerName: t('fields.hall'),
        minWidth: 160,
        flex: 0.7,
        valueGetter: (_value, row) => formatHallDisplayName(row.hallName, undefined, tCommon),
      },
      {
        field: 'tableName',
        headerName: t('fields.table'),
        minWidth: 140,
        flex: 0.6,
        valueGetter: (_value, row) => row.tableName || '-',
      },
      {
        field: 'waiterName',
        headerName: t('fields.waiter'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_value, row) => row.waiterName || '-',
      },
      {
        field: 'itemsCount',
        headerName: t('fields.itemsCount'),
        minWidth: 120,
        flex: 0.4,
        valueGetter: (_value, row) => row.items.length,
      },
      {
        field: 'createdAt',
        headerName: t('fields.createdAt'),
        minWidth: 170,
        flex: 0.7,
        renderCell: ({ row }: GridRenderCellParams<AdminKitchenTicket>) => formatDateTime(row.createdAt),
      },
      {
        field: 'completedAt',
        headerName: t('fields.completedAt'),
        minWidth: 170,
        flex: 0.7,
        renderCell: ({ row }: GridRenderCellParams<AdminKitchenTicket>) => formatDateTime(row.completedAt),
      },
      {
        type: 'actions',
        field: 'actions',
        headerName: tCommon('actions.title'),
        minWidth: 90,
        getActions: (params) => [
          <CustomGridActionsCellItem
            actionKind="view"
            key="view"
            label={tCommon('labels.details')}
            icon={<Iconify icon="solar:eye-bold" />}
            href={RouterPathHelper.kitchenTicketView(params.row.id)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  const emptyStateMessages = useMemo(
    () => ({
      noData: {
        title: t('empty.kitchenTickets.noData.title'),
        description: t('empty.kitchenTickets.noData.description'),
      },
      noResults: {
        title: t('empty.kitchenTickets.noResults.title'),
        description: t('empty.kitchenTickets.noResults.description'),
      },
    }),
    [t],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value.trim());
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  return (
    <ListPageContent>
      <CustomBreadcrumbs heading={t('pages.list.title')} sx={{ mb: { xs: 3, md: 5 } }} />

      <ListPageBody>
        <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <DataGrid
            checkboxSelection
            rows={ticketsQuery.data?.data ?? []}
            columns={columns}
            rowCount={ticketsQuery.data?.total ?? 0}
            loading={ticketsQuery.isLoading || prepStationsQuery.isLoading}
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
            onRowClick={(params) => router.push(RouterPathHelper.kitchenTicketView(params.row.id))}
            slots={{
              noRowsOverlay: () => (
                <DataGridEmptyState
                  hasActiveFilters={hasActiveFilters}
                  noData={emptyStateMessages.noData}
                  noResults={emptyStateMessages.noResults}
                />
              ),
              noResultsOverlay: () => (
                <DataGridEmptyState
                  forceFiltered
                  noData={emptyStateMessages.noData}
                  noResults={emptyStateMessages.noResults}
                />
              ),
              toolbar: () => (
                <KitchenGridToolbar
                  search={search}
                  onSearchChange={handleSearchChange}
                  onClearSearch={() => handleSearchChange('')}
                  statuses={statuses}
                  onStatusesChange={setStatuses}
                  onStatusesApply={(values) => {
                    setStatuses(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  prepStationIds={prepStationIds}
                  onPrepStationIdsChange={setPrepStationIds}
                  onPrepStationIdsApply={(values) => {
                    setPrepStationIds(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  routedViaValues={routedViaValues}
                  onRoutedViaValuesChange={setRoutedViaValues}
                  onRoutedViaValuesApply={(values) => {
                    setRoutedViaValues(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  printedValues={printedValues}
                  onPrintedValuesChange={setPrintedValues}
                  onPrintedValuesApply={(values) => {
                    setPrintedValues(values);
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                  }}
                  statusOptions={statusOptions}
                  prepStationOptions={prepStationOptions}
                  routedViaOptions={routedViaOptions}
                  printedOptions={printedOptions}
                  columns={columns}
                  columnVisibilityModel={columnVisibilityModel}
                  defaultColumnVisibilityModel={DEFAULT_COLUMN_VISIBILITY_MODEL}
                  onSaveColumns={setColumnVisibilityModel}
                />
              ),
            }}
            sx={{
              border: 'none',
              [`& .${gridClasses.cell}`]: {
                display: 'flex',
                alignItems: 'center',
              },
              [`& .${gridClasses.actionsCell}`]: {
                gap: 0.25,
              },
              '& .MuiDataGrid-toolbarContainer': {
                px: 2.5,
                py: 2,
              },
              '& .MuiDataGrid-columnHeaders': {
                borderTop: (theme) => `1px solid ${theme.vars.palette.divider}`,
              },
            }}
          />
        </Card>
      </ListPageBody>
    </ListPageContent>
  );
};

export default KitchenTicketsListPage;
