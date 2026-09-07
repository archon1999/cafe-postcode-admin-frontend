export const inventoryKeys = {
  all: ['inventory'] as const,
  query: (scope: string, resource: string, params: unknown = {}) => ['inventory', scope, resource, params] as const,
};
