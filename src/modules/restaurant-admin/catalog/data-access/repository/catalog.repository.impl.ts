import { apiClient } from 'shared/api/http/apiClient';

import type { CatalogRepository } from '../../domain';
import { buildCatalogCategoryFormData, buildCatalogItemFormData } from '../catalogFormData';

export const catalogRepository: CatalogRepository = {
  getCategories() {
    return apiClient.getAdminCatalogCategories({ page: 1, pageSize: 500 }).then((response) => response.data);
  },

  getCategoryById(id: string) {
    return apiClient.getAdminCatalogCategoryById(id);
  },

  createCategory(payload) {
    return apiClient.createAdminCatalogCategory(buildCatalogCategoryFormData(payload));
  },

  updateCategory(id, payload) {
    return apiClient.updateAdminCatalogCategory(id, buildCatalogCategoryFormData(payload));
  },

  updateCategorySortOrder(id, sortOrder) {
    return apiClient.updateAdminCatalogCategorySortOrder(id, sortOrder);
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
    return apiClient.createAdminCatalogItem(buildCatalogItemFormData(payload));
  },

  updateItem(id, payload) {
    return apiClient.updateAdminCatalogItem(id, buildCatalogItemFormData(payload));
  },

  updateItemSortOrder(id, sortOrder) {
    return apiClient.updateAdminCatalogItemSortOrder(id, sortOrder);
  },

  deleteItem(id: string) {
    return apiClient.deleteAdminCatalogItem(id);
  },

  getModifierGroups() {
    return apiClient
      .getAdminCatalogModifierGroups()
      .then((response) => (Array.isArray(response) ? response : response.data));
  },

  getModifierGroupById(id: string) {
    return apiClient.getAdminCatalogModifierGroupById(id);
  },

  createModifierGroup(payload) {
    return apiClient.createAdminCatalogModifierGroup(payload);
  },

  updateModifierGroup(id, payload) {
    return apiClient.updateAdminCatalogModifierGroup(id, payload);
  },

  deleteModifierGroup(id: string) {
    return apiClient.deleteAdminCatalogModifierGroup(id);
  },

  getPrepStations() {
    return apiClient.getAdminPrepStations({ page: 1, pageSize: 500 }).then((response) => response.data);
  },
};
