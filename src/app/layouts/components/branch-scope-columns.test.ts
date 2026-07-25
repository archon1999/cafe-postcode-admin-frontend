import type { GridColDef } from '@mui/x-data-grid';
import { describe, expect, it } from 'vitest';

import { insertBranchColumn, type BranchScopedRow } from './branch-scope-columns.utils';

describe('insertBranchColumn', () => {
  it('inserts the branch as the second column', () => {
    const columns: GridColDef<BranchScopedRow>[] = [
      { field: 'name', headerName: 'Name' },
      { field: 'status', headerName: 'Status' },
    ];

    expect(insertBranchColumn(columns, 'Shahobcha').map((column) => column.field)).toEqual([
      'name',
      'restaurantName',
      'status',
    ]);
  });

  it('does not duplicate an existing branch column', () => {
    const columns: GridColDef<BranchScopedRow>[] = [
      { field: 'name', headerName: 'Name' },
      { field: 'restaurantName', headerName: 'Shahobcha' },
    ];

    expect(insertBranchColumn(columns, 'Shahobcha')).toBe(columns);
  });
});
