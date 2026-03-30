import type {
  AdminPrepStation,
  CatalogCategory,
  CatalogCategoryPayload,
  CatalogItem,
  CatalogItemPayload,
} from 'shared/api/admin-types';

export interface CatalogRepository {
  getCategories(): Promise<CatalogCategory[]>;
  getCategoryById(id: string): Promise<CatalogCategory>;
  createCategory(payload: CatalogCategoryPayload): Promise<CatalogCategory>;
  updateCategory(id: string, payload: CatalogCategoryPayload): Promise<CatalogCategory>;
  deleteCategory(id: string): Promise<void>;
  getItems(): Promise<CatalogItem[]>;
  getItemById(id: string): Promise<CatalogItem>;
  createItem(payload: CatalogItemPayload): Promise<CatalogItem>;
  updateItem(id: string, payload: CatalogItemPayload): Promise<CatalogItem>;
  deleteItem(id: string): Promise<void>;
  getPrepStations(): Promise<AdminPrepStation[]>;
}
