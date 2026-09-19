export type CatalogDraftRow = {
  selected: boolean;
  name: string;
  nameRu: string;
  categoryId: string | null;
  categoryName: string;
  categoryMxik: string;
  price: number | null;
  saleUnit: string;
  description: string;
  evidence: string;
  warning: string;
};

export type CatalogDraft = {
  id: string;
  restaurantId: string;
  rows: CatalogDraftRow[];
  revision: number;
  committed: boolean;
  result: { count?: number; created?: Array<{ id: string; name: string }> };
};

export type DraftInput = { text: string; files: File[]; restaurantId: string; categoryId?: string | null };
