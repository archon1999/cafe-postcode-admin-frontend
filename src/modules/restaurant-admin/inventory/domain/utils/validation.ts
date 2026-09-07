import type { DocumentInput, RecipeInput } from '../entities';

export const isDecimal = (value: string, allowZero = false) =>
  /^\d+(\.\d{1,6})?$/.test(value) &&
  Number.isFinite(Number(value)) &&
  (allowZero ? Number(value) >= 0 : Number(value) > 0);

export function validateDocument(input: DocumentInput, posting = false): string | null {
  if (!input.warehouse || !input.lines.length) return 'validation.warehouseLines';
  if (!input.occurredAt || !Number.isFinite(Date.parse(input.occurredAt))) return 'validation.date';
  if (
    input.lines.some(
      (line) =>
        !line.item ||
        (!(input.kind === 'stocktake' && !posting && line.quantity === null) &&
          (line.quantity === null || !isDecimal(line.quantity, input.kind === 'stocktake'))) ||
        (line.unitCost !== undefined && !isDecimal(line.unitCost, true)),
    )
  )
    return 'validation.quantity';
  if (new Set(input.lines.map((line) => line.item)).size !== input.lines.length) return 'validation.duplicateItem';
  if (input.attachmentUrl && !/^https:\/\//i.test(input.attachmentUrl) && !inventoryAttachmentId(input.attachmentUrl))
    return 'validation.attachment';
  if (posting && (!input.reference.trim() || !input.responsibleName.trim())) return 'validation.referenceResponsible';
  if (posting && ['receipt', 'supplier_return'].includes(input.kind) && !input.supplier) return 'validation.supplier';
  if (
    posting &&
    ['issue', 'supplier_return', 'customer_return', 'stocktake'].includes(input.kind) &&
    !input.reason.trim()
  )
    return 'validation.reason';
  return null;
}

export function inventoryAttachmentId(value: string): string | null {
  return (
    value.match(/^(?:https?:\/\/[^/?#]+)?\/api\/v1\/admin\/inventory\/attachments\/([a-f0-9-]+)\/download\/?$/i)?.[1] ||
    null
  );
}

export function validateRecipe(input: RecipeInput): string | null {
  if (!input.catalogItem || !input.lines.length) return 'validation.recipe';
  if (!isDecimal(input.yieldQuantity) || input.lines.some((line) => !line.item || !isDecimal(line.quantity)))
    return 'validation.quantity';
  if (new Set(input.lines.map((line) => `${line.item}:${line.modifierOption ?? ''}`)).size !== input.lines.length)
    return 'validation.duplicateRecipe';
  return null;
}
