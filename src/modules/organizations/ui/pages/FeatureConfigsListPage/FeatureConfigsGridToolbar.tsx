import { useMemo } from 'react';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import {
  ORGANIZATION_FEATURE_KITCHEN_MODE_VALUES,
  ORGANIZATION_FEATURE_ORDER_ENTRY_MODE_VALUES,
} from '../../../domain';
import { getFeatureKitchenModeTranslationKey, getFeatureOrderEntryModeTranslationKey } from '../../lib/presenters';

export type FeatureConfigsGridFilters = {
  search: string;
  orderEntryModes: string[];
  kitchenModes: string[];
};

export const DEFAULT_FEATURE_CONFIGS_GRID_FILTERS: FeatureConfigsGridFilters = {
  search: '',
  orderEntryModes: [],
  kitchenModes: [],
};

type FeatureConfigsGridToolbarProps = {
  value: FeatureConfigsGridFilters;
  onChange: (next: FeatureConfigsGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function FeatureConfigsGridToolbar({
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: FeatureConfigsGridToolbarProps) {
  const { t } = useTranslate('organizations');
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'orderEntryModes',
        label: t('filters.orderEntryMode'),
        value: value.orderEntryModes,
        options: ORGANIZATION_FEATURE_ORDER_ENTRY_MODE_VALUES.map((mode) => ({
          value: mode,
          label: t(getFeatureOrderEntryModeTranslationKey(mode)),
        })),
        onApply: (orderEntryModes) => onChange({ ...value, orderEntryModes }),
        testId: 'feature-configs-order-entry-mode-filter',
        emptyLabel: t('filters.all'),
      },
      {
        id: 'kitchenModes',
        label: t('filters.kitchenMode'),
        value: value.kitchenModes,
        options: ORGANIZATION_FEATURE_KITCHEN_MODE_VALUES.map((mode) => ({
          value: mode,
          label: t(getFeatureKitchenModeTranslationKey(mode)),
        })),
        onApply: (kitchenModes) => onChange({ ...value, kitchenModes }),
        testId: 'feature-configs-kitchen-mode-filter',
        emptyLabel: t('filters.all'),
      },
    ],
    [onChange, t, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchFeatureConfigsPlaceholder')}
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
