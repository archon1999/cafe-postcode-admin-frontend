import type { GridColumnVisibilityModel, GridPaginationModel, GridRowSelectionModel } from '@mui/x-data-grid';

export const BACK_TO_QUERY_PARAM = 'backTo';
export const BACK_LABEL_QUERY_PARAM = 'backLabel';
export const BACK_ORIGIN_QUERY_PARAM = 'origin';
export const BACK_ORIGIN_STATEMENT = 'statement';

export const DATA_GRID_PAGE_SIZE_OPTIONS = [1, 10, 20, 50, 100] as const;
export const DEFAULT_PAGINATION_MODEL: GridPaginationModel = { page: 0, pageSize: 10 };
export const DEFAULT_COLUMN_VISIBILITY_MODEL: GridColumnVisibilityModel = {};
export const DEFAULT_SELECTION_MODEL = (): GridRowSelectionModel => ({
  type: 'include',
  ids: new Set(),
});

export { EMPTY_VALUE, EMPTY_VALUE_TEXT, isEmptyValue } from 'shared/ui/EmptyValue';
