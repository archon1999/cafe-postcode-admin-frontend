import { useQuery } from '@tanstack/react-query';

import { useAdminScopeStore } from 'modules/auth';
import { useCurrentUser } from 'modules/auth/domain/services/current-user';

import { inventoryRepository } from '../data-access';
import type {
  Balance,
  CatalogOption,
  Insights,
  InventoryDocument,
  InventoryFilters,
  Movement,
  Overview,
  Recipe,
  StockItem,
  Supplier,
  Variance,
  Warehouse,
} from '../domain';

import { inventoryKeys } from './keys';

export function useInventoryAccess() {
  const { profile } = useCurrentUser();
  const restaurantId = useAdminScopeStore((state) => state.selectedRestaurantId);
  const has = (code: string) =>
    Boolean(profile?.isSuperuser || profile?.permissionCodes?.includes(`admin.inventory.${code}`));
  return {
    scope: restaurantId ?? profile?.id ?? '',
    ready: Boolean(profile && (!profile.isSuperuser || restaurantId)),
    canManage: has('manage'),
    canPost: has('post'),
    canViewCost: has('view_cost'),
    canAnalyze: has('analyze') && has('view') && has('view_cost'),
  };
}

type ReferenceData = {
  warehouses: Warehouse[];
  items: StockItem[];
  suppliers: Supplier[];
  recipes: Recipe[];
  catalogOptions: CatalogOption[];
};
export function useInventoryReference<T extends keyof ReferenceData>(resource: T, enabled = true) {
  const { scope, ready } = useInventoryAccess();
  return useQuery<ReferenceData[T]>({
    queryKey: inventoryKeys.query(scope, resource),
    queryFn: () => inventoryRepository[resource]() as Promise<ReferenceData[T]>,
    enabled: ready && enabled,
  });
}

type ReportData = {
  documents: InventoryDocument[];
  balances: Balance[];
  movements: Movement[];
  overview: Overview;
  variance: Variance[];
  insights: Insights;
};
export function useInventoryReport<T extends keyof ReportData>(resource: T, filters: InventoryFilters, enabled = true) {
  const { scope, ready } = useInventoryAccess();
  return useQuery<ReportData[T]>({
    queryKey: inventoryKeys.query(scope, resource, filters),
    queryFn: () => inventoryRepository[resource](filters) as Promise<ReportData[T]>,
    enabled: ready && enabled,
  });
}

export function useInventoryDocument(id: string | null) {
  const { scope, ready } = useInventoryAccess();
  return useQuery({
    queryKey: inventoryKeys.query(scope, 'document', id),
    queryFn: () => inventoryRepository.document(id!),
    enabled: ready && Boolean(id),
  });
}
