import { z } from 'zod';

import { SALE_UNIT_IDS } from 'shared/domain/sale-units';

const mxikOptionSchema = z
  .object({
    value: z.string().min(1),
    code: z.string().min(1),
    label: z.string().min(1),
    name: z.string().optional(),
    raw: z.record(z.string(), z.unknown()).optional(),
  })
  .nullable()
  .optional();

const imageFieldSchema = z.custom<File | string | null | undefined>(
  (value) => value === undefined || value === null || typeof value === 'string' || value instanceof File,
);

export const catalogItemFormSchema = z
  .object({
    nameUz: z.string(),
    nameUzCrl: z.string(),
    nameRu: z.string(),
    category: z.string().optional(),
    description: z.string().optional(),
    mxik: mxikOptionSchema,
    barcode: z
      .string()
      .trim()
      .regex(/^(?:[0-9]{8}|[0-9]{12,14})?$/)
      .optional()
      .default(''),
    imageFile: imageFieldSchema.optional(),
    imageSource: z.enum(['mxik-cache', 'manual', '']),
    clearImage: z.boolean(),
    restoreMxikImage: z.boolean(),
    itemType: z.enum(['product', 'service']).default('product'),
    price: z.preprocess(
      (value) => (value === '' || value === null || value === undefined ? 0 : value),
      z.coerce.number().int().min(0),
    ),
    saleUnit: z.enum(SALE_UNIT_IDS).default('piece'),
    modifierGroups: z.array(z.string()).default([]),
    isActive: z.boolean(),
    isStoplisted: z.boolean(),
  })
  .refine((values) => Boolean(values.nameUz.trim() || values.nameUzCrl.trim() || values.nameRu.trim()), {
    message: 'Kamida bitta tildagi nom talab qilinadi',
    path: ['nameUz'],
  });

export type CatalogItemFormInput = z.input<typeof catalogItemFormSchema>;
export type CatalogItemFormValues = z.output<typeof catalogItemFormSchema>;
