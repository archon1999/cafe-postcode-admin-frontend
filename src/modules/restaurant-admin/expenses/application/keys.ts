export const expensesKeys = {
  all: ['expenses'] as const,
  categories: ['expenses', 'categories'] as const,
  list: (params: Record<string, unknown>) => ['expenses', 'list', params] as const,
};
