import type { GridSortModel } from '@mui/x-data-grid';

export function getOrderingFromSortModel(sortModel: GridSortModel) {
  const activeSort = sortModel[0];
  if (!activeSort?.field || !activeSort.sort) {
    return undefined;
  }

  return activeSort.sort === 'desc' ? `-${activeSort.field}` : activeSort.field;
}
