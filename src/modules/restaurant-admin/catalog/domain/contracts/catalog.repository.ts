import type {
  AdminPrepStation,
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
} from 'shared/api/admin-types';

export interface CatalogRepository {
  translateName(payload: CatalogNameTranslationPayload): Promise<CatalogNameTranslation>;
  getCategories(): Promise<CatalogCategory[]>;
  getCategoryById(id: string): Promise<CatalogCategory>;
  createCategory(payload: CatalogCategoryPayload): Promise<CatalogCategory>;
  updateCategory(id: string, payload: CatalogCategoryPayload): Promise<CatalogCategory>;
  updateCategorySortOrder(id: string, sortOrder: number): Promise<CatalogCategory>;
  deleteCategory(id: string): Promise<void>;
  getItems(): Promise<CatalogItem[]>;
  getItemById(id: string): Promise<CatalogItem>;
  createItem(payload: CatalogItemPayload): Promise<CatalogItem>;
  updateItem(id: string, payload: CatalogItemPayload): Promise<CatalogItem>;
  updateItemSortOrder(id: string, sortOrder: number): Promise<CatalogItem>;
  deleteItem(id: string): Promise<void>;
  getItemGroups(categoryId?: string): Promise<CatalogItemGroup[]>;
  createItemGroup(payload: CatalogItemGroupPayload): Promise<CatalogItemGroup>;
  updateItemGroup(id: string, payload: CatalogItemGroupPayload): Promise<CatalogItemGroup>;
  deleteItemGroup(id: string): Promise<void>;
  getModifierGroups(): Promise<CatalogModifierGroup[]>;
  getModifierGroupById(id: string): Promise<CatalogModifierGroup>;
  createModifierGroup(payload: CatalogModifierGroupPayload): Promise<CatalogModifierGroup>;
  updateModifierGroup(id: string, payload: CatalogModifierGroupPayload): Promise<CatalogModifierGroup>;
  deleteModifierGroup(id: string): Promise<void>;
  getPrepStations(): Promise<AdminPrepStation[]>;
}
