import { isEqual } from 'es-toolkit';
import { useLocalStorage } from 'minimal-shared/hooks';
import { getStorage as getStorageValue } from 'minimal-shared/utils';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { SETTINGS_STORAGE_KEY } from '../settings-config';
import type { SettingsState, SettingsProviderProps } from '../types';

import { SettingsContext } from './settings-context';

export function SettingsProvider({
  children,
  defaultSettings,
  storageKey = SETTINGS_STORAGE_KEY,
}: SettingsProviderProps) {
  const { state, setState, resetState, setField } = useLocalStorage<SettingsState>(storageKey, defaultSettings);

  const [openDrawer, setOpenDrawer] = useState(false);

  const onToggleDrawer = useCallback(() => {
    setOpenDrawer((prev) => !prev);
  }, [defaultSettings.version, onReset, storageKey]);

  const onCloseDrawer = useCallback(() => {
    setOpenDrawer(false);
  }, []);

  const canReset = !isEqual(state, defaultSettings);

  const onReset = useCallback(() => {
    resetState(defaultSettings);
  }, [defaultSettings, resetState]);

  useEffect(() => {
    const storedValue = getStorageValue<SettingsState>(storageKey);

    if (storedValue) {
      try {
        if (!storedValue.version || storedValue.version !== defaultSettings.version) {
          onReset();
        }
      } catch {
        onReset();
      }
    }
  }, []);

  const memoizedValue = useMemo(
    () => ({
      canReset,
      onReset,
      openDrawer,
      onCloseDrawer,
      onToggleDrawer,
      state,
      setState,
      setField,
    }),
    [canReset, onReset, openDrawer, onCloseDrawer, onToggleDrawer, state, setField, setState],
  );

  return <SettingsContext value={memoizedValue}>{children}</SettingsContext>;
}
