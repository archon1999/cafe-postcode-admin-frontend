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
import { useCallback, useMemo, useState } from 'react';

import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminOrderItem } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL, DEFAULT_SELECTION_MODEL } from 'shared/constants';
import { useRouter } from 'shared/hooks/router';
import { CustomGridActionsCellItem, DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import { Iconify } from 'shared/ui/Iconify';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatMoney } from 'shared/utils/format-money';

import { useGetOrderItemsQuery } from '../../../application';
import { formatDateTime, getOrderItemStatusColor } from '../../lib/presenters';

import {
  DEFAULT_ORDER_ITEMS_GRID_FILTERS,
  type OrderItemsGridFilters,
  OrderItemsGridToolbar,
} from './OrderItemsGridToolbar';

export function OrderItemsGrid() {
  const { t, currentLang } = useTranslate('orders');
  const { t: tCommon } = useTranslate('common');
  const router = useRouter();
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>(DEFAULT_PAGINATION_MODEL);
  const [filters, setFilters] = useState<OrderItemsGridFilters>(DEFAULT_ORDER_ITEMS_GRID_FILTERS);
  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>(
    DEFAULT_COLUMN_VISIBILITY_MODEL,
  );
  const [selectedRows, setSelectedRows] = useState<GridRowSelectionModel>(DEFAULT_SELECTION_MODEL);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const query = useGetOrderItemsQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    statusIn: filters.statuses.length ? filters.statuses.join(',') : undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const handleFiltersChange = useCallback((next: OrderItemsGridFilters) => {
    setFilters(next);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, []);

  const columns = useMemo<GridColDef<AdminOrderItem>[]>(
    () => [
      withDetailLink(
        {
          field: 'orderNumber',
          headerName: t('fields.orderNumber'),
          minWidth: 110,
          flex: 0.4,
          valueGetter: (_v, row) => `#${row.orderNumber}`,
        },
        (row) => RouterPathHelper.orderItemView(row.id),
      ),
      { field: 'catalogItemName', headerName: t('fields.item'), minWidth: 220, flex: 1 },
      {
        field: 'prepStationName',
        headerName: t('fields.prepStation'),
        minWidth: 180,
        flex: 0.8,
        valueGetter: (_v, row) => row.prepStationName || '-',
      },
      { field: 'quantity', headerName: t('fields.quantity'), minWidth: 100, flex: 0.3 },
      {
        field: 'lineTotal',
        headerName: t('fields.lineTotal'),
        minWidth: 160,
        flex: 0.5,
        valueGetter: (_v, row) => formatMoney(row.lineTotal),
      },
      { field: 'notesCount', headerName: t('fields.notesCount'), minWidth: 120, flex: 0.4 },
      {
        field: 'status',
        headerName: t('fields.status'),
        minWidth: 140,
        flex: 0.5,
        renderCell: ({ row }) => (
          <Chip
            size="small"
            label={t(`orderItemStatuses.${row.status}`)}
            color={getOrderItemStatusColor(row.status)}
            variant="soft"
          />
        ),
      },
      {
        field: 'createdAt',
        headerName: t('fields.createdAt'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_v, row) => formatDateTime(row.createdAt),
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
            href={RouterPathHelper.orderItemView(params.row.id)}
          />,
        ],
      },
    ],
    [t, tCommon],
  );

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
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
        onRowClick={(params) => router.push(RouterPathHelper.orderItemView(params.row.id))}
        slots={{
          noRowsOverlay: () => (
            <DataGridEmptyState
              hasActiveFilters={Boolean(filters.search || filters.statuses.length)}
              noData={{
                title: t('empty.orderItems.noData.title'),
                description: t('empty.orderItems.noData.description'),
              }}
              noResults={{
                title: t('empty.orderItems.noResults.title'),
                description: t('empty.orderItems.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{
                title: t('empty.orderItems.noData.title'),
                description: t('empty.orderItems.noData.description'),
              }}
              noResults={{
                title: t('empty.orderItems.noResults.title'),
                description: t('empty.orderItems.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <OrderItemsGridToolbar
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
  );
}
