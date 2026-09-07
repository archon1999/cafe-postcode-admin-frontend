import type {
  AiAnalysis,
  Balance,
  CatalogOption,
  DocumentInput,
  Insights,
  InventoryDocument,
  InventoryFilters,
  Movement,
  Overview,
  Recipe,
  RecipeInput,
  ReferenceInput,
  ReferenceKind,
  StockItem,
  Supplier,
  Variance,
  Warehouse,
} from '../entities';

export interface InventoryRepository {
  warehouses(): Promise<Warehouse[]>;
  items(): Promise<StockItem[]>;
  suppliers(): Promise<Supplier[]>;
  saveReference(kind: ReferenceKind, payload: ReferenceInput, id?: string): Promise<unknown>;
  recipes(): Promise<Recipe[]>;
  catalogOptions(): Promise<CatalogOption[]>;
  saveRecipe(payload: RecipeInput): Promise<Recipe>;
  deactivateRecipe(id: string): Promise<unknown>;
  documents(filters: InventoryFilters): Promise<InventoryDocument[]>;
  document(id: string): Promise<InventoryDocument>;
  saveDocument(payload: DocumentInput, id?: string): Promise<InventoryDocument>;
  postDocument(id: string): Promise<InventoryDocument>;
  reverseDocument(id: string, reason: string): Promise<InventoryDocument>;
  balances(filters: InventoryFilters): Promise<Balance[]>;
  movements(filters: InventoryFilters): Promise<Movement[]>;
  overview(filters: InventoryFilters): Promise<Overview>;
  variance(filters: InventoryFilters): Promise<Variance[]>;
  insights(filters: InventoryFilters): Promise<Insights>;
  analyze(warehouse?: string): Promise<AiAnalysis>;
  uploadAttachment(file: File): Promise<{ url: string; name: string }>;
  downloadAttachment(id: string): Promise<Blob>;
  exportReport(report: 'balances' | 'movements' | 'variance', filters: InventoryFilters): Promise<Blob>;
  exportDocument(id: string): Promise<Blob>;
}
