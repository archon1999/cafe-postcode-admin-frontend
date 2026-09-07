import type { DocumentInput, InventoryFilters, RecipeInput } from '../../domain';

export const mapInventoryFilters = (filters: InventoryFilters) =>
  Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== '' && value !== undefined));

export function mapDocumentInput(input: DocumentInput) {
  return {
    ...input,
    supplier: input.supplier || null,
    lines: input.lines.map((line) => ({ ...line, expiresOn: line.expiresOn || null })),
  };
}

export function mapRecipeInput(input: RecipeInput) {
  return {
    catalogItem: input.catalogItem,
    name: input.name,
    yieldQuantity: input.yieldQuantity,
    trigger: input.trigger,
    lines: input.lines.map(({ item, quantity, modifierOption }) => ({
      item,
      quantity,
      modifierOption: modifierOption || null,
    })),
  };
}
