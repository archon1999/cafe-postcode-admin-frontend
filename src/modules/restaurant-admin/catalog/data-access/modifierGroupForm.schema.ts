import { z } from 'zod';

const modifierOptionSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Option nomini kiriting'),
  priceDelta: z.coerce.number().int().min(0),
  isDefault: z.boolean(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.boolean(),
});

export const modifierGroupFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Group nomini kiriting'),
    selectionType: z.enum(['single', 'multiple']),
    minSelections: z.coerce.number().int().min(0),
    maxSelections: z.coerce.number().int().min(1),
    sortOrder: z.coerce.number().int().min(0),
    isActive: z.boolean(),
    options: z.array(modifierOptionSchema).min(1, 'Kamida bitta option qo‘shing'),
  })
  .superRefine((values, context) => {
    if (values.selectionType === 'single' && values.maxSelections !== 1) {
      context.addIssue({ code: 'custom', path: ['maxSelections'], message: 'Bitta tanlov uchun maksimum 1 bo‘ladi' });
    }
    if (values.minSelections > values.maxSelections) {
      context.addIssue({ code: 'custom', path: ['minSelections'], message: 'Minimum maksimumdan katta bo‘la olmaydi' });
    }
    const activeCount = values.options.filter((option) => option.isActive).length;
    if (activeCount < values.minSelections) {
      context.addIssue({ code: 'custom', path: ['options'], message: 'Faol optionlar soni minimum tanlovdan kam' });
    }
    const normalizedNames = values.options.map((option) => option.name.trim().toLocaleLowerCase());
    if (new Set(normalizedNames).size !== normalizedNames.length) {
      context.addIssue({ code: 'custom', path: ['options'], message: 'Option nomlari takrorlanmasligi kerak' });
    }
  });

export type ModifierGroupFormInput = z.input<typeof modifierGroupFormSchema>;
export type ModifierGroupFormValues = z.output<typeof modifierGroupFormSchema>;
