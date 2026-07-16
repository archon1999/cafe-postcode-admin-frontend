import type {
  AdminCatalogCategoriesQueryParams,
  AdminCatalogItemsQueryParams,
  AdminPaginatedResponse,
  CatalogCategory,
  CatalogCategoryPayload,
  CatalogItem,
  CatalogItemPayload,
} from '../admin-types';

import { instance } from './axiosInstance.ts';

export const adminCatalogGateway = {
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

  deleteAdminCatalogItem(id: string) {
    return instance.delete<void>(`/api/v1/admin/catalog/items/${id}/`).then((response) => response.data);
  },
};
