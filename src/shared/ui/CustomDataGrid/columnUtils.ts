import Link from '@mui/material/Link';
import type { GridColDef, GridRenderCellParams, GridValidRowModel } from '@mui/x-data-grid';
import { createElement } from 'react';

import { EMPTY_VALUE_TEXT, isEmptyValue, renderEmptyValue } from 'shared/ui/EmptyValue';
import { RouterLink } from 'shared/ui/RouterLink';

export const DEFAULT_COLUMN_CONFIG: Partial<GridColDef> = {
  flex: 1,
  renderCell: (params) => {
    const value = params.value?.toString();
    return renderEmptyValue(value);
  },
};

export const createColumn = <T extends GridValidRowModel = GridValidRowModel>(
  field: string,
  headerName: string,
  overrides: Partial<GridColDef<T>> = {},
): GridColDef<T> => ({
  field,
  headerName,
  ...DEFAULT_COLUMN_CONFIG,
  ...overrides,
});

export const createDateColumn = <T extends GridValidRowModel = GridValidRowModel>(
  field: string,
  headerName: string,
  formatDate: (date: string | Date) => string,
  overrides: Partial<GridColDef<T>> = {},
): GridColDef<T> =>
  createColumn<T>(field, headerName, {
    renderCell: (params) => {
      const value = params.value;
      return renderEmptyValue(value ? formatDate(value) : EMPTY_VALUE_TEXT);
    },
    ...overrides,
  });

export const createColumnFactory = <T extends GridValidRowModel = GridValidRowModel>(
  customDefaults: Partial<GridColDef<T>> = {},
) => {
  return (field: string, headerName: string, overrides: Partial<GridColDef<T>> = {}): GridColDef<T> => ({
    field,
    headerName,
    ...DEFAULT_COLUMN_CONFIG,
    ...customDefaults,
    ...overrides,
  });
};

const DETAIL_LINK_SX = {
  display: 'block',
  minWidth: 0,
  maxWidth: '100%',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  fontWeight: 600,
  color: 'text.primary',
  '&:hover': {
    color: 'primary.main',
  },
};

const getCellDisplayValue = <T extends GridValidRowModel = GridValidRowModel>(
  params: GridRenderCellParams<T>,
): string | number | null => {
  const value = params.formattedValue ?? params.value;

  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    return value;
  }

  return value === null || value === undefined ? null : String(value);
};

export const withDetailLink = <T extends GridValidRowModel = GridValidRowModel>(
  column: GridColDef<T>,
  getHref: (row: T) => string | undefined,
): GridColDef<T> => {
  const originalRenderCell = column.renderCell;

  return {
    ...column,
    renderCell: (params) => {
      const href = getHref(params.row);
      const displayValue = getCellDisplayValue(params);
      const content = originalRenderCell
        ? originalRenderCell(params)
        : renderEmptyValue(isEmptyValue(displayValue) ? EMPTY_VALUE_TEXT : displayValue);

      if (!href || isEmptyValue(displayValue)) {
        return content;
      }

      return createElement(
        Link,
        {
          component: RouterLink,
          href,
          underline: 'hover',
          sx: DETAIL_LINK_SX,
          onClick: (event: { stopPropagation: () => void }) => event.stopPropagation(),
        },
        content,
      );
    },
  };
};
