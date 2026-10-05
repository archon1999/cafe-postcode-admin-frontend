import { apiClient } from 'shared/api/http/apiClient';

import type { CatalogRepository } from '../../domain';
import { buildCatalogCategoryFormData, buildCatalogItemFormData } from '../catalogFormData';
import { resolveCatalogMxikPayload } from '../catalogMxikPayload';
import { searchMxikByBarcode } from '../mxikClient';

export const catalogRepository: CatalogRepository = {
  searchMxikByBarcode,
  translateName(payload) {
    return apiClient.translateAdminCatalogName(payload);
  },

  getCategories() {
    return apiClient.getAdminCatalogCategories({ page: 1, pageSize: 500 }).then((response) => response.data);
  },

  getCategoryById(id: string) {
    return apiClient.getAdminCatalogCategoryById(id);
  },

  async createCategory(payload) {
    const mxikPayload = await resolveCatalogMxikPayload(payload.mxikCode, payload.mxikPayload);
    return apiClient.createAdminCatalogCategory(buildCatalogCategoryFormData({ ...payload, mxikPayload }));
  },

  async updateCategory(id, payload) {
    const mxikPayload = await resolveCatalogMxikPayload(payload.mxikCode, payload.mxikPayload);
    return apiClient.updateAdminCatalogCategory(id, buildCatalogCategoryFormData({ ...payload, mxikPayload }));
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

  async createItem(payload) {
    const mxikPayload = await resolveCatalogMxikPayload(payload.mxikCode, payload.mxikPayload);
    return apiClient.createAdminCatalogItem(buildCatalogItemFormData({ ...payload, mxikPayload }));
  },

  async updateItem(id, payload) {
    const mxikPayload = await resolveCatalogMxikPayload(payload.mxikCode, payload.mxikPayload);
    return apiClient.updateAdminCatalogItem(id, buildCatalogItemFormData({ ...payload, mxikPayload }));
  },

  updateItemSortOrder(id, sortOrder) {
    return apiClient.updateAdminCatalogItemSortOrder(id, sortOrder);
  },

  deleteItem(id: string) {
    return apiClient.deleteAdminCatalogItem(id);
  },

  getItemGroups(categoryId?: string) {
    return apiClient.getAdminCatalogItemGroups(categoryId);
  },

  createItemGroup(payload) {
    return apiClient.createAdminCatalogItemGroup(payload);
  },

  updateItemGroup(id, payload) {
    return apiClient.updateAdminCatalogItemGroup(id, payload);
  },

  deleteItemGroup(id) {
    return apiClient.deleteAdminCatalogItemGroup(id);
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
