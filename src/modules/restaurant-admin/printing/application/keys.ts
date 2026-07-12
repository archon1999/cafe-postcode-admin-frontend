export const printingKeys = {
  all: ['restaurant-admin', 'printing'] as const,
  templates: () => [...printingKeys.all, 'templates'] as const,
  presets: () => [...printingKeys.all, 'presets'] as const,
};
