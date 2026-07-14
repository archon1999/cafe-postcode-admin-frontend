import { createContext, useContext } from 'react';

export type DataGridRefreshContextValue = {
  onRefresh?: () => void;
  refreshing: boolean;
};

export const DataGridRefreshContext = createContext<DataGridRefreshContextValue>({ refreshing: false });

export function useDataGridRefresh() {
  return useContext(DataGridRefreshContext);
}
