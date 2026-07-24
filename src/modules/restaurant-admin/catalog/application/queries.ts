import { useQuery, type UseQueryOptions } from '@tanstack/react-query';

import type {
  AdminCatalogCategoriesQueryParams,
  AdminCatalogItemsQueryParams,
  AdminMxikDetails,
  AdminMxikLookupResult,
  AdminPaginatedResponse,
  AdminPrepStation,
  CatalogCategory,
  CatalogItem,
  CatalogModifierGroup,
} from 'shared/api/admin-types';
import { apiClient } from 'shared/api/http/apiClient';

import { catalogRepository, getMxikDetails, searchMxik } from '../data-access';

import { catalogKeys } from './keys';

export function useGetCatalogCategoriesQuery(
  options?: Omit<UseQueryOptions<CatalogCategory[]>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogRepository.getCategories(),
    ...options,
  });
}

export function useGetCatalogCategoriesListQuery(
  params: AdminCatalogCategoriesQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<CatalogCategory>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: catalogKeys.categoriesList(params),
    queryFn: () => apiClient.getAdminCatalogCategories(params),
    ...options,
  });
}

export function useGetCatalogCategoryByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<CatalogCategory>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: catalogKeys.categoryDetail(id),
    queryFn: () => catalogRepository.getCategoryById(id),
    enabled: Boolean(id),
    ...options,
  });
}

export function useGetCatalogItemsQuery(options?: Omit<UseQueryOptions<CatalogItem[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: catalogKeys.items(),
    queryFn: () => catalogRepository.getItems(),
    ...options,
  });
}

export function useGetCatalogItemsListQuery(
  params: AdminCatalogItemsQueryParams,
  options?: Omit<UseQueryOptions<AdminPaginatedResponse<CatalogItem>>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: catalogKeys.itemsList(params),
    queryFn: () => apiClient.getAdminCatalogItems(params),
    ...options,
  });
}

export function useGetCatalogItemByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<CatalogItem>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: catalogKeys.itemDetail(id),
    queryFn: () => catalogRepository.getItemById(id),
    enabled: Boolean(id),
    ...options,
  });
}

type AdminMxikSearchParams = {
  query?: string;
  lang?: string;
  limit?: number;
};

export function useSearchMxikQuery(
  params: AdminMxikSearchParams,
  options?: Omit<UseQueryOptions<AdminMxikLookupResult[]>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: catalogKeys.mxikSearch(params),
    queryFn: () => searchMxik({ query: params.query ?? '', lang: params.lang, limit: params.limit }),
    enabled: Boolean(params.query?.trim()) && (options?.enabled ?? true),
    ...options,
  });
}

type AdminMxikDetailsParams = {
  code?: string;
  lang?: string;
};

export function useGetMxikDetailsQuery(
  params: AdminMxikDetailsParams,
  options?: Omit<UseQueryOptions<AdminMxikDetails | null>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: catalogKeys.mxikDetail(params.code ?? '', params.lang),
    queryFn: () => getMxikDetails(params.code ?? '', params.lang),
    enabled: Boolean(params.code?.trim()) && (options?.enabled ?? true),
    ...options,
  });
}

export function useGetPrepStationsQuery(options?: Omit<UseQueryOptions<AdminPrepStation[]>, 'queryFn' | 'queryKey'>) {
  return useQuery({
    queryKey: catalogKeys.prepStations(),
    queryFn: () => catalogRepository.getPrepStations(),
    ...options,
  });
}

export function useGetCatalogModifierGroupsQuery(
  options?: Omit<UseQueryOptions<CatalogModifierGroup[]>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: catalogKeys.modifierGroups(),
    queryFn: () => catalogRepository.getModifierGroups(),
    ...options,
  });
}

export function useGetCatalogModifierGroupByIdQuery(
  id: string,
  options?: Omit<UseQueryOptions<CatalogModifierGroup>, 'queryFn' | 'queryKey'>,
) {
  return useQuery({
    queryKey: catalogKeys.modifierGroupDetail(id),
    queryFn: () => catalogRepository.getModifierGroupById(id),
    enabled: Boolean(id),
    ...options,
  });
}
