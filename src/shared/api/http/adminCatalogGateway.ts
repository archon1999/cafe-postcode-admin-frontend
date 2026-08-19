import type {
  AdminCatalogCategoriesQueryParams,
  AdminCatalogItemsQueryParams,
  AdminPaginatedResponse,
  CatalogCategory,
  CatalogCategoryPayload,
  CatalogItem,
  CatalogItemPayload,
  CatalogItemGroup,
  CatalogItemGroupPayload,
  CatalogModifierGroup,
  CatalogModifierGroupPayload,
  CatalogNameTranslation,
  CatalogNameTranslationPayload,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminCatalogGateway = {
  translateAdminCatalogName(payload: CatalogNameTranslationPayload) {
    return instance
      .post<CatalogNameTranslation>('/api/v1/admin/catalog/translations/name/', payload)
      .then((response) => response.data);
  },

  getAdminCatalogCategories(params?: AdminCatalogCategoriesQueryParams) {
    return instance
      .get<AdminPaginatedResponse<CatalogCategory>>('/api/v1/admin/catalog/categories/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          isActive: params?.isActive,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminCatalogCategoryById(id: string) {
    return instance.get<CatalogCategory>(`/api/v1/admin/catalog/categories/${id}/`).then((response) => response.data);
  },

  createAdminCatalogCategory(payload: CatalogCategoryPayload | FormData) {
    return instance
      .post<CatalogCategory>('/api/v1/admin/catalog/categories/', payload)
      .then((response) => response.data);
  },

  updateAdminCatalogCategory(id: string, payload: CatalogCategoryPayload | FormData) {
    return instance
      .put<CatalogCategory>(`/api/v1/admin/catalog/categories/${id}/`, payload)
      .then((response) => response.data);
  },

  updateAdminCatalogCategorySortOrder(id: string, sortOrder: number) {
    return instance
      .patch<CatalogCategory>(`/api/v1/admin/catalog/categories/${id}/`, { sortOrder })
      .then((response) => response.data);
  },

  deleteAdminCatalogCategory(id: string) {
    return instance.delete<void>(`/api/v1/admin/catalog/categories/${id}/`).then((response) => response.data);
  },

  getAdminCatalogItems(params?: AdminCatalogItemsQueryParams) {
    return instance
      .get<AdminPaginatedResponse<CatalogItem>>('/api/v1/admin/catalog/items/', {
        params: {
          page: params?.page,
          pageSize: params?.pageSize,
          search: params?.search,
          categoryIdIn: params?.categoryIdIn,
          isActive: params?.isActive,
          isStoplisted: params?.isStoplisted,
          ordering: params?.ordering,
        },
      })
      .then((response) => response.data);
  },

  getAdminCatalogItemById(id: string) {
    return instance.get<CatalogItem>(`/api/v1/admin/catalog/items/${id}/`).then((response) => response.data);
  },

  createAdminCatalogItem(payload: CatalogItemPayload | FormData) {
    return instance.post<CatalogItem>('/api/v1/admin/catalog/items/', payload).then((response) => response.data);
  },

  updateAdminCatalogItem(id: string, payload: CatalogItemPayload | FormData) {
    return instance.put<CatalogItem>(`/api/v1/admin/catalog/items/${id}/`, payload).then((response) => response.data);
  },

  updateAdminCatalogItemSortOrder(id: string, sortOrder: number) {
    return instance
      .patch<CatalogItem>(`/api/v1/admin/catalog/items/${id}/`, { sortOrder })
      .then((response) => response.data);
  },

  deleteAdminCatalogItem(id: string) {
    return instance.delete<void>(`/api/v1/admin/catalog/items/${id}/`).then((response) => response.data);
  },

  getAdminCatalogItemGroups(categoryId?: string) {
    return instance
      .get<CatalogItemGroup[]>('/api/v1/admin/catalog/item-groups/', {
        params: { category: categoryId },
      })
      .then((response) => response.data);
  },

  createAdminCatalogItemGroup(payload: CatalogItemGroupPayload) {
    return instance
      .post<CatalogItemGroup>('/api/v1/admin/catalog/item-groups/', payload)
      .then((response) => response.data);
  },

  updateAdminCatalogItemGroup(id: string, payload: CatalogItemGroupPayload) {
    return instance
      .put<CatalogItemGroup>(`/api/v1/admin/catalog/item-groups/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminCatalogItemGroup(id: string) {
    return instance.delete<void>(`/api/v1/admin/catalog/item-groups/${id}/`).then((response) => response.data);
  },

  getAdminCatalogModifierGroups() {
    return instance
      .get<
        AdminPaginatedResponse<CatalogModifierGroup> | CatalogModifierGroup[]
      >('/api/v1/admin/catalog/modifier-groups/', { params: { page: 1, pageSize: 500 } })
      .then((response) => response.data);
  },

  getAdminCatalogModifierGroupById(id: string) {
    return instance
      .get<CatalogModifierGroup>(`/api/v1/admin/catalog/modifier-groups/${id}/`)
      .then((response) => response.data);
  },

  createAdminCatalogModifierGroup(payload: CatalogModifierGroupPayload) {
    return instance
      .post<CatalogModifierGroup>('/api/v1/admin/catalog/modifier-groups/', payload)
      .then((response) => response.data);
  },

  updateAdminCatalogModifierGroup(id: string, payload: CatalogModifierGroupPayload) {
    return instance
      .put<CatalogModifierGroup>(`/api/v1/admin/catalog/modifier-groups/${id}/`, payload)
      .then((response) => response.data);
  },

  deleteAdminCatalogModifierGroup(id: string) {
    return instance.delete<void>(`/api/v1/admin/catalog/modifier-groups/${id}/`).then((response) => response.data);
  },
};
