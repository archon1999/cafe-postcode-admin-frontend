import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { RECEIPT_KIND_VALUES, RECEIPT_STATUS_VALUES } from '../../../domain';

export type ReceiptsGridFilters = {
  search: string;
  statuses: string[];
  kinds: string[];
};

export const DEFAULT_RECEIPTS_GRID_FILTERS: ReceiptsGridFilters = {
  search: '',
  statuses: [],
  kinds: [],
};

type ReceiptsGridToolbarProps = {
  value: ReceiptsGridFilters;
  onChange: (next: ReceiptsGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function ReceiptsGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: ReceiptsGridToolbarProps) {
  const { t } = useTranslate('orders');
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'statuses',
        label: t('filters.status'),
        value: value.statuses,
        options: RECEIPT_STATUS_VALUES.map((status) => ({
          value: status,
          label: t(`receiptStatuses.${status}`),
        })),
        onApply: (statuses) => onChange({ ...value, statuses }),
        testId: 'receipts-status-filter',
        emptyLabel: t('filters.all'),
      },
      {
        id: 'kinds',
        label: t('filters.kind'),
        value: value.kinds,
        options: RECEIPT_KIND_VALUES.map((kind) => ({
          value: kind,
          label: t(`receiptKinds.${kind}`),
        })),
        onApply: (kinds) => onChange({ ...value, kinds }),
        testId: 'receipts-kind-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [onChange, t, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchReceiptsPlaceholder')}
      clearSearchLabel={t('filters.clearSearch')}
      search={value.search}
      onSearchChange={(search) => onChange({ ...value, search: search.trim() })}
      onClearSearch={() => onChange({ ...value, search: '' })}
      filters={filters}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      defaultColumnVisibilityModel={defaultColumnVisibilityModel}
      onSaveColumns={onSaveColumns}
    />
  );
}
