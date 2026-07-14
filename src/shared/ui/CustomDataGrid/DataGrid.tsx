import type { DataGridProps, GridColDef, GridValidRowModel } from '@mui/x-data-grid';
import { DataGrid as MuiDataGrid, useGridApiRef } from '@mui/x-data-grid';
import { cloneElement, isValidElement, useCallback, useEffect, useMemo, useRef } from 'react';

import { DATA_GRID_PAGE_SIZE_OPTIONS } from 'shared/constants';

import { DataGridRefreshContext } from './DataGridRefreshContext';

type CustomDataGridProps<R extends GridValidRowModel = GridValidRowModel> = DataGridProps<R> & {
  onRefresh?: () => void | Promise<unknown>;
  refreshing?: boolean;
  autoRefreshIntervalMs?: number | false;
};

const DEFAULT_DATA_GRID_SX = {
  flex: 1,
  minHeight: 0,
};
const DEFAULT_DATA_GRID_ROW_HEIGHT = 64;
export const DEFAULT_DATA_GRID_AUTO_REFRESH_INTERVAL_MS = 15_000;

export const DataGrid = <R extends GridValidRowModel = GridValidRowModel>({
  sx,
  apiRef: apiRefProp,
  columns,
  rows = [],
  rowCount,
  loading,
  paginationMode,
  rowHeight = DEFAULT_DATA_GRID_ROW_HEIGHT,
  pageSizeOptions = DATA_GRID_PAGE_SIZE_OPTIONS,
  disableRowSelectionOnClick = true,
  disableColumnFilter = true,
  onRefresh,
  refreshing = false,
  autoRefreshIntervalMs = DEFAULT_DATA_GRID_AUTO_REFRESH_INTERVAL_MS,
  ...rest
}: CustomDataGridProps<R>) => {
  const internalApiRef = useGridApiRef();
  const apiRef = apiRefProp ?? internalApiRef;
  const previousRowsRef = useRef(rows);
  const previousRowCountRef = useRef(rowCount);
  const refreshRef = useRef(onRefresh);
  const refreshingRef = useRef(refreshing);
  const hasRefresh = Boolean(onRefresh);

  useEffect(() => {
    refreshRef.current = onRefresh;
    refreshingRef.current = refreshing;
  }, [onRefresh, refreshing]);

  const handleRefresh = useCallback(() => {
    if (!refreshRef.current || refreshingRef.current) return;
    void refreshRef.current();
  }, []);

  useEffect(() => {
    if (!hasRefresh || autoRefreshIntervalMs === false || autoRefreshIntervalMs <= 0) return undefined;

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') handleRefresh();
    }, autoRefreshIntervalMs);

    return () => window.clearInterval(timer);
  }, [autoRefreshIntervalMs, handleRefresh, hasRefresh]);

  const normalizedColumns = useMemo(
    () =>
      columns.map((column) => {
        if (column.type !== 'actions' || !column.getActions) {
          return column;
        }

        return {
          ...column,
          width: column.width ?? 56,
          minWidth: column.minWidth ?? 56,
          maxWidth: column.maxWidth ?? 56,
          getActions: (params) =>
            column.getActions!(params).map((action, index) => {
              if (!isValidElement(action)) {
                return action;
              }

              const explicitShowInMenu = (action.props as { showInMenu?: boolean }).showInMenu;

              return cloneElement(action, {
                key: action.key ?? `${params.id}-action-${index}`,
                showInMenu: explicitShowInMenu ?? true,
              });
            }),
        } satisfies GridColDef<R>;
      }),
    [columns],
  );

  const resolvedRows = useMemo(() => {
    if (paginationMode !== 'server') {
      previousRowsRef.current = rows;

      return rows;
    }

    if (!loading || rows.length > 0) {
      previousRowsRef.current = rows;

      return rows;
    }

    return previousRowsRef.current;
  }, [loading, paginationMode, rows]);

  const resolvedRowCount = useMemo(() => {
    if (paginationMode !== 'server') {
      previousRowCountRef.current = rowCount;

      return rowCount;
    }

    if (!loading || (typeof rowCount === 'number' && rowCount > 0)) {
      previousRowCountRef.current = rowCount;

      return rowCount;
    }

    return previousRowCountRef.current ?? rowCount;
  }, [loading, paginationMode, rowCount]);

  useEffect(() => {
    apiRef.current?.unstable_setColumnVirtualization?.(false);
  }, [apiRef]);

  const refreshContext = useMemo(
    () => ({ onRefresh: hasRefresh ? handleRefresh : undefined, refreshing }),
    [handleRefresh, hasRefresh, refreshing],
  );

  return (
    <DataGridRefreshContext.Provider value={refreshContext}>
      <MuiDataGrid
        {...rest}
        apiRef={apiRef}
        columns={normalizedColumns}
        rows={resolvedRows}
        rowCount={resolvedRowCount}
        loading={loading}
        paginationMode={paginationMode}
        rowHeight={rowHeight}
        pageSizeOptions={pageSizeOptions}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        disableColumnFilter={disableColumnFilter}
        sx={[DEFAULT_DATA_GRID_SX, ...(Array.isArray(sx) ? sx : [sx])]}
      />
    </DataGridRefreshContext.Provider>
  );
};
