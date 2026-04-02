import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import { PAYMENT_METHOD_VALUES, PAYMENT_STATUS_VALUES } from '../../../domain';

export type PaymentsGridFilters = {
  search: string;
  statuses: string[];
  methods: string[];
};

export const DEFAULT_PAYMENTS_GRID_FILTERS: PaymentsGridFilters = {
  search: '',
  statuses: [],
  methods: [],
};

type PaymentsGridToolbarProps = {
  value: PaymentsGridFilters;
  onChange: (next: PaymentsGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function PaymentsGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: PaymentsGridToolbarProps) {
  const { t } = useTranslate('orders');
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'statuses',
        label: t('filters.status'),
        value: value.statuses,
        options: PAYMENT_STATUS_VALUES.map((status) => ({
          value: status,
          label: t(`paymentStatuses.${status}`),
        })),
        onApply: (statuses) => onChange({ ...value, statuses }),
        testId: 'payments-status-filter',
        emptyLabel: t('filters.all'),
      },
      {
        id: 'methods',
        label: t('filters.method'),
        value: value.methods,
        options: PAYMENT_METHOD_VALUES.map((method) => ({
          value: method,
          label: t(`paymentMethods.${method}`),
        })),
        onApply: (methods) => onChange({ ...value, methods }),
        testId: 'payments-method-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [onChange, t, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchPaymentsPlaceholder')}
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
