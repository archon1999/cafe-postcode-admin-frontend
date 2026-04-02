import { useTranslate } from 'app/providers/locales';
import {
  DataGridFiltersToolbar,
  type DataGridToolbarFilter,
} from 'shared/ui/CustomDataGrid';
import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';

type KitchenGridToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  statuses: string[];
  onStatusesApply: (values: string[]) => void;
  prepStationIds: string[];
  onPrepStationIdsApply: (values: string[]) => void;
  routedViaValues: string[];
  onRoutedViaValuesApply: (values: string[]) => void;
  printedValues: string[];
  onPrintedValuesApply: (values: string[]) => void;
  statusOptions: DataGridToolbarFilter['options'];
  prepStationOptions: DataGridToolbarFilter['options'];
  routedViaOptions: DataGridToolbarFilter['options'];
  printedOptions: DataGridToolbarFilter['options'];
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function KitchenGridToolbar({
  search,
  onSearchChange,
  onClearSearch,
  statuses,
  onStatusesApply,
  prepStationIds,
  onPrepStationIdsApply,
  routedViaValues,
  onRoutedViaValuesApply,
  printedValues,
  onPrintedValuesApply,
  statusOptions,
  prepStationOptions,
  routedViaOptions,
  printedOptions,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: KitchenGridToolbarProps) {
  const { t } = useTranslate('kitchen');
  const filters: DataGridToolbarFilter[] = [
    {
      id: 'statuses',
      label: t('filters.status'),
      value: statuses,
      options: statusOptions,
      onApply: onStatusesApply,
      emptyLabel: t('filters.all'),
      testId: 'kitchen-tickets-status-filter',
    },
    {
      id: 'prepStationIds',
      label: t('filters.prepStation'),
      value: prepStationIds,
      options: prepStationOptions,
      onApply: onPrepStationIdsApply,
      emptyLabel: t('filters.all'),
      testId: 'kitchen-tickets-prep-station-filter',
    },
    {
      id: 'routedViaValues',
      label: t('filters.routedVia'),
      value: routedViaValues,
      options: routedViaOptions,
      onApply: onRoutedViaValuesApply,
      emptyLabel: t('filters.all'),
      testId: 'kitchen-tickets-routed-via-filter',
    },
    {
      id: 'printedValues',
      label: t('filters.printed'),
      value: printedValues,
      options: printedOptions,
      onApply: onPrintedValuesApply,
      emptyLabel: t('filters.all'),
      testId: 'kitchen-tickets-printed-filter',
    },
  ];

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchPlaceholder')}
      clearSearchLabel={t('filters.clearSearch')}
      search={search}
      onSearchChange={onSearchChange}
      onClearSearch={onClearSearch}
      searchInputTestId="kitchen-tickets-search"
      filters={filters}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      defaultColumnVisibilityModel={defaultColumnVisibilityModel}
      onSaveColumns={onSaveColumns}
    />
  );
}
