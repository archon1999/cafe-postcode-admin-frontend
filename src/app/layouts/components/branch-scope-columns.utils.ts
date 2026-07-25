import type { GridColDef, GridValidRowModel } from '@mui/x-data-grid';

export type BranchScopedRow = GridValidRowModel & {
  restaurantName?: string | null;
};

export function insertBranchColumn<R extends BranchScopedRow>(
  columns: GridColDef<R>[],
  headerName: string,
): GridColDef<R>[] {
  if (columns.some((column) => column.field === 'restaurantName')) return columns;

  const branchColumn: GridColDef<R> = {
    field: 'restaurantName',
    headerName,
    minWidth: 180,
    flex: 0.65,
    sortable: false,
    valueGetter: (_value, row) => row.restaurantName || '-',
  };

  return columns.length ? [columns[0], branchColumn, ...columns.slice(1)] : [branchColumn];
}
