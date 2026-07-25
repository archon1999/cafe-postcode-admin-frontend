import type { GridColumnVisibilityModel, GridPaginationModel } from '@mui/x-data-grid';
import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

import { StorageService } from 'shared/lib/storage';

const STORAGE_PREFIX = 'admin-grid-preferences:v1';

type PersistedGridPreferences<TFilters> = {
  filters: TFilters;
  paginationModel: GridPaginationModel;
  columnVisibilityModel: GridColumnVisibilityModel;
};

type GridPreferenceDefaults<TFilters> = PersistedGridPreferences<TFilters>;

function readPreferences<TFilters>(key: string, defaults: GridPreferenceDefaults<TFilters>) {
  const saved = StorageService.getItem<Partial<PersistedGridPreferences<TFilters>>>(`${STORAGE_PREFIX}:${key}`);

  return {
    filters: { ...defaults.filters, ...(saved?.filters ?? {}) } as TFilters,
    paginationModel: { ...defaults.paginationModel, ...(saved?.paginationModel ?? {}), page: 0 },
    columnVisibilityModel: {
      ...defaults.columnVisibilityModel,
      ...(saved?.columnVisibilityModel ?? {}),
    },
  };
}

export function useDataGridPreferences<TFilters>(key: string, defaults: GridPreferenceDefaults<TFilters>) {
  const [preferences, setPreferences] = useState(() => readPreferences(key, defaults));
  const activeKeyRef = useRef(key);

  useEffect(() => {
    if (activeKeyRef.current === key) return;
    activeKeyRef.current = key;
    setPreferences(readPreferences(key, defaults));
  }, [defaults, key]);

  const update = useCallback(
    <K extends keyof PersistedGridPreferences<TFilters>>(
      field: K,
      value: SetStateAction<PersistedGridPreferences<TFilters>[K]>,
    ) => {
      setPreferences((previous) => {
        const nextValue = typeof value === 'function' ? value(previous[field]) : value;
        const next = { ...previous, [field]: nextValue };
        StorageService.setItem(`${STORAGE_PREFIX}:${key}`, next);
        return next;
      });
    },
    [key],
  );

  const setFilters = useCallback<Dispatch<SetStateAction<TFilters>>>((value) => update('filters', value), [update]);
  const setPaginationModel = useCallback<Dispatch<SetStateAction<GridPaginationModel>>>(
    (value) => update('paginationModel', value),
    [update],
  );
  const setColumnVisibilityModel = useCallback<Dispatch<SetStateAction<GridColumnVisibilityModel>>>(
    (value) => update('columnVisibilityModel', value),
    [update],
  );
  const setFilterField = useCallback(
    <K extends keyof TFilters>(field: K, value: SetStateAction<TFilters[K]>) => {
      setFilters((previous) => ({
        ...previous,
        [field]: typeof value === 'function' ? value(previous[field]) : value,
      }));
    },
    [setFilters],
  );

  return {
    ...preferences,
    setFilters,
    setFilterField,
    setPaginationModel,
    setColumnVisibilityModel,
  };
}
