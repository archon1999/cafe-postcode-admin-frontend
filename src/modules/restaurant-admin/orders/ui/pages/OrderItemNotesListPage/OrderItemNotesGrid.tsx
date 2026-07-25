import Card from '@mui/material/Card';
import type { GridColDef, GridSortModel } from '@mui/x-data-grid';
import { gridClasses } from '@mui/x-data-grid';
import { useCallback, useMemo, useState } from 'react';

import { useBranchScopeColumns } from 'app/layouts/components/branch-scope-columns';
import { getDataGridLocaleText, useTranslate } from 'app/providers/locales';
import { RouterPathHelper } from 'app/routes';
import type { AdminOrderItemNote } from 'shared/api/admin-types';
import { DEFAULT_PAGINATION_MODEL, DEFAULT_COLUMN_VISIBILITY_MODEL } from 'shared/constants';
import { useDataGridPreferences } from 'shared/hooks/use-data-grid-preferences';
import { DataGrid, DataGridEmptyState, withDetailLink } from 'shared/ui/CustomDataGrid';
import { getOrderingFromSortModel } from 'shared/utils/data-grid-ordering';
import { formatDateTime } from 'shared/utils/format-time';

import { useGetOrderItemNotesQuery } from '../../../application';

import {
  DEFAULT_ORDER_ITEM_NOTES_GRID_FILTERS,
  type OrderItemNotesGridFilters,
  OrderItemNotesGridToolbar,
} from './OrderItemNotesGridToolbar';

export function OrderItemNotesGrid() {
  const { t, currentLang } = useTranslate('orders');
  const localeText = useMemo(() => getDataGridLocaleText(currentLang.value), [currentLang.value]);
  const { filters, setFilters, paginationModel, setPaginationModel, columnVisibilityModel, setColumnVisibilityModel } =
    useDataGridPreferences<OrderItemNotesGridFilters>('order-item-notes', {
      filters: DEFAULT_ORDER_ITEM_NOTES_GRID_FILTERS,
      paginationModel: DEFAULT_PAGINATION_MODEL,
      columnVisibilityModel: DEFAULT_COLUMN_VISIBILITY_MODEL,
    });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const query = useGetOrderItemNotesQuery({
    page: paginationModel.page + 1,
    pageSize: paginationModel.pageSize,
    search: filters.search || undefined,
    ordering: getOrderingFromSortModel(sortModel),
  });
  const handleFiltersChange = useCallback(
    (next: OrderItemNotesGridFilters) => {
      setFilters(next);
      setPaginationModel((prev) => ({ ...prev, page: 0 }));
    },
    [setFilters, setPaginationModel],
  );

  const baseColumns = useMemo<GridColDef<AdminOrderItemNote>[]>(
    () => [
      withDetailLink(
        {
          field: 'orderNumber',
          headerName: t('fields.orderNumber'),
          minWidth: 110,
          flex: 0.4,
          valueGetter: (_v, row) => `#${row.orderNumber}`,
        },
        (row) => RouterPathHelper.orderItemNoteView(row.id),
      ),
      { field: 'catalogItemName', headerName: t('fields.item'), minWidth: 220, flex: 0.9 },
      {
        field: 'tableName',
        headerName: t('fields.table'),
        minWidth: 140,
        flex: 0.5,
        valueGetter: (_v, row) => row.tableName || '-',
      },
      { field: 'body', headerName: t('fields.noteBody'), minWidth: 320, flex: 1.6 },
      {
        field: 'createdAt',
        headerName: t('fields.createdAt'),
        minWidth: 170,
        flex: 0.7,
        valueGetter: (_v, row) => formatDateTime(row.createdAt),
      },
    ],
    [t],
  );
  const columns = useBranchScopeColumns(baseColumns);

  return (
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
      <DataGrid
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
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        disableColumnMenu
        slots={{
          noRowsOverlay: () => (
            <DataGridEmptyState
              hasActiveFilters={Boolean(filters.search)}
              noData={{
                title: t('empty.orderItemNotes.noData.title'),
                description: t('empty.orderItemNotes.noData.description'),
              }}
              noResults={{
                title: t('empty.orderItemNotes.noResults.title'),
                description: t('empty.orderItemNotes.noResults.description'),
              }}
            />
          ),
          noResultsOverlay: () => (
            <DataGridEmptyState
              forceFiltered
              noData={{
                title: t('empty.orderItemNotes.noData.title'),
                description: t('empty.orderItemNotes.noData.description'),
              }}
              noResults={{
                title: t('empty.orderItemNotes.noResults.title'),
                description: t('empty.orderItemNotes.noResults.description'),
              }}
            />
          ),
          toolbar: () => (
            <OrderItemNotesGridToolbar
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
