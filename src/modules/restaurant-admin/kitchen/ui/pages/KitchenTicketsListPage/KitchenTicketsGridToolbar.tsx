import type { GridColDef, GridColumnVisibilityModel } from '@mui/x-data-grid';
import { useMemo } from 'react';

import { useTranslate } from 'app/providers/locales';
import { DataGridFiltersToolbar, type DataGridToolbarFilter } from 'shared/ui/CustomDataGrid';

import {
  KITCHEN_TICKET_PRINT_STATUS_VALUES,
  KITCHEN_TICKET_ROUTED_VIA_VALUES,
  KITCHEN_TICKET_STATUS_VALUES,
} from '../../../domain';

type PrepStationOption = {
  id: string;
  name: string;
};

export type KitchenTicketsGridFilters = {
  search: string;
  statuses: string[];
  prepStationIds: string[];
  routedViaValues: string[];
  printedValues: string[];
};

export const DEFAULT_KITCHEN_TICKETS_GRID_FILTERS: KitchenTicketsGridFilters = {
  search: '',
  statuses: [],
  prepStationIds: [],
  routedViaValues: [],
  printedValues: [],
};

type KitchenTicketsGridToolbarProps = {
  prepStations: PrepStationOption[];
  value: KitchenTicketsGridFilters;
  onChange: (next: KitchenTicketsGridFilters) => void;
  columns: GridColDef[];
  columnVisibilityModel: GridColumnVisibilityModel;
  defaultColumnVisibilityModel: GridColumnVisibilityModel;
  onSaveColumns: (nextModel: GridColumnVisibilityModel) => void;
};

export function KitchenTicketsGridToolbar({
  prepStations,
  value,
  onChange,
  columns,
  columnVisibilityModel,
  defaultColumnVisibilityModel,
  onSaveColumns,
}: KitchenTicketsGridToolbarProps) {
  const { t } = useTranslate('kitchen');
  const prepStationOptions = useMemo<DataGridToolbarFilter['options']>(
    () =>
      prepStations.map((prepStation) => ({
        value: prepStation.id,
        label: prepStation.name,
      })),
    [prepStations],
  );
  const filters = useMemo<DataGridToolbarFilter[]>(
    () => [
      {
        id: 'statuses',
        label: t('filters.status'),
        value: value.statuses,
        options: KITCHEN_TICKET_STATUS_VALUES.map((status) => ({
          value: status,
          label: t(`status.${status}`),
        })),
        onApply: (statuses) => onChange({ ...value, statuses }),
        emptyLabel: t('filters.all'),
        testId: 'kitchen-tickets-status-filter',
      },
      {
        id: 'prepStationIds',
        label: t('filters.prepStation'),
        value: value.prepStationIds,
        options: prepStationOptions,
        onApply: (prepStationIds) => onChange({ ...value, prepStationIds }),
        emptyLabel: t('filters.all'),
        testId: 'kitchen-tickets-prep-station-filter',
      },
      {
        id: 'routedViaValues',
        label: t('filters.routedVia'),
        value: value.routedViaValues,
        options: KITCHEN_TICKET_ROUTED_VIA_VALUES.map((routedVia) => ({
          value: routedVia,
          label: t(`routedVia.${routedVia}`),
        })),
        onApply: (routedViaValues) => onChange({ ...value, routedViaValues }),
        emptyLabel: t('filters.all'),
        testId: 'kitchen-tickets-routed-via-filter',
      },
      {
        id: 'printedValues',
        label: t('filters.printed'),
        value: value.printedValues,
        options: KITCHEN_TICKET_PRINT_STATUS_VALUES.map((printedStatus) => ({
          value: printedStatus,
          label: t(`printed.${printedStatus}`),
        })),
        onApply: (printedValues) => onChange({ ...value, printedValues }),
        emptyLabel: t('filters.all'),
        testId: 'kitchen-tickets-printed-filter',
      },
    ],
    [onChange, prepStationOptions, t, value],
  );

  return (
    <DataGridFiltersToolbar
      searchLabel={t('filters.search')}
      searchPlaceholder={t('filters.searchPlaceholder')}
      clearSearchLabel={t('filters.clearSearch')}
      search={value.search}
      onSearchChange={(search) => onChange({ ...value, search: search.trim() })}
      onClearSearch={() => onChange({ ...value, search: '' })}
      searchInputTestId="kitchen-tickets-search"
      filters={filters}
      columns={columns}
      columnVisibilityModel={columnVisibilityModel}
      defaultColumnVisibilityModel={defaultColumnVisibilityModel}
      onSaveColumns={onSaveColumns}
    />
  );
}
