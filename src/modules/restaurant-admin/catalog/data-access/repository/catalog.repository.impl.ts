import { apiClient } from 'shared/api/http/apiClient';

import type { CatalogRepository } from '../../domain';

export const catalogRepository: CatalogRepository = {
  getCategories() {
    return apiClient.getAdminCatalogCategories({ page: 1, pageSize: 500 }).then((response) => response.data);
  },

  getCategoryById(id: string) {
    return apiClient.getAdminCatalogCategoryById(id);
  },

  createCategory(payload) {
    return apiClient.createAdminCatalogCategory(payload);
  },

  updateCategory(id, payload) {
    return apiClient.updateAdminCatalogCategory(id, payload);
  },

  deleteCategory(id: string) {
    return apiClient.deleteAdminCatalogCategory(id);
  },

  getItems() {
    return apiClient.getAdminCatalogItems({ page: 1, pageSize: 500 }).then((response) => response.data);
  },

  getItemById(id: string) {
    return apiClient.getAdminCatalogItemById(id);
  },

  createItem(payload) {
    return apiClient.createAdminCatalogItem(payload);
  },

  updateItem(id, payload) {
    return apiClient.updateAdminCatalogItem(id, payload);
  },

  deleteItem(id: string) {
    return apiClient.deleteAdminCatalogItem(id);
  },

  getPrepStations() {
    return apiClient.getAdminPrepStations({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
};
